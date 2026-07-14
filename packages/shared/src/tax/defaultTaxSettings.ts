import type { TaxSettingData, TERBracket } from "./types";

/**
 * Seed tax configuration for the PPh 21 / BPJS engine.
 *
 * IMPORTANT — READ BEFORE USING FOR REAL PAYROLL:
 * - PTKP amounts (PMK 101/2016) and the progressive annual brackets (Pasal 17 /
 *   UU HPP 2021) are stable, well-published figures and are reproduced here in full.
 * - The monthly TER (Tarif Efektif Rata-rata, PMK 168/2023) bracket tables below
 *   are an ILLUSTRATIVE SUBSET, not the complete official Lampiran, which has
 *   several dozen finely-graduated rows per category. The shape/ordering is
 *   representative but exact thresholds must be cross-checked against the
 *   official PMK 168/2023 attachment (or its DJP successor for the current year)
 *   before this is used to withhold real employee tax.
 * - BPJS Kesehatan/Ketenagakerjaan rates are the long-stable statutory splits;
 *   the JP (Jaminan Pensiun) wage cap in particular is revised periodically by
 *   government regulation and should be reconfirmed every year.
 *
 * All of this is stored as editable `TaxSetting` rows in the database (see the
 * Tax Settings screen), precisely so it can be corrected without a code change.
 */

const PTKP_TABLE = {
  TK0: 54_000_000,
  TK1: 58_500_000,
  TK2: 63_000_000,
  TK3: 67_500_000,
  K0: 58_500_000,
  K1: 63_000_000,
  K2: 67_500_000,
  K3: 72_000_000,
} as const;

const TER_CATEGORY_MAP = {
  TK0: "A",
  TK1: "A",
  K0: "A",
  TK2: "B",
  TK3: "B",
  K1: "B",
  K2: "B",
  K3: "C",
} as const;

const TER_A: TERBracket[] = [
  { upTo: 5_400_000, rate: 0 },
  { upTo: 5_650_000, rate: 0.0025 },
  { upTo: 5_950_000, rate: 0.005 },
  { upTo: 6_300_000, rate: 0.0075 },
  { upTo: 6_750_000, rate: 0.01 },
  { upTo: 7_500_000, rate: 0.0125 },
  { upTo: 8_550_000, rate: 0.015 },
  { upTo: 9_650_000, rate: 0.0175 },
  { upTo: 10_050_000, rate: 0.02 },
  { upTo: 10_700_000, rate: 0.0225 },
  { upTo: 11_050_000, rate: 0.025 },
  { upTo: 11_600_000, rate: 0.03 },
  { upTo: 12_500_000, rate: 0.035 },
  { upTo: 13_750_000, rate: 0.04 },
  { upTo: 15_100_000, rate: 0.05 },
  { upTo: 16_950_000, rate: 0.06 },
  { upTo: 19_750_000, rate: 0.07 },
  { upTo: 24_150_000, rate: 0.08 },
  { upTo: 26_450_000, rate: 0.09 },
  { upTo: 28_000_000, rate: 0.1 },
  { upTo: 30_050_000, rate: 0.11 },
  { upTo: 32_400_000, rate: 0.12 },
  { upTo: 35_400_000, rate: 0.13 },
  { upTo: 39_100_000, rate: 0.14 },
  { upTo: 43_850_000, rate: 0.15 },
  { upTo: 47_800_000, rate: 0.16 },
  { upTo: 51_400_000, rate: 0.17 },
  { upTo: 56_300_000, rate: 0.18 },
  { upTo: 62_200_000, rate: 0.19 },
  { upTo: 68_600_000, rate: 0.2 },
  { upTo: 77_500_000, rate: 0.21 },
  { upTo: 89_000_000, rate: 0.22 },
  { upTo: 103_000_000, rate: 0.23 },
  { upTo: 125_000_000, rate: 0.24 },
  { upTo: 157_000_000, rate: 0.25 },
  { upTo: 206_000_000, rate: 0.26 },
  { upTo: 337_000_000, rate: 0.27 },
  { upTo: 454_000_000, rate: 0.28 },
  { upTo: 550_000_000, rate: 0.29 },
  { upTo: 695_000_000, rate: 0.3 },
  { upTo: 910_000_000, rate: 0.31 },
  { upTo: 1_400_000_000, rate: 0.32 },
  { upTo: null, rate: 0.34 },
];

