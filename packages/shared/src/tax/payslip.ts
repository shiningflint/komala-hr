import type { PTKPStatus, RiskClass } from "../schemas/enums";
import type { TaxSettingData } from "./types";
import { calcBPJSKesehatan, calcBPJSKetenagakerjaan } from "./bpjs";
import {
  calcMonthlyPPh21TER,
  calcMonthlyPositionCostDeduction,
  getTERCategory,
  reconcileDecemberPPh21,
} from "./pph21";

export interface PayslipCalcInput {
  basicSalary: number;
  allowances: number;
  overtimePay: number;
  ptkpStatus: PTKPStatus;
  riskClass: RiskClass;
  isDecemberOrFinalMonth: boolean;
  /** Required when isDecemberOrFinalMonth: sums of Jan-Nov figures for the year so far. */
  yearToDate?: {
    grossIncome: number;
    pph21Withheld: number;
    employeeBpjsContributions: number;
  };
}

export interface PayslipCalcResult {
  grossPay: number;
  bpjsKesehatanEmployee: number;
  bpjsKesehatanCompany: number;
  bpjsJhtEmployee: number;
  bpjsJhtCompany: number;
  bpjsJpEmployee: number;
  bpjsJpCompany: number;
  bpjsJkk: number;
  bpjsJkm: number;
  terCategory: string;
  pph21Monthly: number;
  pph21Annual?: number;
  pph21AlreadyWithheld?: number;
  pph21TrueUp?: number;
  pph21Deducted: number;
  netPay: number;
  snapshot: Record<string, unknown>;
}

/** Full monthly payslip computation: gross -> BPJS -> PPh21 (TER, with Dec true-up) -> net. */
export function calcPayslip(settings: TaxSettingData, input: PayslipCalcInput): PayslipCalcResult {
  const grossPay = input.basicSalary + input.allowances + input.overtimePay;

  const kesehatan = calcBPJSKesehatan(settings, grossPay);
  const ketenagakerjaan = calcBPJSKetenagakerjaan(settings, grossPay, input.riskClass);

  const terCategory = getTERCategory(settings, input.ptkpStatus);
  const ter = calcMonthlyPPh21TER(settings, grossPay, terCategory);

  let pph21Deducted = ter.amount;
  let pph21Annual: number | undefined;
  let pph21AlreadyWithheld: number | undefined;
  let pph21TrueUp: number | undefined;

  if (input.isDecemberOrFinalMonth) {
    if (!input.yearToDate) {
      throw new Error("yearToDate figures are required for December/final-month reconciliation");
    }
    const annualGrossIncome = input.yearToDate.grossIncome + grossPay;
    const employeeBpjsThisMonth = kesehatan.employeeContribution + ketenagakerjaan.totalEmployee;
    const annualEmployeeBpjsContributions =
      input.yearToDate.employeeBpjsContributions + employeeBpjsThisMonth;
    const annualPositionCostDeduction = Math.min(annualGrossIncome * 0.05, 500_000 * 12);

    const reconciliation = reconcileDecemberPPh21(settings, {
      annualGrossIncome,
      annualPositionCostDeduction,
      annualEmployeeBpjsContributions,
      pph21AlreadyWithheld: input.yearToDate.pph21Withheld,
      ptkpStatus: input.ptkpStatus,
    });

    pph21Annual = reconciliation.annualPph21;
    pph21AlreadyWithheld = input.yearToDate.pph21Withheld;
    pph21TrueUp = reconciliation.trueUpAmount;
    pph21Deducted = Math.max(0, reconciliation.trueUpAmount);
  }

  const netPay = round(
    grossPay -
      kesehatan.employeeContribution -
      ketenagakerjaan.totalEmployee -
      pph21Deducted
  );

  return {
    grossPay,
    bpjsKesehatanEmployee: kesehatan.employeeContribution,
    bpjsKesehatanCompany: kesehatan.companyContribution,
    bpjsJhtEmployee: ketenagakerjaan.jhtEmployee,
    bpjsJhtCompany: ketenagakerjaan.jhtCompany,
    bpjsJpEmployee: ketenagakerjaan.jpEmployee,
    bpjsJpCompany: ketenagakerjaan.jpCompany,
    bpjsJkk: ketenagakerjaan.jkk,
    bpjsJkm: ketenagakerjaan.jkm,
    terCategory,
    pph21Monthly: ter.amount,
    pph21Annual,
    pph21AlreadyWithheld,
    pph21TrueUp,
    pph21Deducted,
    netPay,
    snapshot: {
      input,
      terRate: ter.rate,
      positionCostDeductionMonthly: calcMonthlyPositionCostDeduction(grossPay),
      kesehatan,
      ketenagakerjaan,
    },
  };
}

function round(value: number): number {
  return Math.round(value);
}
