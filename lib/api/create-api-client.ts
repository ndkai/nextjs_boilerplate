export interface ApiClient {
  request<T = unknown>(path: string, init?: RequestInit): Promise<T>;
}

interface CreateApiClientDeps {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  getToken: () => string | null;
  onUnauthorized: () => void;
}

export function createApiClient({
  baseUrl = "",
  fetchImpl = fetch,
  getToken,
  onUnauthorized,
}: CreateApiClientDeps): ApiClient {
  return {
    async request<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((init.headers as Record<string, string> | undefined) ?? {}),
      };

      const token = getToken();
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetchImpl(`${baseUrl}${path}`, { ...init, headers });

      if (res.status === 401) {
        onUnauthorized();
        throw new Error("TOKEN_EXPIRED");
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`[${res.status}] ${text || res.statusText}`);
      }

      if (res.status === 204) return null as T;

      const text = await res.text();
      if (!text) return null as T;

      try {
        return JSON.parse(text) as T;
      } catch {
        return text as unknown as T;
      }
    },
  };
}
