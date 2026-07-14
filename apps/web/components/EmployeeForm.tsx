import {
  PTKP_STATUSES,
  ROLES,
  EMPLOYMENT_TYPES,
  RISK_CLASSES,
} from "@komala/shared";

export interface EmployeeFormOptions {
  departments: { id: string; name: string }[];
  positions: { id: string; name: string; departmentId: string | null }[];
  offices: { id: string; name: string }[];
  managers: { id: string; name: string }[];
}

export interface EmployeeFormInitial {
  name?: string;
  email?: string;
  role?: string;
  employeeCode?: string;
  nik?: string;
  npwp?: string | null;
  ptkpStatus?: string;
  joinDate?: string;
  employmentType?: string;
  riskClass?: string;
  basicSalary?: number;
  bankName?: string | null;
  bankAccountNo?: string | null;
  departmentId?: string | null;
  positionId?: string | null;
  officeId?: string | null;
  managerId?: string | null;
}

export function EmployeeForm({
  action,
  options,
  initial,
  mode,
}: {
  action: (formData: FormData) => Promise<void>;
  options: EmployeeFormOptions;
  initial?: EmployeeFormInitial;
  mode: "create" | "edit";
}) {
  return (
    <form action={action} className="card grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="label">Full name</label>
        <input name="name" className="input" defaultValue={initial?.name} required />
      </div>
      <div>
        <label className="label">Email (login)</label>
        <input name="email" type="email" className="input" defaultValue={initial?.email} required />
      </div>
      {mode === "create" && (
        <div>
          <label className="label">Password (optional)</label>
          <input name="password" type="text" className="input" placeholder="Defaults to Komala123!" />
        </div>
      )}
      <div>
        <label className="label">System role</label>
        <select name="role" className="input" defaultValue={initial?.role ?? "EMPLOYEE"}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Employee code</label>
        <input name="employeeCode" className="input" defaultValue={initial?.employeeCode} required />
      </div>
      <div>
        <label className="label">NIK</label>
        <input name="nik" className="input" defaultValue={initial?.nik} required />
      </div>
      <div>
        <label className="label">NPWP</label>
        <input name="npwp" className="input" defaultValue={initial?.npwp ?? ""} />
      </div>
      <div>
        <label className="label">PTKP status</label>
        <select name="ptkpStatus" className="input" defaultValue={initial?.ptkpStatus ?? "TK0"}>
          {PTKP_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Join date</label>
        <input
          name="joinDate"
          type="date"
          className="input"
          defaultValue={initial?.joinDate}
          required
        />
      </div>
      <div>
        <label className="label">Employment type</label>
        <select name="employmentType" className="input" defaultValue={initial?.employmentType ?? "PERMANENT"}>
          {EMPLOYMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">BPJS JKK risk class</label>
        <select name="riskClass" className="input" defaultValue={initial?.riskClass ?? "LOW"}>
          {RISK_CLASSES.map((r) => (
            <option key={r} value={r}>
              {r.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Basic salary (Rp/month)</label>
        <input
          name="basicSalary"
          type="number"
          className="input"
          defaultValue={initial?.basicSalary}
          required
        />
      </div>
      <div>
        <label className="label">Bank name</label>
        <input name="bankName" className="input" defaultValue={initial?.bankName ?? ""} />
      </div>
      <div>
        <label className="label">Bank account no.</label>
        <input name="bankAccountNo" className="input" defaultValue={initial?.bankAccountNo ?? ""} />
      </div>
      <div>
        <label className="label">Department</label>
        <select name="departmentId" className="input" defaultValue={initial?.departmentId ?? ""}>
          <option value="">—</option>
          {options.departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Position</label>
        <select name="positionId" className="input" defaultValue={initial?.positionId ?? ""}>
          <option value="">—</option>
          {options.positions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Office</label>
        <select name="officeId" className="input" defaultValue={initial?.officeId ?? ""}>
          <option value="">—</option>
          {options.offices.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Manager</label>
        <select name="managerId" className="input" defaultValue={initial?.managerId ?? ""}>
          <option value="">—</option>
          {options.managers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="col-span-full flex justify-end gap-3 pt-2">
        <button type="submit" className="btn-primary">
          {mode === "create" ? "Create employee" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
