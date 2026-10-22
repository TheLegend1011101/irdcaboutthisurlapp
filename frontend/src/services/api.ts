const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

const TOKEN_KEY = "access_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function isAuthError(err: unknown): boolean {
  return err instanceof ApiError && (err.status === 401 || err.status === 403);
}

export interface User {
  id: number;
  email: string;
}

export interface UrlItem {
  id: number;
  original_url: string;
  short_code: string;
  created_at: string;
  click_count: number;
}

export interface ClickItem {
  id: number;
  referrer: string | null;
  user_agent: string | null;
  timestamp: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export function shortLinkHref(code: string): string {
  return `${API_URL}/r/${code}`;
}

export function shortLinkLabel(code: string): string {
  return `${new URL(API_URL).host}/r/${code}`;
}

async function readError(res: Response): Promise<string> {
  if (res.status >= 500) return "Server error";
  try {
    const body = await res.json();
    const detail = body?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0]?.msg) {
      return String(detail[0].msg).replace(/^Value error, /, "");
    }
  } catch {
    // body was not JSON
  }
  return "Server error";
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  auth = true
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");
  if (auth) {
    const token = tokenStore.get();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, "Server error");
  }

  if (!res.ok) throw new ApiError(res.status, await readError(res));
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function registerUser(data: Credentials) {
  return request<{ message: string }>(
    "/auth/register",
    { method: "POST", body: JSON.stringify(data) },
    false
  );
}

export function loginUser(data: Credentials) {
  return request<{ access_token: string; token_type: string }>(
    "/auth/login",
    { method: "POST", body: JSON.stringify(data) },
    false
  );
}

export function getCurrentUser() {
  return request<User>("/auth/me");
}

export function getUserUrls() {
  return request<UrlItem[]>("/api/urls");
}

export async function createShortUrl(originalUrl: string): Promise<UrlItem> {
  try {
    const created = await request<Omit<UrlItem, "click_count">>("/api/urls", {
      method: "POST",
      body: JSON.stringify({ original_url: originalUrl }),
    });
    return { ...created, click_count: 0 };
  } catch (err) {
    if (err instanceof ApiError && err.status === 422) {
      throw new ApiError(
        422,
        "That doesn't look like a valid link you should include the full address."
      );
    }
    throw err;
  }
}

export function getUrlClicks(id: number) {
  return request<ClickItem[]>(`/api/urls/${id}/clicks`);
}

export function deleteAccount(password: string) {
  return request<void>("/auth/me", {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
}

export function changePassword(currentPassword: string, newPassword: string) {
  return request<void>("/auth/me/password", {
    method: "PUT",
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
}

export function deleteUrl(id: number) {
  return request<void>(`/api/urls/${id}`, { method: "DELETE" });
}