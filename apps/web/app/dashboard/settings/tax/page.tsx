import { listTaxSettingYears, getTaxSettingsForYear } from "@/lib/services/tax-settings";
import { updateTaxSettingsAction } from "@/lib/actions/tax-settings";
import { PTKP_STATUSES, RISK_CLASSES } from "@komala/shared";

function pct(n: number) {
  return (n * 100).toFixed(2) + "%";
}

// Rounds a 0-1 rate to a clean percentage for form defaultValue (avoids
// floating-point artifacts like 0.037 * 100 === 3.6999999999999997).
function ratePct(n: number) {
  return Math.round(n * 10000) / 100;
}

export default async function TaxSettingsPage({
  searchParams,
}: {
  searchParams: { year?: string };
}) {
  const years = await listTaxSettingYears();
  const year = Number(searchParams.year ?? years[0]?.effectiveYear ?? new Date().getFullYear());
  const settings = await getTaxSettingsForYear(year);
  const action = updateTaxSettingsAction.bind(null, year);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Tax Settings</h1>
        <form className="flex items-center gap-2">
          <select name="year" defaultValue={year} className="input">
            {years.map((y) => (
              <option key={y.effectiveYear} value={y.effectiveYear}>
                {y.effectiveYear}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-secondary">
            View
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>Verify before real payroll use.</strong> PTKP amounts and progressive annual brackets
        here reflect the stable published figures (PMK 101/2016, UU HPP). The monthly TER brackets are
        an illustrative subset of PMK 168/2023's shape, not the full official Lampiran — and BPJS wage
        caps are revised periodically by regulation. Confirm all figures against current DJP/BPJS
        sources before relying on this for statutory withholding.
        {settings.notes && <div className="mt-2 italic">{settings.notes}</div>}
      </div>

      <form action={action} className="card space-y-6">
        <div>
          <h2 className="mb-3 font-medium text-slate-900">PTKP (annual non-taxable income, Rp)</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PTKP_STATUSES.map((s) => (
              <div key={s}>
                <label className="label">{s}</label>
                <input
                  name={`ptkp_${s}`}
                  type="number"
                  className="input"
                  defaultValue={settings.ptkpTable[s]}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-medium text-slate-900">BPJS Kesehatan &amp; Ketenagakerjaan rates (%)</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Kesehatan — employee</label>
              <input
                name="bpjs_kesehatan_employee"
                type="number"
                step="0.01"
                className="input"
                defaultValue={ratePct(settings.bpjsRates.kesehatan.employeeRate)}
              />
            </div>
            <div>
              <label className="label">Kesehatan — company</label>
              <input
                name="bpjs_kesehatan_company"
                type="number"
                step="0.01"
                className="input"
                defaultValue={ratePct(settings.bpjsRates.kesehatan.companyRate)}
              />
            </div>
            <div>
              <label className="label">Kesehatan wage cap (Rp)</label>
              <input
                name="wagecap_kesehatan"
                type="number"
                className="input"
                defaultValue={settings.wageCaps.kesehatan}
              />
            </div>
            <div>
              <label className="label">JHT — employee</label>
              <input
                name="bpjs_jht_employee"
                type="number"
                step="0.01"
                className="input"
                defaultValue={ratePct(settings.bpjsRates.jht.employeeRate)}
              />
            </div>
            <div>
              <label className="label">JHT — company</label>
              <input
                name="bpjs_jht_company"
                type="number"
                step="0.01"
                className="input"
                defaultValue={ratePct(settings.bpjsRates.jht.companyRate)}
              />
            </div>
            <div />
            <div>
              <label className="label">JP — employee</label>
              <input
                name="bpjs_jp_employee"
                type="number"
                step="0.01"
                className="input"
                defaultValue={ratePct(settings.bpjsRates.jp.employeeRate)}
              />
            </div>
            <div>
              <label className="label">JP — company</label>
              <input
                name="bpjs_jp_company"
                type="number"
                step="0.01"
                className="input"
                defaultValue={ratePct(settings.bpjsRates.jp.companyRate)}
              />
            </div>
            <div>
              <label className="label">JP wage cap (Rp)</label>
              <input
                name="wagecap_jp"
                type="number"
                className="input"
                defaultValue={settings.wageCaps.jp}
              />
            </div>
            <div>
              <label className="label">JKM — company</label>
              <input
                name="bpjs_jkm_company"
                type="number"
                step="0.01"
                className="input"
                defaultValue={ratePct(settings.bpjsRates.jkm.companyRate)}
              />
            </div>
          </div>

          <h3 className="mb-2 mt-4 text-sm font-medium text-slate-700">
            JKK (workplace accident) rate by risk class
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {RISK_CLASSES.map((risk) => (
              <div key={risk}>
                <label className="label">{risk.replace("_", " ")}</label>
                <input
                  name={`jkk_${risk}`}
                  type="number"
                  step="0.01"
                  className="input"
                  defaultValue={ratePct(settings.bpjsRates.jkk[risk])}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            Save changes
          </button>
        </div>
      </form>

      <div className="card">
        <h2 className="mb-3 font-medium text-slate-900">
          Progressive annual brackets (Pasal 17 / UU HPP) — read only
        </h2>
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr>
              <th className="py-1">Up to (Rp)</th>
              <th className="py-1">Rate</th>
            </tr>
          </thead>
          <tbody>
            {settings.progressiveBrackets.map((b, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="py-1.5">{b.upTo?.toLocaleString("id-ID") ?? "no limit"}</td>
                <td className="py-1.5">{pct(b.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 className="mb-3 font-medium text-slate-900">
          Monthly TER brackets — read only (illustrative subset, see banner above)
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {(["A", "B", "C"] as const).map((cat) => (
            <div key={cat}>
              <h3 className="mb-2 text-sm font-medium text-slate-700">Category {cat}</h3>
              <div className="max-h-64 overflow-y-auto text-xs">
                <table className="w-full text-left">
                  <tbody>
                    {settings.terBrackets[cat].map((b, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="py-1 pr-2">
                          {b.upTo != null ? b.upTo.toLocaleString("id-ID") : "no limit"}
                        </td>
                        <td className="py-1 text-right">{pct(b.rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
