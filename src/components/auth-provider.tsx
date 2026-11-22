"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { getCurrentUser, login as loginRequest } from "@/lib/auth-api";
import {
  clearSession,
  parseSession,
  readRawSession,
  saveSession,
  subscribeToSession,
  updateSessionUser,
} from "@/lib/auth-session";
import type { User } from "@/types/auth";

export type { User, UserRole } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  /** Resolves with the user, or throws an ApiError. */
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// undefined on the server (= "not loaded yet"), string | null on the client
function getServerSnapshot(): string | null | undefined {
  return undefined;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(
    subscribeToSession,
    readRawSession,
    getServerSnapshot,
  );

  const isLoading = raw === undefined;
  const session = useMemo(() => parseSession(raw), [raw]);
  const user = session?.user ?? null;
  const accessToken = session?.accessToken;
  const expiresAt = session?.expiresAt;

  // Sign out automatically when the token expires (no refresh token exists).
  useEffect(() => {
    if (expiresAt === undefined) return;
    const timeout = setTimeout(clearSession, expiresAt - Date.now());
    return () => clearTimeout(timeout);
  }, [expiresAt]);

  // Once per token, ask the server who we are. This validates a token
  // restored from localStorage and picks up role/name changes.
  // A 401 here is handled by apiRequest (it clears the session).
  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;

    getCurrentUser()
      .then((freshUser) => {
        if (!cancelled) updateSessionUser(freshUser);
      })
      .catch(() => {
        // Network/server error: keep the stored session and let the
        // next real request decide.
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  async function login(email: string, password: string): Promise<User> {
    const { access_token, expires_in, user } = await loginRequest(
      email.trim(),
      password,
    );

    saveSession({
      accessToken: access_token,
      expiresAt: Date.now() + expires_in * 1000,
      user,
    });

    return user;
  }

  function logout() {
    // The API has no logout endpoint; the JWT simply stops being sent.
    clearSession();
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
