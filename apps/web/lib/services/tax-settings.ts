import { prisma } from "@/lib/prisma";
import type { TaxSettingData } from "@komala/shared";

export async function listTaxSettingYears() {
  return prisma.taxSetting.findMany({
    select: { effectiveYear: true, notes: true },
    orderBy: { effectiveYear: "desc" },
  });
}

export async function getTaxSettingsForYear(year: number): Promise<TaxSettingData> {
  const row = await prisma.taxSetting.findUnique({ where: { effectiveYear: year } });
  if (!row) {
    throw new Error(
      `No tax settings configured for ${year}. Add a TaxSetting row for this year in Tax Settings before running payroll.`
    );
  }
  return {
    effectiveYear: row.effectiveYear,
    ptkpTable: JSON.parse(row.ptkpTable),
    terCategoryMap: JSON.parse(row.terCategoryMap),
    terBrackets: JSON.parse(row.terBrackets),
    progressiveBrackets: JSON.parse(row.progressiveBrackets),
    bpjsRates: JSON.parse(row.bpjsRates),
    wageCaps: JSON.parse(row.wageCaps),
    notes: row.notes ?? undefined,
  };
}

export async function updatePtkpAndBpjs(
  year: number,
  updates: { ptkpTable?: Record<string, number>; bpjsRates?: unknown; wageCaps?: unknown }
) {
  const existing = await getTaxSettingsForYear(year);
  await prisma.taxSetting.update({
    where: { effectiveYear: year },
    data: {
      ptkpTable: JSON.stringify(updates.ptkpTable ?? existing.ptkpTable),
      bpjsRates: JSON.stringify(updates.bpjsRates ?? existing.bpjsRates),
      wageCaps: JSON.stringify(updates.wageCaps ?? existing.wageCaps),
    },
  });
}
