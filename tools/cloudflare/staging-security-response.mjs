export const STAGING_HSTS = "max-age=31536000";

export function createStagingHttpsRedirect(request) {
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

export function applyStagingTransportHeaders(request, response) {
  if (new URL(request.url).protocol !== "https:" || response.status === 101) return response;

  const headers = new Headers(response.headers);
  headers.set("strict-transport-security", STAGING_HSTS);
  headers.set("x-content-type-options", "nosniff");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
