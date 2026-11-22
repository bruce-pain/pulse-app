// Mirrors the backend's UserDto / AuthTokensDto (see Swagger: /api).
// Keep these in sync with the API docs — they are the source of truth.

export type UserRole = "admin" | "creator" | "respondent";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

// `data` returned by POST /auth/login
export interface AuthTokens {
  access_token: string;
  expires_in: number; // seconds
  user: User;
}
