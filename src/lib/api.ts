import { supabase } from "./supabase";
import type { MeSnapshot, OnboardingPayload } from "../api/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(public status: number, message: string, public payload?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(await authHeader()),
  };

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    let payload: unknown;
    const text = await res.text();
    try { payload = text ? JSON.parse(text) : undefined; } catch { payload = text; }
    const detail = (payload && typeof payload === "object" && "detail" in payload)
      ? String((payload as { detail: unknown }).detail)
      : text || res.statusText;
    throw new ApiError(res.status, detail, payload);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  me: {
    get: () => request<MeSnapshot>("GET", "/api/v1/me"),
    markPlanSummarySeen: () => request<void>("POST", "/api/v1/me/seen-plan-summary"),
  },
  onboarding: {
    submit: (payload: OnboardingPayload) =>
      request<MeSnapshot>("POST", "/api/v1/onboarding", payload),
  },
};
