import { z } from "zod";
import { PTKP_STATUSES, EMPLOYMENT_TYPES, RISK_CLASSES, ROLES } from "./enums";

export const officeSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().int().positive().default(100),
});
export type OfficeInput = z.infer<typeof officeSchema>;

export const departmentSchema = z.object({
  name: z.string().min(1),
});
export type DepartmentInput = z.infer<typeof departmentSchema>;

export const positionSchema = z.object({
  name: z.string().min(1),
  departmentId: z.string().optional().nullable(),
});
export type PositionInput = z.infer<typeof positionSchema>;

export const employeeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: z.enum(ROLES),
  employeeCode: z.string().min(1),
  nik: z.string().min(1),
  npwp: z.string().optional().nullable(),
  ptkpStatus: z.enum(PTKP_STATUSES),
  joinDate: z.coerce.date(),
  employmentType: z.enum(EMPLOYMENT_TYPES).default("PERMANENT"),
  riskClass: z.enum(RISK_CLASSES).default("LOW"),
  basicSalary: z.number().positive(),
  bankName: z.string().optional().nullable(),
  bankAccountNo: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  positionId: z.string().optional().nullable(),
  officeId: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
});
export type EmployeeInput = z.infer<typeof employeeSchema>;
