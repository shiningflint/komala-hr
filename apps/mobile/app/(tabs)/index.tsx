import { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, ScrollView } from "react-native";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Office {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

interface AttendanceRecord {
  status: string;
  clockInAt: string | null;
  clockInDistanceM: number | null;
  clockInInsideGeofence: boolean | null;
  clockOutAt: string | null;
  clockOutDistanceM: number | null;
  clockOutInsideGeofence: boolean | null;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [office, setOffice] = useState<Office | null>(null);
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const me = await apiFetch<{ employee: { office: Office | null } }>("/api/me");
    setOffice(me.employee?.office ?? null);
    const today = await apiFetch<{ record: AttendanceRecord | null }>("/api/attendance/today");
    setRecord(today.record);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => {});
    }, [refresh])
  );

  async function handleClock(kind: "clock-in" | "clock-out") {
    setBusy(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission is required to clock in/out.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const result = await apiFetch<{ record: AttendanceRecord }>(`/api/attendance/${kind}`, {
        method: "POST",
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyM: position.coords.accuracy ?? undefined,
          note: note || undefined,
        }),
      });
      setRecord(result.record);
      setNote("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to record attendance");
    } finally {
      setBusy(false);
    }
  }

  const canClockIn = !record?.clockInAt;
  const canClockOut = Boolean(record?.clockInAt) && !record?.clockOutAt;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>Hi, {user?.employeeName?.split(" ")[0] ?? "there"}</Text>

      {!office ? (
        <Text style={styles.muted}>No office assigned — ask HR to assign one before clocking in.</Text>
      ) : (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>{office.name}</Text>
            {record?.status && <Text style={styles.badge}>{record.status}</Text>}
          </View>
          <Text style={styles.muted}>Geofence radius: {office.radiusMeters}m</Text>

          <View style={styles.statRow}>
            <AttendanceStat
              label="Clock in"
              at={record?.clockInAt}
              distanceM={record?.clockInDistanceM}
              inside={record?.clockInInsideGeofence}
            />
            <AttendanceStat
              label="Clock out"
              at={record?.clockOutAt}
              distanceM={record?.clockOutDistanceM}
              inside={record?.clockOutInsideGeofence}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Optional note (e.g. WFH, client site visit)"
            value={note}
            onChangeText={setNote}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, !canClockIn && styles.buttonDisabled]}
              disabled={busy || !canClockIn}
              onPress={() => handleClock("clock-in")}
            >
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Clock In</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonSecondary, !canClockOut && styles.buttonDisabled]}
              disabled={busy || !canClockOut}
              onPress={() => handleClock("clock-out")}
            >
              <Text style={styles.buttonSecondaryText}>Clock Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function AttendanceStat({
  label,
  at,
  distanceM,
  inside,
}: {
  label: string;
  at?: string | null;
  distanceM?: number | null;
  inside?: boolean | null;
}) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      {at ? (
        <>
          <Text style={styles.statValue}>{new Date(at).toLocaleTimeString()}</Text>
          {distanceM != null && (
            <Text style={[styles.statDistance, { color: inside ? "#16a34a" : "#d97706" }]}>
              {Math.round(distanceM)}m — {inside ? "inside" : "outside"} geofence
            </Text>
          )}
        </>
      ) : (
        <Text style={styles.statValuePlaceholder}>Not yet</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f8fafc", flexGrow: 1 },
  greeting: { fontSize: 22, fontWeight: "700", color: "#0f172a", marginBottom: 16 },
  muted: { color: "#64748b", fontSize: 12 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  badge: {
    backgroundColor: "#f1f5f9",
    color: "#334155",
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  statBox: { flex: 1, backgroundColor: "#f8fafc", borderRadius: 8, padding: 10 },
  statLabel: { fontSize: 10, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" },
  statValue: { fontSize: 14, color: "#1e293b", marginTop: 4 },
  statValuePlaceholder: { fontSize: 14, color: "#cbd5e1", marginTop: 4 },
  statDistance: { fontSize: 11, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 10,
    marginTop: 14,
    backgroundColor: "#fff",
  },
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 14 },
  button: { flex: 1, backgroundColor: "#2c5591", borderRadius: 8, padding: 12, alignItems: "center" },
  buttonSecondary: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600" },
  buttonSecondaryText: { color: "#334155", fontWeight: "600" },
  error: { color: "#dc2626", marginTop: 10, fontSize: 12 },
});
