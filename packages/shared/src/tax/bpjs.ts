import type { RiskClass } from "../schemas/enums";
import type { TaxSettingData } from "./types";

export interface BpjsKesehatanResult {
  base: number;
  employeeContribution: number;
  companyContribution: number;
}

export function calcBPJSKesehatan(
  settings: TaxSettingData,
  grossMonthlyIncome: number
): BpjsKesehatanResult {
  const base = Math.min(grossMonthlyIncome, settings.wageCaps.kesehatan);
  const { employeeRate, companyRate } = settings.bpjsRates.kesehatan;
  return {
    base,
    employeeContribution: round(base * employeeRate),
    companyContribution: round(base * companyRate),
  };
}

export interface BpjsKetenagakerjaanResult {
  jhtEmployee: number;
  jhtCompany: number;
  jpEmployee: number;
  jpCompany: number;
  jkk: number;
  jkm: number;
  totalEmployee: number;
  totalCompany: number;
}

export function calcBPJSKetenagakerjaan(
  settings: TaxSettingData,
  grossMonthlyIncome: number,
  riskClass: RiskClass
): BpjsKetenagakerjaanResult {
  const { jht, jp, jkm, jkk } = settings.bpjsRates;
  const jpBase = Math.min(grossMonthlyIncome, settings.wageCaps.jp);

  const jhtEmployee = round(grossMonthlyIncome * jht.employeeRate);
  const jhtCompany = round(grossMonthlyIncome * jht.companyRate);
  const jpEmployee = round(jpBase * jp.employeeRate);
  const jpCompany = round(jpBase * jp.companyRate);
  const jkkAmount = round(grossMonthlyIncome * jkk[riskClass]);
  const jkmAmount = round(grossMonthlyIncome * jkm.companyRate);

  return {
    jhtEmployee,
    jhtCompany,
    jpEmployee,
    jpCompany,
    jkk: jkkAmount,
    jkm: jkmAmount,
    totalEmployee: jhtEmployee + jpEmployee,
    totalCompany: jhtCompany + jpCompany + jkkAmount + jkmAmount,
  };
}

function round(value: number): number {
  return Math.round(value);
}
