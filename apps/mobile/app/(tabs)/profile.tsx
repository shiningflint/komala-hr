import { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useFocusEffect } from "expo-router";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Employee {
  name: string;
  employeeCode: string;
  nik: string;
  joinDate: string;
  department: { name: string } | null;
  position: { name: string } | null;
  office: { name: string } | null;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);

  useFocusEffect(
    useCallback(() => {
      apiFetch<{ employee: Employee }>("/api/me")
        .then((res) => setEmployee(res.employee))
        .catch(() => {});
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      {employee && (
        <View style={styles.card}>
          <Row label="Name" value={employee.name} />
          <Row label="Employee code" value={employee.employeeCode} />
          <Row label="Department" value={employee.department?.name ?? "—"} />
          <Row label="Position" value={employee.position?.name ?? "—"} />
          <Row label="Office" value={employee.office?.name ?? "—"} />
          <Row label="Join date" value={new Date(employee.joinDate).toLocaleDateString()} />
        </View>
      )}

      <View style={styles.card}>
        <Row label="Email" value={user?.email ?? "—"} />
        <Row label="Role" value={user?.role.replace("_", " ") ?? "—"} />
      </View>

      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f8fafc", flexGrow: 1 },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a", marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
  },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  label: { color: "#64748b", fontSize: 13 },
  value: { color: "#0f172a", fontSize: 13, fontWeight: "600" },
  button: { backgroundColor: "#dc2626", borderRadius: 8, padding: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
});
