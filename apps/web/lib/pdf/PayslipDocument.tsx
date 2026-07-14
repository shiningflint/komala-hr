import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#1e293b" },
  header: { marginBottom: 16, borderBottom: 1, borderBottomColor: "#cbd5e1", paddingBottom: 12 },
  companyName: { fontSize: 16, fontWeight: 700, marginBottom: 2 },
  title: { fontSize: 12, fontWeight: 700, marginTop: 8, marginBottom: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  label: { color: "#64748b" },
  section: { marginTop: 14 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 6,
    textTransform: "uppercase",
    color: "#334155",
  },
  divider: { borderBottom: 1, borderBottomColor: "#e2e8f0", marginVertical: 8 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    borderTop: 1,
    borderTopColor: "#334155",
    fontWeight: 700,
  },
  footerNote: { marginTop: 24, fontSize: 8, color: "#94a3b8" },
});

function formatIDR(n: number) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

export interface PayslipPdfData {
  companyName: string;
  employeeName: string;
  employeeCode: string;
  positionName: string | null;
  periodLabel: string;
  basicSalary: number;
  allowances: number;
  overtimePay: number;
  grossPay: number;
  bpjsKesehatanEmployee: number;
  bpjsKesehatanCompany: number;
  bpjsJhtEmployee: number;
  bpjsJhtCompany: number;
  bpjsJpEmployee: number;
  bpjsJpCompany: number;
  bpjsJkk: number;
  bpjsJkm: number;
  terCategory: string | null;
  pph21Monthly: number;
  pph21Annual: number | null;
  pph21AlreadyWithheld: number | null;
  pph21TrueUp: number | null;
  netPay: number;
}

export function PayslipDocument(data: PayslipPdfData) {
  const isDecemberReconciliation = data.pph21TrueUp != null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.companyName}>{data.companyName}</Text>
          <Text>Payslip — {data.periodLabel}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Employee</Text>
          <Text>
            {data.employeeName} ({data.employeeCode})
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Position</Text>
          <Text>{data.positionName ?? "—"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings</Text>
          <View style={styles.row}>
            <Text>Basic salary</Text>
            <Text>{formatIDR(data.basicSalary)}</Text>
          </View>
          <View style={styles.row}>
            <Text>Allowances</Text>
            <Text>{formatIDR(data.allowances)}</Text>
          </View>
          <View style={styles.row}>
            <Text>Overtime</Text>
            <Text>{formatIDR(data.overtimePay)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Gross pay</Text>
            <Text>{formatIDR(data.grossPay)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BPJS contributions (employee share, deducted)</Text>
          <View style={styles.row}>
            <Text>BPJS Kesehatan</Text>
            <Text>{formatIDR(data.bpjsKesehatanEmployee)}</Text>
          </View>
          <View style={styles.row}>
            <Text>BPJS JHT</Text>
            <Text>{formatIDR(data.bpjsJhtEmployee)}</Text>
          </View>
          <View style={styles.row}>
            <Text>BPJS JP</Text>
            <Text>{formatIDR(data.bpjsJpEmployee)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PPh 21 (Indonesian income tax withholding)</Text>
          <View style={styles.row}>
            <Text>TER category</Text>
            <Text>{data.terCategory ?? "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text>Monthly withholding (TER method)</Text>
            <Text>{formatIDR(data.pph21Monthly)}</Text>
          </View>
          {isDecemberReconciliation && (
            <>
              <View style={styles.divider} />
              <Text style={{ marginBottom: 4, fontStyle: "italic" }}>
                Year-end reconciliation (progressive Pasal 17 rates vs. TER withheld Jan–Nov)
              </Text>
              <View style={styles.row}>
                <Text>Full-year PPh21 (progressive)</Text>
                <Text>{formatIDR(data.pph21Annual ?? 0)}</Text>
              </View>
              <View style={styles.row}>
                <Text>Already withheld (TER, Jan–Nov)</Text>
                <Text>{formatIDR(data.pph21AlreadyWithheld ?? 0)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text>{(data.pph21TrueUp ?? 0) >= 0 ? "Additional withholding (Dec)" : "Refund to employee (Dec)"}</Text>
                <Text>{formatIDR(Math.abs(data.pph21TrueUp ?? 0))}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.totalRow}>
            <Text>Net pay</Text>
            <Text>{formatIDR(data.netPay)}</Text>
          </View>
        </View>

        <Text style={styles.footerNote}>
          BPJS Kesehatan/Ketenagakerjaan rates and PPh 21 TER brackets applied here are configured in
          Tax Settings and should be verified against current DJP/BPJS regulations before this document
          is relied upon for statutory filing. This payslip is generated by Komala HR (prototype).
        </Text>
      </Page>
    </Document>
  );
}
