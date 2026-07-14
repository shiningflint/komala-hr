export const ROLES = ["SUPER_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"] as const;
export type Role = (typeof ROLES)[number];

// Indonesian marital/dependent status used for PTKP (non-taxable income).
// TKn = single (Tidak Kawin) with n dependents, Kn = married (Kawin) with n dependents.
export const PTKP_STATUSES = [
  "TK0",
  "TK1",
  "TK2",
  "TK3",
  "K0",
  "K1",
  "K2",
  "K3",
] as const;
export type PTKPStatus = (typeof PTKP_STATUSES)[number];

export const TER_CATEGORIES = ["A", "B", "C"] as const;
export type TERCategory = (typeof TER_CATEGORIES)[number];

export const EMPLOYMENT_TYPES = ["PERMANENT", "CONTRACT"] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

// BPJS Ketenagakerjaan JKK (workplace accident) risk class, set per employee/position.
export const RISK_CLASSES = ["VERY_LOW", "LOW", "MEDIUM", "HIGH", "VERY_HIGH"] as const;
export type RiskClass = (typeof RISK_CLASSES)[number];

export const ATTENDANCE_STATUSES = ["ON_TIME", "LATE", "ABSENT"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const APPROVAL_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const PAYROLL_PERIOD_STATUSES = ["DRAFT", "PROCESSED", "PAID"] as const;
export type PayrollPeriodStatus = (typeof PAYROLL_PERIOD_STATUSES)[number];
