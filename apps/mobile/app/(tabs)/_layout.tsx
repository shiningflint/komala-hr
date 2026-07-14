import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerTintColor: "#1e3252", tabBarActiveTintColor: "#2c5591" }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="leave" options={{ title: "Leave" }} />
      <Tabs.Screen name="payslips" options={{ title: "Payslips" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
