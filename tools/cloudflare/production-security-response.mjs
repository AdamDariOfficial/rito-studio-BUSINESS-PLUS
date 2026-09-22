export const PRODUCTION_HSTS = "max-age=31536000";

export function createProductionHttpsRedirect(request) {
  const url = new URL(request.url);
  if (url.protocol !== "http:") return null;

  url.protocol = "https:";
  return new Response(null, {
    status: 308,
    headers: {
      "cache-control": "no-store",
      location: url.toString(),
    },
  });
}

export function applyProductionTransportHeaders(request, response) {
  if (new URL(request.url).protocol !== "https:" || response.status === 101) return response;

  const headers = new Headers(response.headers);
  headers.set("strict-transport-security", PRODUCTION_HSTS);
  headers.set("x-content-type-options", "nosniff");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
