import { prisma } from "@/lib/prisma";
import { checkGeofence } from "@komala/shared";

const WORK_START_HOUR = 9; // clock-in after this hour counts as LATE

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export interface ClockCoords {
  latitude: number;
  longitude: number;
  accuracyM?: number;
  note?: string;
}

export async function getTodayAttendance(employeeId: string) {
  const today = startOfDay(new Date());
  return prisma.attendanceRecord.findUnique({
    where: { employeeId_date: { employeeId, date: today } },
  });
}

async function resolveOfficeGeofence(employeeId: string) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { office: true },
  });
  if (!employee?.office) {
    throw new Error("Employee has no assigned office to check attendance against");
  }
  return employee.office;
}

export async function clockIn(employeeId: string, coords: ClockCoords) {
  const office = await resolveOfficeGeofence(employeeId);
  const { distanceM, insideGeofence } = checkGeofence(
    coords.latitude,
    coords.longitude,
    office.latitude,
    office.longitude,
    office.radiusMeters
  );

  const now = new Date();
  const today = startOfDay(now);
  const status = now.getHours() >= WORK_START_HOUR ? "LATE" : "ON_TIME";

  const existing = await getTodayAttendance(employeeId);
  if (existing?.clockInAt) {
    throw new Error("Already clocked in today");
  }

  return prisma.attendanceRecord.upsert({
    where: { employeeId_date: { employeeId, date: today } },
    create: {
      employeeId,
      date: today,
      status,
      clockInAt: now,
      clockInLat: coords.latitude,
      clockInLng: coords.longitude,
      clockInAccuracyM: coords.accuracyM,
      clockInDistanceM: distanceM,
      clockInInsideGeofence: insideGeofence,
      clockInNote: coords.note,
    },
    update: {
      status,
      clockInAt: now,
      clockInLat: coords.latitude,
      clockInLng: coords.longitude,
      clockInAccuracyM: coords.accuracyM,
      clockInDistanceM: distanceM,
      clockInInsideGeofence: insideGeofence,
      clockInNote: coords.note,
    },
  });
}

export async function clockOut(employeeId: string, coords: ClockCoords) {
  const office = await resolveOfficeGeofence(employeeId);
  const { distanceM, insideGeofence } = checkGeofence(
    coords.latitude,
    coords.longitude,
    office.latitude,
    office.longitude,
    office.radiusMeters
  );

  const today = startOfDay(new Date());
  const existing = await getTodayAttendance(employeeId);
  if (!existing?.clockInAt) {
    throw new Error("Cannot clock out before clocking in today");
  }
  if (existing.clockOutAt) {
    throw new Error("Already clocked out today");
  }

  return prisma.attendanceRecord.update({
    where: { employeeId_date: { employeeId, date: today } },
    data: {
      clockOutAt: new Date(),
      clockOutLat: coords.latitude,
      clockOutLng: coords.longitude,
      clockOutAccuracyM: coords.accuracyM,
      clockOutDistanceM: distanceM,
      clockOutInsideGeofence: insideGeofence,
      clockOutNote: coords.note,
    },
  });
}

export async function listAttendanceHistory(employeeId: string, limit = 30) {
  return prisma.attendanceRecord.findMany({
    where: { employeeId },
    orderBy: { date: "desc" },
    take: limit,
  });
}

export async function listAllAttendance(params: { date?: Date } = {}) {
  const date = params.date ? startOfDay(params.date) : undefined;
  return prisma.attendanceRecord.findMany({
    where: date ? { date } : undefined,
    include: { employee: { include: { department: true } } },
    orderBy: [{ date: "desc" }],
  });
}
