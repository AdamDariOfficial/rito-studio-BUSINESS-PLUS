const DEPLOYABLE_ENVIRONMENTS = new Set(["staging", "production"]);

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "frame-src https://www.google.com",
  "upgrade-insecure-requests",
].join("; ");

function isDeployableEnvironment(environment: string | undefined) {
  return environment !== undefined && DEPLOYABLE_ENVIRONMENTS.has(environment);
}

function requiresNoStore(pathname: string) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_serverFn") ||
    pathname.startsWith("/__tretnix/")
  );
}

export function createHttpsRedirect(
  request: Request,
  environment: string | undefined,
): Response | null {
  const url = new URL(request.url);
  if (!isDeployableEnvironment(environment) || url.protocol !== "http:") return null;

  url.protocol = "https:";
  return new Response(null, {
    status: 308,
    headers: {
      "cache-control": "no-store",
      location: url.toString(),
    },
  });
}

export function applySecurityHeaders(
  request: Request,
  response: Response,
  environment: string | undefined,
): Response {
  // A WebSocket upgrade response carries a runtime-owned socket and must not be cloned.
  if (response.status === 101) return response;

  const headers = new Headers(response.headers);
  headers.set("content-security-policy", CONTENT_SECURITY_POLICY);
  headers.set("x-frame-options", "DENY");
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");

  const url = new URL(request.url);
  if (url.protocol === "https:" && isDeployableEnvironment(environment)) {
    headers.set("strict-transport-security", "max-age=31536000");
  } else {
    headers.delete("strict-transport-security");
  }

  if (requiresNoStore(url.pathname)) headers.set("cache-control", "no-store");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
