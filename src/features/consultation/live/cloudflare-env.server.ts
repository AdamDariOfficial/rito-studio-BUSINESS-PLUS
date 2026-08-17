import { env as cloudflareEnv } from "cloudflare:workers";

export interface D1Result<T = unknown> {
  results?: T[];
  success?: boolean;
  meta?: {
    changes?: number;
  };
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run<T = unknown>(): Promise<D1Result<T>>;
}

export interface D1DatabaseBinding {
  prepare(sql: string): D1PreparedStatement;
}

export interface DurableObjectStubBinding {
  fetch(request: Request): Promise<Response>;
}

export interface DurableObjectNamespaceBinding {
  getByName(name: string): DurableObjectStubBinding;
}

export interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface ConsultationCloudflareEnv {
  CONSULTATION_DB?: D1DatabaseBinding;
  CONSULTATION_REALTIME?: DurableObjectNamespaceBinding;
  CONSULTATION_SUBMIT_RATE_LIMITER?: RateLimitBinding;
  ADMIN_LOGIN_RATE_LIMITER?: RateLimitBinding;
  ADMIN_AUTH_PEPPER?: string;
  ADMIN_AUTH_CSRF_SECRET?: string;
  CONSULTATION_PRIVACY_VERSION?: string;
  LIVE_BACKEND_ENV?: string;
}

export function getConsultationCloudflareEnv() {
  // Cloudflare documents `cloudflare:workers` `env` as the canonical binding access
  // path inside TanStack Start server functions. Avoid a custom request-local propagation
  // bridge here: server-function RPC execution may cross framework async boundaries,
  // while the Workers env binding remains request-safe and available server-side.
  return cloudflareEnv as unknown as ConsultationCloudflareEnv;
}

export function requireLiveBinding<K extends keyof ConsultationCloudflareEnv>(
  name: K,
): NonNullable<ConsultationCloudflareEnv[K]> {
  const value = getConsultationCloudflareEnv()[name];
  if (value === undefined || value === null || value === "") {
    throw new Error(`Configurazione live incompleta: ${String(name)}.`);
  }
  return value as NonNullable<ConsultationCloudflareEnv[K]>;
}
