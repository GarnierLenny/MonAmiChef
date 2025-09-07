// apiClient.ts
import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8888";
type AuthMode = "required" | "optional" | "none";
type ApiInit = RequestInit & { auth?: AuthMode };

async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session?.access_token ?? null;
}

async function doFetch<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, init);

  if (res.status === 204) return null as T;

  if (!res.ok) {
    let errText = "";
    try { errText = await res.text(); } catch {}
    throw new Error(`HTTP ${res.status} ${res.statusText}${errText ? ` — ${errText}` : ""}`);
  }

  const raw = await res.text();
  if (!raw) return null as T;

  const ct = res.headers.get("content-type") || "";
  return (ct.includes("application/json") ? JSON.parse(raw) : (raw as unknown)) as T;
}

export async function apiFetch<T = unknown>(path: string, init: ApiInit = {}): Promise<T> {
  const url = `${API_URL}${path}`;
  const headers = new Headers(init.headers ?? {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const authMode: AuthMode = init.auth ?? "required";
  let token: string | null = null;

  if (authMode !== "none") {
    token = await getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    else if (authMode === "required") {
      throw new Error("Not authenticated");
    }
    // if optional and no token → just omit Authorization
  }

  const body =
    init.body && typeof init.body === "object" && !(init.body instanceof FormData)
      ? JSON.stringify(init.body)
      : (init.body as BodyInit | null | undefined);

  try {
    return await doFetch<T>(url, { ...init, headers, body, credentials: "include" });
  } catch (e: any) {
    // Retry once on 401 only when we intended to send auth
    if ((authMode === "required" || (authMode === "optional" && token)) && /HTTP 401 /.test(String(e?.message))) {
      await supabase.auth.refreshSession().catch(() => {});
      const token2 = await getAccessToken();
      if (!token2) throw e;
      headers.set("Authorization", `Bearer ${token2}`);
      return doFetch<T>(url, { ...init, headers, body, credentials: "include" });
    }
    throw e;
  }
}

