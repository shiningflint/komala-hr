"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { getTaxSettingsForYear, updatePtkpAndBpjs } from "@/lib/services/tax-settings";
import { PTKP_STATUSES, RISK_CLASSES } from "@komala/shared";

export async function updateTaxSettingsAction(year: number, formData: FormData) {
  await requireAdmin();
  const existing = await getTaxSettingsForYear(year);

  const ptkpTable = { ...existing.ptkpTable };
  for (const status of PTKP_STATUSES) {
    const value = formData.get(`ptkp_${status}`);
    if (value != null) ptkpTable[status] = Number(value);
  }

  const bpjsRates = {
    ...existing.bpjsRates,
    kesehatan: {
      employeeRate: Number(formData.get("bpjs_kesehatan_employee")) / 100,
      companyRate: Number(formData.get("bpjs_kesehatan_company")) / 100,
    },
    jht: {
      employeeRate: Number(formData.get("bpjs_jht_employee")) / 100,
      companyRate: Number(formData.get("bpjs_jht_company")) / 100,
    },
    jp: {
      employeeRate: Number(formData.get("bpjs_jp_employee")) / 100,
      companyRate: Number(formData.get("bpjs_jp_company")) / 100,
    },
    jkm: { companyRate: Number(formData.get("bpjs_jkm_company")) / 100 },
    jkk: { ...existing.bpjsRates.jkk },
  };
  for (const risk of RISK_CLASSES) {
    const value = formData.get(`jkk_${risk}`);
    if (value != null) bpjsRates.jkk[risk] = Number(value) / 100;
  }

  const wageCaps = {
    kesehatan: Number(formData.get("wagecap_kesehatan")),
    jp: Number(formData.get("wagecap_jp")),
  };

  await updatePtkpAndBpjs(year, { ptkpTable, bpjsRates, wageCaps });
  revalidatePath("/dashboard/settings/tax");
}
