"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type UserRole = "admin" | "creator";

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => User | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "pulse_mock_user";

const mockUsers = [
  {
    id: "user_1",
    email: "creator@pulse.dev",
    password: "password123",
    role: "creator" as const,
  },
  {
    id: "user_2",
    email: "admin@pulse.dev",
    password: "password123",
    role: "admin" as const,
  },
];

// ---- localStorage as an external store ----

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback); // syncs across tabs
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

// string | null on the client, undefined on the server (= "not loaded yet")
type Snapshot = string | null | undefined;

function getSnapshot(): Snapshot {
  return localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot(): Snapshot {
  return undefined;
}

function parseUser(raw: Snapshot): User | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

// ---- Provider ----

export function AuthProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isLoading = raw === undefined;
  const user = useMemo(() => parseUser(raw), [raw]);

  function login(email: string, password: string): User | null {
    const matchedUser = mockUsers.find(
      (mockUser) =>
        mockUser.email === email.trim().toLowerCase() &&
        mockUser.password === password,
    );

    if (!matchedUser) return null;

    const authenticatedUser: User = {
      id: matchedUser.id,
      email: matchedUser.email,
      role: matchedUser.role,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));
    emitChange();

    return authenticatedUser;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    emitChange();
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
