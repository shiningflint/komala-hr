import type { PTKPStatus, TERCategory, RiskClass } from "../schemas/enums";

export interface TERBracket {
  /** Upper bound of gross monthly income for this bracket, in Rupiah. `null` = no upper bound. */
  upTo: number | null;
  /** Effective withholding rate applied to gross monthly income within this bracket. */
  rate: number;
}

export interface ProgressiveBracket {
  /** Upper bound of the taxable amount for this bracket, in Rupiah. `null` = no upper bound. */
  upTo: number | null;
  rate: number;
}

export interface BpjsRateSettings {
  kesehatan: { employeeRate: number; companyRate: number };
  jht: { employeeRate: number; companyRate: number };
  jp: { employeeRate: number; companyRate: number };
  jkm: { companyRate: number };
  jkk: Record<RiskClass, number>;
}

export interface WageCapSettings {
  /** Monthly wage ceiling used to cap BPJS Kesehatan contribution base. */
  kesehatan: number;
  /** Monthly wage ceiling used to cap BPJS JP (Jaminan Pensiun) contribution base. */
  jp: number;
}

export interface TaxSettingData {
  effectiveYear: number;
  ptkpTable: Record<PTKPStatus, number>;
  terCategoryMap: Record<PTKPStatus, TERCategory>;
  terBrackets: Record<TERCategory, TERBracket[]>;
  progressiveBrackets: ProgressiveBracket[];
  bpjsRates: BpjsRateSettings;
  wageCaps: WageCapSettings;
  notes?: string;
}
