import type { PTKPStatus, TERCategory } from "../schemas/enums";
import type { TaxSettingData } from "./types";

export function getPTKPAnnualAmount(settings: TaxSettingData, status: PTKPStatus): number {
  return settings.ptkpTable[status];
}

export function getTERCategory(settings: TaxSettingData, status: PTKPStatus): TERCategory {
  return settings.terCategoryMap[status];
}

/**
 * Monthly PPh 21 withholding via the TER (Tarif Efektif Rata-rata) method,
 * mandatory since Jan 2024 (PMK 168/2023) for all months except the final
 * month of the fiscal year / employment, which instead uses
 * `reconcileDecemberPPh21` below.
 */
export function calcMonthlyPPh21TER(
  settings: TaxSettingData,
  grossMonthlyIncome: number,
  terCategory: TERCategory
): { rate: number; amount: number } {
  const brackets = settings.terBrackets[terCategory];
  const bracket =
    brackets.find((b) => b.upTo === null || grossMonthlyIncome <= b.upTo) ??
    brackets[brackets.length - 1];
  const rate = bracket.rate;
  return { rate, amount: round(grossMonthlyIncome * rate) };
}

/**
 * Annual PPh 21 via the progressive Pasal 17 / UU HPP brackets, applied to
 * Penghasilan Kena Pajak (PKP) = annual net income - PTKP. Net income here
 * should already have position-cost deduction and employee BPJS contributions
 * subtracted by the caller (see calcAnnualNetIncome).
 */
export function calcAnnualPPh21Progressive(
  settings: TaxSettingData,
  annualNetIncome: number,
  ptkpStatus: PTKPStatus
): number {
  const ptkp = getPTKPAnnualAmount(settings, ptkpStatus);
  const pkp = Math.max(0, roundDownThousand(annualNetIncome - ptkp));

  let remaining = pkp;
  let tax = 0;
  let lowerBound = 0;
  for (const bracket of settings.progressiveBrackets) {
    const upTo = bracket.upTo ?? Infinity;
    const bracketSize = upTo - lowerBound;
    const taxableInBracket = Math.min(remaining, bracketSize);
    if (taxableInBracket <= 0) break;
    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
    lowerBound = upTo;
    if (remaining <= 0) break;
  }
  return round(tax);
}

export interface DecemberReconciliationInput {
  /** Sum of gross income for Jan-Nov (or Jan through last full month worked). */
  annualGrossIncome: number;
  /** Position cost deduction: 5% of gross, capped (commonly Rp 500,000/month => Rp 6,000,000/year). */
  annualPositionCostDeduction: number;
  /** Employee-paid BPJS contributions for the year (JHT + JP + Kesehatan employee shares). */
  annualEmployeeBpjsContributions: number;
  /** PPh21 already withheld via TER method in prior months of the year. */
  pph21AlreadyWithheld: number;
  ptkpStatus: PTKPStatus;
}

export interface DecemberReconciliationResult {
  annualNetIncome: number;
  annualPph21: number;
  trueUpAmount: number; // positive = additional withholding due in Dec, negative = refund to employee
}

/**
 * December (or final-month-of-employment) true-up: recompute the full year's
 * PPh21 using progressive rates and compare against what TER withholding
 * already collected.
 */
export function reconcileDecemberPPh21(
  settings: TaxSettingData,
  input: DecemberReconciliationInput
): DecemberReconciliationResult {
  const annualNetIncome = Math.max(
    0,
    input.annualGrossIncome -
      input.annualPositionCostDeduction -
      input.annualEmployeeBpjsContributions
  );
  const annualPph21 = calcAnnualPPh21Progressive(settings, annualNetIncome, input.ptkpStatus);
  const trueUpAmount = round(annualPph21 - input.pph21AlreadyWithheld);
  return { annualNetIncome, annualPph21, trueUpAmount };
}

const MAX_MONTHLY_POSITION_COST = 500_000;
const POSITION_COST_RATE = 0.05;

export function calcMonthlyPositionCostDeduction(grossMonthlyIncome: number): number {
  return Math.min(grossMonthlyIncome * POSITION_COST_RATE, MAX_MONTHLY_POSITION_COST);
}

function round(value: number): number {
  return Math.round(value);
}

function roundDownThousand(value: number): number {
  return Math.floor(value / 1000) * 1000;
}
