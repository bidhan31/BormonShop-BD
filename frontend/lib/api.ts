const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ApiOptions extends RequestInit {
  body?: any;
}

/**
 * Thin wrapper around fetch() that:
 *  - always sends credentials (so the HTTP-only JWT cookie is included)
 *  - JSON-stringifies the body automatically
 *  - throws a normal Error with the server's message on non-2xx responses,
 *    so callers can just try/catch instead of checking res.ok everywhere
 */
async function apiFetch<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include", // sends the JWT http-only cookie set by the backend
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Attach the full server response to the error so callers can inspect
    // fields like `needsRegistration` beyond just the message string.
    const err: any = new Error(data.message || `Request failed with status ${res.status}`);
    Object.assign(err, data);
    throw err;
  }
  return data;
}

export const api = {
  get: <T = any>(path: string) => apiFetch<T>(path, { method: "GET" }),
  post: <T = any>(path: string, body?: any) => apiFetch<T>(path, { method: "POST", body }),
  put: <T = any>(path: string, body?: any) => apiFetch<T>(path, { method: "PUT", body }),
  delete: <T = any>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
