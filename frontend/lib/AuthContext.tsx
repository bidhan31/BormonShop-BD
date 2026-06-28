"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "./api";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  avatar?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, mobileNumber?: string) => Promise<void>;
  googleLogin: (token: string) => Promise<{ needsRegistration?: boolean; profile?: { name: string; email: string; picture: string } }>;
  googleRegister: (token: string, mobileNumber: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      // Cookie is sent automatically — if it's missing/expired this 401s, which is expected
      // for logged-out visitors, so we just treat it as "no user" rather than an error.
      const data = await api.get("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post("/auth/login", { email, password });
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string, mobileNumber?: string) => {
    const data = await api.post("/auth/register", { name, email, password, mobileNumber });
    setUser(data.user);
  };

  /**
   * Attempt a Google login. Returns { needsRegistration: true, profile } if the
   * email isn't in the database yet so the caller can show the Step 2 sign-up form.
   */
  const googleLogin = async (token: string) => {
    try {
      const data = await api.post("/auth/google", { token });
      setUser(data.user);
      return {};
    } catch (err: any) {
      // 404 with needsRegistration signals "no account — please register"
      if (err.needsRegistration) {
        return { needsRegistration: true, profile: err.profile };
      }
      throw err;
    }
  };

  /** Complete Google sign-up after user supplies phone + password in Step 2. */
  const googleRegister = async (token: string, mobileNumber: string, password: string) => {
    const data = await api.post("/auth/google-register", { token, mobileNumber, password });
    setUser(data.user);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, googleLogin, googleRegister, logout, refetchUser: fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
