// apiClient.ts
import { supabase } from "./supabase";
import { 
  APIError, 
  NetworkError, 
  AuthError, 
  categorizeError, 
  reportError, 
  withRetry,
  type AppError 
} from "./errors";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8888";
type AuthMode = "required" | "optional" | "none";
type ApiInit = RequestInit & { 
  auth?: AuthMode;
  timeout?: number;
  retries?: boolean;
};

async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session?.access_token ?? null;
}

// Enhanced fetch with timeout support
async function fetchWithTimeout(url: string, init: RequestInit & { timeout?: number }): Promise<Response> {
  const { timeout = 30000, ...fetchInit } = init; // Default 30s timeout

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchInit,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new APIError(408, `Request timed out after ${timeout}ms`);
    }
    
    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError();
    }
    
    throw error;
  }
}

async function doFetch<T>(url: string, init: RequestInit & { timeout?: number }): Promise<T> {
  try {
    const res = await fetchWithTimeout(url, init);

    if (res.status === 204) return null as T;

    if (!res.ok) {
      let errorBody = "";
      let errorData: any = null;

      try { 
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          errorData = await res.json();
          errorBody = errorData.message || errorData.error || JSON.stringify(errorData);
        } else {
          errorBody = await res.text();
        }
      } catch {
        errorBody = res.statusText;
      }

      throw new APIError(res.status, errorBody);
    }

    const raw = await res.text();
    if (!raw) return null as T;

    const contentType = res.headers.get("content-type") || "";
    return (contentType.includes("application/json") ? JSON.parse(raw) : (raw as unknown)) as T;
  } catch (error) {
    const appError = categorizeError(error);
    reportError(appError, { url, method: init.method || 'GET' });
    throw appError;
  }
}

export async function apiFetch<T = unknown>(path: string, init: ApiInit = {}): Promise<T> {
  const { timeout, retries = true, ...fetchInit } = init;
  const url = `${API_URL}${path}`;
  const headers = new Headers(fetchInit.headers ?? {});
  
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const authMode: AuthMode = fetchInit.auth ?? "required";

  // Authentication handling function
  const setupAuth = async (): Promise<{ headers: Headers; token: string | null }> => {
    const newHeaders = new Headers(headers);
    let token: string | null = null;

    if (authMode !== "none") {
      token = await getAccessToken();
      if (token) {
        newHeaders.set("Authorization", `Bearer ${token}`);
      } else if (authMode === "required") {
        throw new AuthError("Authentication required but no valid session found");
      }
    }

    return { headers: newHeaders, token };
  };

  // Prepare request body
  const body = fetchInit.body && typeof fetchInit.body === "object" && !(fetchInit.body instanceof FormData)
    ? JSON.stringify(fetchInit.body)
    : (fetchInit.body as BodyInit | null | undefined);

  // Main request function
  const makeRequest = async (): Promise<T> => {
    const { headers: authHeaders, token } = await setupAuth();

    try {
      return await doFetch<T>(url, { 
        ...fetchInit, 
        headers: authHeaders, 
        body, 
        credentials: "include",
        timeout 
      });
    } catch (error) {
      const appError = categorizeError(error);

      // Handle 401 errors with token refresh
      if (appError instanceof APIError && 
          appError.statusCode === 401 && 
          (authMode === "required" || (authMode === "optional" && token))) {
        
        try {
          await supabase.auth.refreshSession();
          const newToken = await getAccessToken();
          
          if (newToken) {
            authHeaders.set("Authorization", `Bearer ${newToken}`);
            return await doFetch<T>(url, { 
              ...fetchInit, 
              headers: authHeaders, 
              body, 
              credentials: "include",
              timeout 
            });
          }
        } catch (refreshError) {
          // If refresh fails, throw auth error
          throw new AuthError("Session expired. Please sign in again.");
        }
      }

      throw appError;
    }
  };

  // Apply retry logic if enabled
  if (retries) {
    return withRetry(makeRequest, {
      maxAttempts: 3,
      delayMs: 1000,
      retryCondition: (error: AppError) => {
        // Don't retry auth errors or client errors (4xx except 408, 429)
        if (error instanceof APIError) {
          const status = error.statusCode;
          return status >= 500 || status === 408 || status === 429;
        }
        return error.retryable || false;
      }
    });
  }

  return makeRequest();
}

