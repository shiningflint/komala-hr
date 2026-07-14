import { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { useFocusEffect } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { apiFetch, getToken } from "@/lib/api";
import { API_BASE_URL } from "@/lib/config";

interface Payslip {
  id: string;
  grossPay: number;
  pph21Monthly: number;
  netPay: number;
  payrollPeriod: { month: number; year: number };
}

function formatIDR(n: number) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

export default function PayslipsScreen() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      apiFetch<{ payslips: Payslip[] }>("/api/payslips")
        .then((res) => setPayslips(res.payslips))
        .catch(() => {});
    }, [])
  );

  async function viewPdf(payslip: Payslip) {
    setDownloadingId(payslip.id);
    try {
      const token = await getToken();
      const fileUri = `${FileSystem.cacheDirectory}payslip-${payslip.id}.pdf`;
      const result = await FileSystem.downloadAsync(
        `${API_BASE_URL}/api/payslips/${payslip.id}/pdf`,
        fileUri,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, { mimeType: "application/pdf" });
      } else {
        Alert.alert("Downloaded", `Saved to ${result.uri}`);
      }
    } catch (err) {
      Alert.alert("Error", "Could not open payslip PDF");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Payslips</Text>
      {payslips.map((p) => (
        <View key={p.id} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.period}>
              {p.payrollPeriod.month}/{p.payrollPeriod.year}
            </Text>
            <Text style={styles.muted}>Gross {formatIDR(p.grossPay)} · PPh21 {formatIDR(p.pph21Monthly)}</Text>
            <Text style={styles.net}>Net {formatIDR(p.netPay)}</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={() => viewPdf(p)} disabled={downloadingId === p.id}>
            <Text style={styles.buttonText}>{downloadingId === p.id ? "…" : "View PDF"}</Text>
          </TouchableOpacity>
        </View>
      ))}
      {payslips.length === 0 && <Text style={styles.muted}>No payslips yet.</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f8fafc", flexGrow: 1 },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a", marginBottom: 16 },
  muted: { color: "#64748b", fontSize: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 10,
  },
  period: { fontWeight: "700", color: "#0f172a", marginBottom: 2 },
  net: { fontWeight: "600", color: "#1e3252", marginTop: 2 },
  button: { backgroundColor: "#f1f5f9", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  buttonText: { color: "#2c5591", fontWeight: "600", fontSize: 12 },
});
