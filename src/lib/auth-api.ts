import { apiRequest } from "@/lib/api-client";
import type { AuthTokens, User } from "@/types/auth";

// POST /auth/login — public, so don't send any old token along.
export function login(email: string, password: string): Promise<AuthTokens> {
  return apiRequest<AuthTokens>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    auth: false,
  });
}

// GET /auth/me — requires the bearer token (attached by apiRequest).
export function getCurrentUser(): Promise<User> {
  return apiRequest<User>("/auth/me");
}
