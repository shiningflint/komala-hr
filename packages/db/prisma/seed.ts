import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  getSeedTaxSettings,
  calcPayslip,
  haversineDistanceMeters,
  type PTKPStatus,
  type RiskClass,
} from "@komala/shared";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Komala123!";

const OFFICE_LAT = -6.2088;
const OFFICE_LNG = 106.8228;
const OFFICE_RADIUS_M = 150;

async function main() {
  console.log("Seeding Komala HR demo data...");

  await prisma.payslip.deleteMany();
  await prisma.payrollPeriod.deleteMany();
  await prisma.reimbursementClaim.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.leaveBalance.deleteMany();
  await prisma.leaveType.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.position.deleteMany();
  await prisma.department.deleteMany();
  await prisma.office.deleteMany();
  await prisma.taxSetting.deleteMany();
  await prisma.company.deleteMany();

  const company = await prisma.company.create({
    data: {
      name: "PT Komala Indonesia",
      npwp: "01.234.567.8-901.000",
      address: "Jl. Jenderal Sudirman, Jakarta Selatan, DKI Jakarta",
    },
  });

  const office = await prisma.office.create({
    data: {
      companyId: company.id,
      name: "Komala HQ Jakarta",
      address: "Jl. Jenderal Sudirman Kav. 1, Jakarta Selatan",
      latitude: OFFICE_LAT,
      longitude: OFFICE_LNG,
      radiusMeters: OFFICE_RADIUS_M,
    },
  });

  const [deptBD, deptHR, deptOps, deptFin] = await Promise.all([
    prisma.department.create({ data: { companyId: company.id, name: "Business Development" } }),
    prisma.department.create({ data: { companyId: company.id, name: "Human Resources" } }),
    prisma.department.create({ data: { companyId: company.id, name: "Operations" } }),
    prisma.department.create({ data: { companyId: company.id, name: "Finance & Admin" } }),
  ]);

  const [posDirector, posHRManager, posOpsManager, posFinStaff, posOpsStaff, posBDStaff] =
    await Promise.all([
      prisma.position.create({ data: { companyId: company.id, departmentId: deptBD.id, name: "Director" } }),
      prisma.position.create({ data: { companyId: company.id, departmentId: deptHR.id, name: "HR Manager" } }),
      prisma.position.create({ data: { companyId: company.id, departmentId: deptOps.id, name: "Operations Manager" } }),
      prisma.position.create({ data: { companyId: company.id, departmentId: deptFin.id, name: "Finance Staff" } }),
      prisma.position.create({ data: { companyId: company.id, departmentId: deptOps.id, name: "Operations Staff" } }),
      prisma.position.create({ data: { companyId: company.id, departmentId: deptBD.id, name: "Business Development Staff" } }),
    ]);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  interface SeedEmployee {
    email: string;
    name: string;
    role: "SUPER_ADMIN" | "HR_ADMIN" | "MANAGER" | "EMPLOYEE";
    employeeCode: string;
    nik: string;
    npwp: string;
    ptkpStatus: PTKPStatus;
    riskClass: RiskClass;
    basicSalary: number;
    positionId: string;
    departmentId: string;
    managerCode: string | null;
  }

  const seedEmployees: SeedEmployee[] = [
    {
      email: "ariek.nugroho@komala.co.id",
      name: "Ariek Nugroho",
      role: "SUPER_ADMIN",
      employeeCode: "KMI-001",
      nik: "3171010101800001",
      npwp: "11.111.111.1-111.000",
      ptkpStatus: "TK0",
      riskClass: "LOW",
      basicSalary: 35_000_000,
      positionId: posDirector.id,
      departmentId: deptBD.id,
      managerCode: null,
    },
    {
      email: "siti.rahayu@komala.co.id",
      name: "Siti Rahayu",
      role: "HR_ADMIN",
      employeeCode: "KMI-002",
      nik: "3171020202850002",
      npwp: "22.222.222.2-222.000",
      ptkpStatus: "K1",
      riskClass: "LOW",
      basicSalary: 18_000_000,
      positionId: posHRManager.id,
      departmentId: deptHR.id,
      managerCode: "KMI-001",
    },
    {
      email: "budi.santoso@komala.co.id",
      name: "Budi Santoso",
      role: "MANAGER",
      employeeCode: "KMI-003",
      nik: "3171030303820003",
      npwp: "33.333.333.3-333.000",
      ptkpStatus: "K3",
      riskClass: "MEDIUM",
      basicSalary: 22_000_000,
      positionId: posOpsManager.id,
      departmentId: deptOps.id,
      managerCode: "KMI-001",
    },
    {
      email: "dewi.lestari@komala.co.id",
      name: "Dewi Lestari",
      role: "EMPLOYEE",
      employeeCode: "KMI-004",
      nik: "3171040404900004",
      npwp: "44.444.444.4-444.000",
      ptkpStatus: "TK1",
      riskClass: "LOW",
      basicSalary: 9_500_000,
      positionId: posFinStaff.id,
      departmentId: deptFin.id,
      managerCode: "KMI-002",
    },
    {
      email: "rian.pratama@komala.co.id",
      name: "Rian Pratama",
      role: "EMPLOYEE",
      employeeCode: "KMI-005",
      nik: "3171050505920005",
      npwp: "55.555.555.5-555.000",
      ptkpStatus: "TK0",
      riskClass: "MEDIUM",
      basicSalary: 8_000_000,
      positionId: posOpsStaff.id,
      departmentId: deptOps.id,
      managerCode: "KMI-003",
    },
    {
      email: "maya.anggraini@komala.co.id",
      name: "Maya Anggraini",
      role: "EMPLOYEE",
      employeeCode: "KMI-006",
      nik: "3171060606910006",
      npwp: "66.666.666.6-666.000",
      ptkpStatus: "K2",
      riskClass: "LOW",
      basicSalary: 10_500_000,
      positionId: posBDStaff.id,
      departmentId: deptBD.id,
      managerCode: "KMI-001",
    },
  ];

  const employeeIdByCode = new Map<string, string>();

  for (const se of seedEmployees) {
    const user = await prisma.user.create({
      data: { email: se.email, passwordHash, role: se.role },
    });
    const employee = await prisma.employee.create({
      data: {
        userId: user.id,
        employeeCode: se.employeeCode,
        name: se.name,
        nik: se.nik,
        npwp: se.npwp,
        ptkpStatus: se.ptkpStatus,
        joinDate: new Date("2022-01-10"),
        employmentType: "PERMANENT",
        riskClass: se.riskClass,
        basicSalary: se.basicSalary,
        bankName: "Bank Mandiri",
        bankAccountNo: `900${se.employeeCode.replace("KMI-", "")}1234`,
        departmentId: se.departmentId,
        positionId: se.positionId,
        officeId: office.id,
        managerId: null, // set in second pass once all employees exist
      },
    });
    employeeIdByCode.set(se.employeeCode, employee.id);
  }

  for (const se of seedEmployees) {
    if (!se.managerCode) continue;
    await prisma.employee.update({
      where: { id: employeeIdByCode.get(se.employeeCode)! },
      data: { managerId: employeeIdByCode.get(se.managerCode) },
    });
  }

  // --- Leave types & balances -------------------------------------------------
  const leaveTypeDefs = [
    { name: "Annual Leave", defaultDaysPerYear: 12 },
    { name: "Sick Leave", defaultDaysPerYear: 12 },
    { name: "Marriage Leave", defaultDaysPerYear: 3 },
    { name: "Bereavement Leave", defaultDaysPerYear: 2 },
  ];
  const leaveTypes = [];
  for (const lt of leaveTypeDefs) {
    leaveTypes.push(
      await prisma.leaveType.create({ data: { companyId: company.id, ...lt } })
    );
  }
  const annualLeave = leaveTypes[0];
  const sickLeave = leaveTypes[1];

  const currentYear = new Date().getFullYear();
  for (const code of employeeIdByCode.keys()) {
    const employeeId = employeeIdByCode.get(code)!;
    for (const lt of leaveTypes) {
      await prisma.leaveBalance.create({
        data: {
          employeeId,
          leaveTypeId: lt.id,
          year: currentYear,
          allocatedDays: lt.defaultDaysPerYear,
          usedDays: 0,
        },
      });
    }
  }

  // --- Sample attendance (last 10 weekdays) -----------------------------------
  const today = new Date();
  const workdays: Date[] = [];
  {
    const cursor = new Date(today);
    while (workdays.length < 10) {
      cursor.setDate(cursor.getDate() - 1);
      const day = cursor.getDay();
      if (day !== 0 && day !== 6) workdays.push(new Date(cursor));
    }
  }

  for (const code of employeeIdByCode.keys()) {
    const employeeId = employeeIdByCode.get(code)!;
    for (const [i, workday] of workdays.entries()) {
      // Occasionally simulate a WFH/field check-in slightly outside the geofence.
      const isOutside = i === 2;
      const jitterLat = isOutside ? 0.01 : (Math.random() - 0.5) * 0.0005;
      const jitterLng = isOutside ? 0.01 : (Math.random() - 0.5) * 0.0005;
      const clockInLat = OFFICE_LAT + jitterLat;
      const clockInLng = OFFICE_LNG + jitterLng;
      const distance = haversineDistanceMeters(clockInLat, clockInLng, OFFICE_LAT, OFFICE_LNG);

      const clockInAt = new Date(workday);
      clockInAt.setHours(8, Math.floor(Math.random() * 20), 0, 0);
      const clockOutAt = new Date(workday);
      clockOutAt.setHours(17, Math.floor(Math.random() * 30), 0, 0);

      await prisma.attendanceRecord.create({
        data: {
          employeeId,
          date: new Date(workday.toDateString()),
          status: clockInAt.getHours() >= 9 ? "LATE" : "ON_TIME",
          clockInAt,
          clockInLat,
          clockInLng,
          clockInAccuracyM: 15,
          clockInDistanceM: distance,
          clockInInsideGeofence: distance <= OFFICE_RADIUS_M,
          clockInNote: isOutside ? "Client site visit" : null,
          clockOutAt,
          clockOutLat: clockInLat,
          clockOutLng: clockInLng,
          clockOutAccuracyM: 15,
          clockOutDistanceM: distance,
          clockOutInsideGeofence: distance <= OFFICE_RADIUS_M,
        },
      });
    }
  }

  // --- Sample leave requests ---------------------------------------------------
  const dewiId = employeeIdByCode.get("KMI-004")!;
  const rianId = employeeIdByCode.get("KMI-005")!;
  const sitiId = employeeIdByCode.get("KMI-002")!;

  await prisma.leaveRequest.create({
    data: {
      employeeId: dewiId,
      leaveTypeId: annualLeave.id,
      startDate: futureDate(10),
      endDate: futureDate(12),
      daysCount: 3,
      reason: "Family trip",
      status: "PENDING",
    },
  });
  await prisma.leaveRequest.create({
    data: {
      employeeId: rianId,
      leaveTypeId: sickLeave.id,
      startDate: pastDate(5),
      endDate: pastDate(5),
      daysCount: 1,
      reason: "Flu",
      status: "APPROVED",
      approverId: sitiId,
      decidedAt: pastDate(5),
    },
  });
  await prisma.leaveBalance.updateMany({
    where: { employeeId: rianId, leaveTypeId: sickLeave.id, year: currentYear },
    data: { usedDays: 1 },
  });

  // --- Sample reimbursement claims ---------------------------------------------
  const mayaId = employeeIdByCode.get("KMI-006")!;
  await prisma.reimbursementClaim.create({
    data: {
      employeeId: mayaId,
      category: "Client Entertainment",
      amount: 850_000,
      description: "Client lunch meeting - potential charter partner",
      status: "PENDING",
    },
  });
  await prisma.reimbursementClaim.create({
    data: {
      employeeId: rianId,
      category: "Transport",
      amount: 250_000,
      description: "Grab to site visit",
      status: "APPROVED",
      approverId: sitiId,
      decidedAt: pastDate(3),
    },
  });

  // --- Tax settings -------------------------------------------------------------
  for (const settings of getSeedTaxSettings()) {
    await prisma.taxSetting.create({
      data: {
        effectiveYear: settings.effectiveYear,
        ptkpTable: JSON.stringify(settings.ptkpTable),
        terCategoryMap: JSON.stringify(settings.terCategoryMap),
        terBrackets: JSON.stringify(settings.terBrackets),
        progressiveBrackets: JSON.stringify(settings.progressiveBrackets),
        bpjsRates: JSON.stringify(settings.bpjsRates),
        wageCaps: JSON.stringify(settings.wageCaps),
        notes: settings.notes,
      },
    });
  }

  // --- One processed payroll period (regular month) for demo purposes ---------
  const taxSettings2026 = getSeedTaxSettings().find((s) => s.effectiveYear === 2026)!;
  const period = await prisma.payrollPeriod.create({
    data: { companyId: company.id, year: 2026, month: 6, status: "PROCESSED", processedAt: new Date() },
  });

  for (const se of seedEmployees) {
    const employeeId = employeeIdByCode.get(se.employeeCode)!;
    const result = calcPayslip(taxSettings2026, {
      basicSalary: se.basicSalary,
      allowances: 0,
      overtimePay: 0,
      ptkpStatus: se.ptkpStatus,
      riskClass: se.riskClass,
      isDecemberOrFinalMonth: false,
    });

    await prisma.payslip.create({
      data: {
        payrollPeriodId: period.id,
        employeeId,
        basicSalary: se.basicSalary,
        allowances: 0,
        overtimePay: 0,
        grossPay: result.grossPay,
        bpjsKesehatanEmployee: result.bpjsKesehatanEmployee,
        bpjsKesehatanCompany: result.bpjsKesehatanCompany,
        bpjsJhtEmployee: result.bpjsJhtEmployee,
        bpjsJhtCompany: result.bpjsJhtCompany,
        bpjsJpEmployee: result.bpjsJpEmployee,
        bpjsJpCompany: result.bpjsJpCompany,
        bpjsJkk: result.bpjsJkk,
        bpjsJkm: result.bpjsJkm,
        terCategory: result.terCategory,
        pph21Monthly: result.pph21Monthly,
        netPay: result.netPay,
        calculationSnapshot: JSON.stringify(result.snapshot),
      },
    });
  }

  console.log("Seed complete.");
  console.log(`\nDemo login (all users share the same password): ${DEMO_PASSWORD}`);
  for (const se of seedEmployees) {
    console.log(`  ${se.role.padEnd(10)} ${se.email}`);
  }
}

function futureDate(daysFromNow: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d;
}
function pastDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
