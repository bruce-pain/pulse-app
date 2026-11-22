import type { User } from "@/types/auth";

// The logged-in session lives in localStorage under one key.
// This module is the ONLY place that reads/writes it, so the API client
// (which needs the token) and the AuthProvider (which needs the user)
// always agree.

const STORAGE_KEY = "pulse_session";

export interface Session {
  accessToken: string;
  expiresAt: number; // epoch ms
  user: User;
}

// ---- change notifications (for useSyncExternalStore) ----

const listeners = new Set<() => void>();

export function subscribeToSession(callback: () => void) {
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

// ---- read ----

export function readRawSession(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function parseSession(raw: string | null | undefined): Session | null {
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as Session;
    if (!session.accessToken || !session.user) return null;
    return session;
  } catch {
    return null;
  }
}

/** Current session, or null if missing/expired. Safe to call on the server. */
export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const session = parseSession(readRawSession());
  if (!session || session.expiresAt <= Date.now()) return null;
  return session;
}

// ---- write ----

export function saveSession(session: Session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  emitChange();
}

export function updateSessionUser(user: User) {
  const session = parseSession(readRawSession());
  if (!session) return;
  if (JSON.stringify(session.user) === JSON.stringify(user)) return;
  saveSession({ ...session, user });
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
  emitChange();
}
