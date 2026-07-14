"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { officeSchema, departmentSchema, positionSchema } from "@komala/shared";

async function getCompanyId(): Promise<string> {
  const company = await prisma.company.findFirst();
  if (!company) throw new Error("No company configured");
  return company.id;
}

export async function createOffice(formData: FormData) {
  await requireAdmin();
  const companyId = await getCompanyId();
  const parsed = officeSchema.parse({
    name: String(formData.get("name")),
    address: String(formData.get("address") ?? ""),
    latitude: Number(formData.get("latitude")),
    longitude: Number(formData.get("longitude")),
    radiusMeters: Number(formData.get("radiusMeters") || 100),
  });
  await prisma.office.create({ data: { companyId, ...parsed } });
  revalidatePath("/dashboard/offices");
}

export async function updateOffice(officeId: string, formData: FormData) {
  await requireAdmin();
  const parsed = officeSchema.parse({
    name: String(formData.get("name")),
    address: String(formData.get("address") ?? ""),
    latitude: Number(formData.get("latitude")),
    longitude: Number(formData.get("longitude")),
    radiusMeters: Number(formData.get("radiusMeters") || 100),
  });
  await prisma.office.update({ where: { id: officeId }, data: parsed });
  revalidatePath("/dashboard/offices");
}

export async function createDepartment(formData: FormData) {
  await requireAdmin();
  const companyId = await getCompanyId();
  const parsed = departmentSchema.parse({ name: String(formData.get("name")) });
  await prisma.department.create({ data: { companyId, ...parsed } });
  revalidatePath("/dashboard/departments");
}

export async function createPosition(formData: FormData) {
  await requireAdmin();
  const companyId = await getCompanyId();
  const departmentId = String(formData.get("departmentId") || "") || null;
  const parsed = positionSchema.parse({
    name: String(formData.get("name")),
    departmentId,
  });
  await prisma.position.create({
    data: { companyId, name: parsed.name, departmentId: parsed.departmentId },
  });
  revalidatePath("/dashboard/departments");
}