const TER_B: TERBracket[] = [
  { upTo: 6_200_000, rate: 0 },
  { upTo: 6_500_000, rate: 0.0025 },
  { upTo: 6_850_000, rate: 0.005 },
  { upTo: 7_300_000, rate: 0.0075 },
  { upTo: 9_200_000, rate: 0.01 },
  { upTo: 10_750_000, rate: 0.015 },
  { upTo: 11_250_000, rate: 0.02 },
  { upTo: 11_600_000, rate: 0.025 },
  { upTo: 12_600_000, rate: 0.03 },
  { upTo: 13_600_000, rate: 0.035 },
  { upTo: 14_950_000, rate: 0.04 },
  { upTo: 16_400_000, rate: 0.05 },
  { upTo: 18_450_000, rate: 0.06 },
  { upTo: 21_850_000, rate: 0.07 },
  { upTo: 26_000_000, rate: 0.08 },
  { upTo: 27_700_000, rate: 0.09 },
  { upTo: 29_350_000, rate: 0.1 },
  { upTo: 31_450_000, rate: 0.11 },
  { upTo: 33_950_000, rate: 0.12 },
  { upTo: 37_100_000, rate: 0.13 },
  { upTo: 41_100_000, rate: 0.14 },
  { upTo: 45_800_000, rate: 0.15 },
  { upTo: 49_500_000, rate: 0.16 },
  { upTo: 53_800_000, rate: 0.17 },
  { upTo: 58_500_000, rate: 0.18 },
  { upTo: 64_000_000, rate: 0.19 },
  { upTo: 71_000_000, rate: 0.2 },
  { upTo: 80_000_000, rate: 0.21 },
  { upTo: 93_000_000, rate: 0.22 },
  { upTo: 109_000_000, rate: 0.23 },
  { upTo: 129_000_000, rate: 0.24 },
  { upTo: 163_000_000, rate: 0.25 },
  { upTo: 211_000_000, rate: 0.26 },
  { upTo: 374_000_000, rate: 0.27 },
  { upTo: 459_000_000, rate: 0.28 },
  { upTo: 555_000_000, rate: 0.29 },
  { upTo: 704_000_000, rate: 0.3 },
  { upTo: 957_000_000, rate: 0.31 },
  { upTo: 1_405_000_000, rate: 0.32 },
  { upTo: null, rate: 0.34 },
];

const TER_C: TERBracket[] = [
  { upTo: 6_600_000, rate: 0 },
  { upTo: 6_950_000, rate: 0.0025 },
  { upTo: 7_350_000, rate: 0.005 },
  { upTo: 7_800_000, rate: 0.0075 },
  { upTo: 8_850_000, rate: 0.01 },
  { upTo: 9_800_000, rate: 0.0125 },
  { upTo: 10_950_000, rate: 0.015 },
  { upTo: 11_200_000, rate: 0.0175 },
  { upTo: 12_050_000, rate: 0.02 },
  { upTo: 12_950_000, rate: 0.03 },
  { upTo: 14_150_000, rate: 0.04 },
  { upTo: 15_550_000, rate: 0.05 },
  { upTo: 17_050_000, rate: 0.06 },
  { upTo: 19_500_000, rate: 0.07 },
  { upTo: 22_700_000, rate: 0.08 },
  { upTo: 26_600_000, rate: 0.09 },
  { upTo: 28_100_000, rate: 0.1 },
  { upTo: 30_100_000, rate: 0.11 },
  { upTo: 32_600_000, rate: 0.12 },
  { upTo: 35_400_000, rate: 0.13 },
  { upTo: 39_100_000, rate: 0.14 },
  { upTo: 43_850_000, rate: 0.15 },
  { upTo: 47_800_000, rate: 0.16 },
  { upTo: 51_400_000, rate: 0.17 },
  { upTo: 56_300_000, rate: 0.18 },
  { upTo: 62_200_000, rate: 0.19 },
  { upTo: 68_600_000, rate: 0.2 },
  { upTo: 77_500_000, rate: 0.21 },
  { upTo: 89_000_000, rate: 0.22 },
  { upTo: 103_000_000, rate: 0.23 },
  { upTo: 125_000_000, rate: 0.24 },
  { upTo: 157_000_000, rate: 0.25 },
  { upTo: 206_000_000, rate: 0.26 },
  { upTo: 337_000_000, rate: 0.27 },
  { upTo: 454_000_000, rate: 0.28 },
  { upTo: 550_000_000, rate: 0.29 },
  { upTo: 695_000_000, rate: 0.3 },
  { upTo: 910_000_000, rate: 0.31 },
  { upTo: 1_400_000_000, rate: 0.32 },
  { upTo: null, rate: 0.34 },
];

const PROGRESSIVE_BRACKETS = [
  { upTo: 60_000_000, rate: 0.05 },
  { upTo: 250_000_000, rate: 0.15 },
  { upTo: 500_000_000, rate: 0.25 },
  { upTo: 5_000_000_000, rate: 0.3 },
  { upTo: null, rate: 0.35 },
];

const BPJS_RATES = {
  kesehatan: { employeeRate: 0.01, companyRate: 0.04 },
  jht: { employeeRate: 0.02, companyRate: 0.037 },
  jp: { employeeRate: 0.01, companyRate: 0.02 },
  jkm: { companyRate: 0.003 },
  jkk: {
    VERY_LOW: 0.0024,
    LOW: 0.0054,
    MEDIUM: 0.0089,
    HIGH: 0.0127,
    VERY_HIGH: 0.0174,
  },
} as const;

const WAGE_CAPS = {
  kesehatan: 12_000_000,
  jp: 10_042_300,
};

function buildSettings(effectiveYear: number, notes?: string): TaxSettingData {
  return {
    effectiveYear,
    ptkpTable: PTKP_TABLE,
    terCategoryMap: TER_CATEGORY_MAP,
    terBrackets: { A: TER_A, B: TER_B, C: TER_C },
    progressiveBrackets: PROGRESSIVE_BRACKETS,
    bpjsRates: BPJS_RATES,
    wageCaps: WAGE_CAPS,
    notes,
  };
}

export function getSeedTaxSettings(): TaxSettingData[] {
  return [
    buildSettings(
      2025,
      "Seed data: PTKP + progressive brackets are the stable published figures (PMK 101/2016, UU HPP). " +
        "TER brackets are an illustrative subset per PMK 168/2023 shape, not the full official Lampiran — verify before real payroll."
    ),
    buildSettings(
      2026,
      "Carried over from 2025 seed pending official confirmation of any 2026 updates to TER brackets, PTKP, or BPJS wage caps — verify with DJP/BPJS before use."
    ),
  ];
}
