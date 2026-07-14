import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch, saveToken, clearToken, getToken } from "./api";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  employeeId: string | null;
  employeeName: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        try {
          const me = await apiFetch<{ userId: string; email: string; role: string; employee: any }>(
            "/api/me"
          );
          setUser({
            id: me.userId,
            email: me.email,
            role: me.role,
            employeeId: me.employee?.id ?? null,
            employeeName: me.employee?.name ?? null,
          });
        } catch {
          await clearToken();
        }
      }
      setLoading(false);
    })();
  }, []);

  async function login(email: string, password: string) {
    const data = await apiFetch<{ token: string; user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await saveToken(data.token);
    setUser(data.user);
  }

  async function logout() {
    await clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
