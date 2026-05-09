export const apiUrl = (path: string): string =>
  `${import.meta.env.BASE_URL}api${path.startsWith("/") ? path : `/${path}`}`.replace("//api", "/api");

export async function apiFetch<T = unknown>(path: string, init?: RequestInit & { token?: string | null }): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(init?.headers as Record<string, string> | undefined) };
  if (init?.token) headers["Authorization"] = `Bearer ${init.token}`;
  const method = (init?.method || "GET").toUpperCase();
  const body = method === "GET" || method === "HEAD" ? undefined : init?.body;
  const res = await fetch(apiUrl(path), { credentials: "include", ...init, method, body, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}
