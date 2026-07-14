import { useCallback, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { apiFetch, ApiError } from "@/lib/api";

interface LeaveType {
  id: string;
  name: string;
}
interface LeaveBalance {
  id: string;
  allocatedDays: number;
  usedDays: number;
  leaveType: LeaveType;
}
interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  status: string;
  reason: string;
  leaveType: LeaveType;
}

export default function LeaveScreen() {
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypeId, setLeaveTypeId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [typesRes, requestsRes] = await Promise.all([
      apiFetch<{ types: LeaveType[]; balances: LeaveBalance[] }>("/api/leave/types"),
      apiFetch<{ requests: LeaveRequest[] }>("/api/leave/requests"),
    ]);
    setTypes(typesRes.types);
    setBalances(typesRes.balances);
    setLeaveTypeId((prev) => prev ?? typesRes.types[0]?.id ?? null);
    setRequests(requestsRes.requests);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => {});
    }, [refresh])
  );

  async function submit() {
    if (!leaveTypeId) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch("/api/leave/requests", {
        method: "POST",
        body: JSON.stringify({ leaveTypeId, startDate, endDate, reason }),
      });
      setStartDate("");
      setEndDate("");
      setReason("");
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit request");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Leave</Text>

      <View style={styles.balanceRow}>
        {balances.map((b) => (
          <View key={b.id} style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>{b.leaveType.name}</Text>
            <Text style={styles.balanceValue}>{b.allocatedDays - b.usedDays}</Text>
            <Text style={styles.muted}>of {b.allocatedDays} days left</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Request leave</Text>
        <View style={styles.typeRow}>
          {types.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.typeChip, leaveTypeId === t.id && styles.typeChipActive]}
              onPress={() => setLeaveTypeId(t.id)}
            >
              <Text style={leaveTypeId === t.id ? styles.typeChipTextActive : styles.typeChipText}>
                {t.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Start date (YYYY-MM-DD)"
          value={startDate}
          onChangeText={setStartDate}
        />
        <TextInput
          style={styles.input}
          placeholder="End date (YYYY-MM-DD)"
          value={endDate}
          onChangeText={setEndDate}
        />
        <TextInput style={styles.input} placeholder="Reason" value={reason} onChangeText={setReason} />
        {error && <Text style={styles.error}>{error}</Text>}
        <TouchableOpacity style={styles.button} onPress={submit} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit request</Text>}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>My requests</Text>
      {requests.map((r) => (
        <View key={r.id} style={styles.requestRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.requestType}>{r.leaveType.name}</Text>
            <Text style={styles.muted}>
              {new Date(r.startDate).toLocaleDateString()} – {new Date(r.endDate).toLocaleDateString()} (
              {r.daysCount}d)
            </Text>
          </View>
          <Text style={styles.badge}>{r.status}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f8fafc", flexGrow: 1 },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a", marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#334155", marginTop: 20, marginBottom: 8 },
  muted: { color: "#64748b", fontSize: 11 },
  balanceRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  balanceCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    minWidth: "47%",
  },
  balanceLabel: { fontSize: 11, color: "#64748b" },
  balanceValue: { fontSize: 20, fontWeight: "700", color: "#1e3252" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#0f172a", marginBottom: 10 },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#f1f5f9",
  },
  typeChipActive: { backgroundColor: "#2c5591" },
  typeChipText: { color: "#334155", fontSize: 12 },
  typeChipTextActive: { color: "#fff", fontSize: 12, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  button: { backgroundColor: "#2c5591", borderRadius: 8, padding: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
  error: { color: "#dc2626", marginBottom: 8, fontSize: 12 },
  requestRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 8,
  },
  requestType: { fontWeight: "600", color: "#0f172a" },
  badge: {
    backgroundColor: "#fef9c3",
    color: "#854d0e",
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
});
