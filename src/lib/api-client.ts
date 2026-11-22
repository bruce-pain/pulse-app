import { clearSession, getSession } from "@/lib/auth-session";

// e.g. https://pulse-server-g89f.onrender.com/api/v1
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// The backend wraps every documented response in this envelope.
export interface ApiSuccessResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error: string;
  details?: string[]; // field-level validation messages (400s)
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number, // 0 = network failure (no response at all)
    public details: string[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiRequestOptions extends RequestInit {
  /** Attach the bearer token if we have one. Defaults to true. */
  auth?: boolean;
}

function isEnvelope<T>(body: unknown): body is ApiSuccessResponse<T> {
  return typeof body === "object" && body !== null && "success" in body && "data" in body;
}

export async function apiRequest<T>(
  path: string,
  { auth = true, headers, ...options }: ApiRequestOptions = {},
): Promise<T> {
  const token = auth ? getSession()?.accessToken : undefined;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        // JSON bodies are strings. FormData (file uploads) must NOT get this
        // header: the browser sets multipart/form-data + its boundary itself.
        ...(typeof options.body === "string"
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    // fetch only rejects when there is no HTTP response at all
    // (offline, DNS, CORS, server asleep and timing out...)
    throw new ApiError("Could not reach the server.", 0);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    // Our token was rejected (expired/invalid) → drop it so the app
    // sends the user back to /signin.
    if (response.status === 401 && token) {
      clearSession();
    }

    const errorBody = body as Partial<ApiErrorResponse> | null;
    throw new ApiError(
      errorBody?.message ?? `Request failed with status ${response.status}`,
      response.status,
      errorBody?.details ?? [],
    );
  }

  // Unwrap { success, data } so callers get the payload directly.
  return (isEnvelope<T>(body) ? body.data : body) as T;
}

/**
 * Downloads a file from an authenticated endpoint (e.g. CSV export).
 * A plain <a href> can't send our Bearer token, so we fetch the file,
 * turn it into a temporary local URL, and click a hidden link to save it.
 */
export async function apiDownload(path: string, fileName: string): Promise<void> {
  const token = getSession()?.accessToken;
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    throw new ApiError("Could not reach the server.", 0);
  }
  if (!response.ok) {
    if (response.status === 401 && token) clearSession();
    throw new ApiError(`Download failed with status ${response.status}`, response.status);
  }

  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
