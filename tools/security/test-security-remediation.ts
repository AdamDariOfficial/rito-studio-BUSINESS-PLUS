import assert from "node:assert/strict";
import {
  consultationAdminEditSchema,
  consultationAdminUpdateSchema,
  consultationContactSchema,
} from "../../src/features/consultation/schemas.ts";
import {
  listValidConsultationRows,
  type ConsultationRow,
} from "../../src/features/consultation/live/d1-consultation-row.server.ts";
import {
  ConsultationInputError,
  ConsultationRateLimitError,
} from "../../src/features/consultation/live/errors.ts";
import { handlePublicConsultationSubmitCore } from "../../src/features/consultation/live/public-submit-core.ts";
import {
  consultationNetworkActorKey,
  consultationPhoneActorKey,
  MAX_PUBLIC_BODY_BYTES,
  readBoundedJsonBody,
} from "../../src/features/consultation/live/public-request-security.ts";
import { validateSubmissionSemantics } from "../../src/features/consultation/live/submission-validation.ts";
import { handleConsultationWebSocketClose } from "../../src/features/consultation/live/websocket-close.ts";
import {
  applySecurityHeaders,
  createHttpsRedirect,
} from "../../src/lib/security-response.server.ts";
import { applyStagingAssetBoundary } from "../cloudflare/staging-config-core.mjs";
import {
  applyStagingTransportHeaders,
  createStagingHttpsRedirect,
} from "../cloudflare/staging-security-response.mjs";

const validSubmission = {
  serviceSlug: "taglio-essenziale",
  answers: { goal: "rinnovo", pace: "essenziale", timing: "presto" },
  recommendedSlugs: ["trattamento-texture", "piega-e-styling"],
  selectedServiceSlugs: ["taglio-essenziale", "trattamento-texture"],
  contact: {
    name: "Persona Test",
    phone: "+39 333-123-4567",
    email: "persona@example.test",
    preferredContact: "email" as const,
    preferredDate: "2028-02-29",
    preferredWindow: "Mattina" as const,
  },
  consent: true as const,
};

const livePayload = {
  submissionKey: "84e6c5e8-c953-4c9c-89a1-96df004a548d",
  submission: validSubmission,
};

function storedRow(
  id: string,
  submissionKey: string,
  overrides: Partial<ConsultationRow> = {},
): ConsultationRow {
  return {
    id,
    submission_key: submissionKey,
    created_at: "2026-09-07T10:00:00.000Z",
    updated_at: "2026-09-07T10:00:00.000Z",
    version: 1,
    status: "new",
    service_slug: validSubmission.serviceSlug,
    answers_json: JSON.stringify(validSubmission.answers),
    recommended_slugs_json: JSON.stringify(validSubmission.recommendedSlugs),
    selected_slugs_json: JSON.stringify(validSubmission.selectedServiceSlugs),
    name: validSubmission.contact.name,
    phone: "+393331234567",
    email: validSubmission.contact.email,
    preferred_contact: validSubmission.contact.preferredContact,
    preferred_date: validSubmission.contact.preferredDate,
    preferred_window: validSubmission.contact.preferredWindow,
    consent_at: "2026-09-07T10:00:00.000Z",
    privacy_version: "test",
    note: "",
    ...overrides,
  };
}

function jsonRequest(body: BodyInit, headers: Record<string, string> = {}) {
  return new Request("https://staging.example.test/api/consultations", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
    duplex: "half",
  } as RequestInit & { duplex: "half" });
}

function exactSizeJson(size: number) {
  const shellSize = new TextEncoder().encode(JSON.stringify({ padding: "" })).byteLength;
  return JSON.stringify({ padding: "x".repeat(size - shellSize) });
}

for (const path of ["/", "/admin/login", "/api/consultations?source=test"]) {
  const request = new Request(`http://staging.example.test${path}`);
  const redirect = createHttpsRedirect(request, "staging");
  assert.equal(redirect?.status, 308);
  assert.equal(redirect?.headers.get("location"), `https://staging.example.test${path}`);
}
assert.equal(createHttpsRedirect(new Request("https://staging.example.test/"), "staging"), null);
assert.equal(createHttpsRedirect(new Request("http://localhost:3000/"), "unprovisioned"), null);

const secureRequest = new Request("https://staging.example.test/admin");
const secured = applySecurityHeaders(
  secureRequest,
  new Response("ok", { headers: { "x-existing": "preserved" } }),
  "staging",
);
assert.equal(secured.headers.get("x-existing"), "preserved");
assert.equal(secured.headers.get("x-frame-options"), "DENY");
assert.equal(secured.headers.get("x-content-type-options"), "nosniff");
assert.equal(secured.headers.get("cache-control"), "no-store");
assert.equal(secured.headers.get("strict-transport-security"), "max-age=31536000");
const csp = secured.headers.get("content-security-policy") ?? "";
for (const directive of [
  "frame-ancestors 'none'",
  "object-src 'none'",
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com",
  "frame-src https://www.google.com",
]) {
  assert.ok(csp.includes(directive), `CSP must contain ${directive}`);
}
assert.equal(
  applySecurityHeaders(
    new Request("http://staging.example.test/"),
    new Response("ok"),
    "staging",
  ).headers.get("strict-transport-security"),
  null,
);

const hardenedStagingConfig = applyStagingAssetBoundary({
  main: "index.mjs",
  assets: { binding: "ASSETS", directory: "../public" },
});
assert.equal(hardenedStagingConfig.main, "staging-worker-entry.mjs");
assert.equal(hardenedStagingConfig.assets.run_worker_first, true);
assert.equal(hardenedStagingConfig.assets.binding, "ASSETS");
assert.equal(hardenedStagingConfig.assets.directory, "../public");

let redirectedBodyPulled = false;
const redirectedBody = new ReadableStream<Uint8Array>(
  {
    pull(controller) {
      redirectedBodyPulled = true;
      controller.enqueue(new TextEncoder().encode("ignored"));
      controller.close();
    },
  },
  { highWaterMark: 0 },
);
const staticHttpRequest = new Request("http://staging.example.test/assets/app.js?version=1", {
  method: "POST",
  body: redirectedBody,
  duplex: "half",
} as RequestInit & { duplex: "half" });
const staticRedirect = createStagingHttpsRedirect(staticHttpRequest);
assert.equal(staticRedirect?.status, 308);
assert.equal(
  staticRedirect?.headers.get("location"),
  "https://staging.example.test/assets/app.js?version=1",
);
assert.equal(staticRedirect?.headers.get("cache-control"), "no-store");
assert.equal(redirectedBodyPulled, false, "staging redirect must not consume the request body");
assert.equal(createStagingHttpsRedirect(new Request("https://staging.example.test/app.js")), null);

let assetBodyPulled = false;
const assetBody = new ReadableStream<Uint8Array>(
  {
    pull(controller) {
      assetBodyPulled = true;
      controller.enqueue(new TextEncoder().encode("asset-body"));
      controller.close();
    },
  },
  { highWaterMark: 0 },
);
const securedAsset = applyStagingTransportHeaders(
  new Request("https://staging.example.test/assets/app.js"),
  new Response(assetBody, {
    headers: {
      "cache-control": "public, max-age=31536000, immutable",
      "content-type": "text/javascript",
      etag: 'W/"asset"',
    },
  }),
);
assert.equal(assetBodyPulled, false, "asset response must remain streaming until consumed");
assert.equal(securedAsset.headers.get("strict-transport-security"), "max-age=31536000");
assert.equal(securedAsset.headers.get("x-content-type-options"), "nosniff");
assert.equal(securedAsset.headers.get("content-type"), "text/javascript");
assert.equal(securedAsset.headers.get("cache-control"), "public, max-age=31536000, immutable");
assert.equal(securedAsset.headers.get("etag"), 'W/"asset"');
assert.equal(securedAsset.headers.get("content-security-policy"), null);
assert.equal(await securedAsset.text(), "asset-body");
assert.equal(assetBodyPulled, true);

const firstNetworkKey = await consultationNetworkActorKey(
  new Request("https://example.test", {
    headers: { "cf-connecting-ip": "203.0.113.10", "x-forwarded-for": "198.51.100.1" },
  }),
);
const spoofedForwardingKey = await consultationNetworkActorKey(
  new Request("https://example.test", {
    headers: { "cf-connecting-ip": "203.0.113.10", "x-forwarded-for": "192.0.2.99" },
  }),
);
const secondNetworkKey = await consultationNetworkActorKey(
  new Request("https://example.test", { headers: { "cf-connecting-ip": "203.0.113.11" } }),
);
assert.equal(firstNetworkKey, spoofedForwardingKey);
assert.notEqual(firstNetworkKey, secondNetworkKey);
assert.ok(!firstNetworkKey.includes("203.0.113.10"));

const firstPhoneKey = await consultationPhoneActorKey("+393331234567");
const secondPhoneKey = await consultationPhoneActorKey("+393331234567");
assert.equal(firstPhoneKey, secondPhoneKey);
assert.ok(!firstPhoneKey.includes("3331234567"));

const exactBody = exactSizeJson(MAX_PUBLIC_BODY_BYTES);
assert.equal(new TextEncoder().encode(exactBody).byteLength, MAX_PUBLIC_BODY_BYTES);
assert.equal(
  (await readBoundedJsonBody(jsonRequest(exactBody))) instanceof Object,
  true,
  "exactly 64 KiB must remain accepted",
);
await assert.rejects(
  readBoundedJsonBody(jsonRequest(exactSizeJson(MAX_PUBLIC_BODY_BYTES + 1))),
  ConsultationInputError,
);

let oversizedDeclaredBodyPulled = false;
const neverReadBody = new ReadableStream<Uint8Array>(
  {
    pull(controller) {
      oversizedDeclaredBodyPulled = true;
      controller.enqueue(new TextEncoder().encode("{}"));
      controller.close();
    },
  },
  { highWaterMark: 0 },
);
await assert.rejects(
  readBoundedJsonBody(
    jsonRequest(neverReadBody, { "content-length": String(MAX_PUBLIC_BODY_BYTES + 1) }),
  ),
  ConsultationInputError,
);
assert.equal(oversizedDeclaredBodyPulled, false, "oversized declared bodies must not be pulled");
await assert.rejects(
  readBoundedJsonBody(jsonRequest("{}", { "content-length": "not-a-number" })),
  ConsultationInputError,
);
await assert.rejects(readBoundedJsonBody(jsonRequest("{")), SyntaxError);

let rateLimitedBodyPulled = false;
let rateLimitedSubmitCalled = false;
const rateLimitedBody = new ReadableStream<Uint8Array>(
  {
    pull(controller) {
      rateLimitedBodyPulled = true;
      controller.enqueue(new TextEncoder().encode(JSON.stringify(livePayload)));
      controller.close();
    },
  },
  { highWaterMark: 0 },
);
const limitedResponse = await handlePublicConsultationSubmitCore(jsonRequest(rateLimitedBody), {
  async requireIngressAllowed() {
    throw new ConsultationRateLimitError();
  },
  async submit() {
    rateLimitedSubmitCalled = true;
    return {};
  },
});
assert.equal(limitedResponse?.status, 429);
assert.equal(rateLimitedBodyPulled, false, "ingress limiter must execute before body reads");
assert.equal(rateLimitedSubmitCalled, false);

let submittedPayload: unknown;
const acceptedResponse = await handlePublicConsultationSubmitCore(
  jsonRequest(JSON.stringify(livePayload)),
  {
    async requireIngressAllowed() {},
    async submit(input) {
      submittedPayload = input;
      return { id: "test-request" };
    },
  },
);
assert.equal(acceptedResponse?.status, 200);
assert.equal(
  (submittedPayload as typeof livePayload).submission.contact.phone,
  "+393331234567",
  "phone must be normalized before persistence",
);

const normalizedContact = consultationContactSchema.parse(validSubmission.contact);
assert.equal(normalizedContact.phone, "+393331234567");
for (const invalidPhone of ["abcdefghi", "+39 333 ext 2", "12345", "1234567890123456"]) {
  assert.equal(
    consultationContactSchema.safeParse({ ...validSubmission.contact, phone: invalidPhone })
      .success,
    false,
  );
}
assert.equal(
  consultationContactSchema.safeParse({ ...validSubmission.contact, preferredDate: "2027-02-29" })
    .success,
  false,
);
assert.equal(
  consultationContactSchema.safeParse({ ...validSubmission.contact, preferredWindow: "Notte" })
    .success,
  false,
);

const canonical = validateSubmissionSemantics({
  ...validSubmission,
  unexpected: "discarded",
} as typeof validSubmission);
assert.equal(
  "unexpected" in canonical,
  false,
  "unknown client fields must not cross the schema boundary",
);
for (const recommendedSlugs of [
  ["piega-e-styling", "trattamento-texture"],
  ["trattamento-texture"],
  ["brow-design", "lash-lift"],
]) {
  assert.throws(
    () => validateSubmissionSemantics({ ...validSubmission, recommendedSlugs }),
    ConsultationInputError,
  );
}

const malformedResponse = await handlePublicConsultationSubmitCore(jsonRequest("{"), {
  async requireIngressAllowed() {},
  async submit() {
    assert.fail("malformed JSON must not reach persistence");
  },
});
assert.equal(malformedResponse?.status, 400);

let invalidPublicSubmitCalled = false;
const invalidLegacyShape = {
  ...livePayload,
  submission: {
    ...validSubmission,
    contact: {
      ...validSubmission.contact,
      phone: "+39 700 5yxa",
      preferredDate: "9999-99-99",
      preferredWindow: "UNLISTED-WINDOW",
    },
  },
};
const invalidPublicResponse = await handlePublicConsultationSubmitCore(
  jsonRequest(JSON.stringify(invalidLegacyShape)),
  {
    async requireIngressAllowed() {},
    async submit() {
      invalidPublicSubmitCalled = true;
      return {};
    },
  },
);
assert.equal(invalidPublicResponse?.status, 400);
assert.equal(invalidPublicSubmitCalled, false, "invalid public data must not reach persistence");

const adminEditBase = {
  csrfToken: "csrf-token-at-least-twenty-characters",
  id: "request-1",
  expectedVersion: 1,
  selectedServiceSlugs: validSubmission.selectedServiceSlugs,
  contact: validSubmission.contact,
};
assert.equal(
  consultationAdminEditSchema.safeParse({
    ...adminEditBase,
    contact: invalidLegacyShape.submission.contact,
  }).success,
  false,
  "admin edit must reject the legacy invalid contact shape",
);
const parsedStatusMutation = consultationAdminUpdateSchema.parse({
  csrfToken: adminEditBase.csrfToken,
  id: adminEditBase.id,
  expectedVersion: 1,
  status: "contacted",
  contact: invalidLegacyShape.submission.contact,
});
assert.equal(
  "contact" in parsedStatusMutation,
  false,
  "status/note mutation must not accept contact fields",
);

const validStoredFirst = storedRow("valid-first-row", "11111111-1111-4111-8111-111111111111");
const invalidStored = storedRow(
  "invalid-sensitive-row-id",
  "22222222-2222-4222-8222-222222222222",
  {
    name: "SENSITIVE-NAME-MUST-NOT-BE-LOGGED",
    phone: "+39 700 5yxa",
    email: "sensitive-person@example.test",
    preferred_date: "9999-99-99",
    preferred_window: "UNLISTED-WINDOW",
    note: "SENSITIVE-NOTE-MUST-NOT-BE-LOGGED",
  },
);
const validStoredLast = storedRow("valid-last-row", "33333333-3333-4333-8333-333333333333", {
  status: "contacted",
});
const backingFixture = [validStoredFirst, invalidStored, validStoredLast];
const fixtureBeforeRead = JSON.stringify(backingFixture);
const diagnostics: unknown[] = [];
const validSnapshot = await listValidConsultationRows(
  async () => backingFixture,
  (diagnostic) => diagnostics.push(diagnostic),
);
assert.deepEqual(
  validSnapshot.map((request) => request.id),
  ["valid-first-row", "valid-last-row"],
  "one invalid legacy row must not fail or reorder the valid snapshot",
);
assert.equal(
  JSON.stringify(backingFixture),
  fixtureBeforeRead,
  "read isolation must not mutate storage",
);
assert.equal(
  validSnapshot.some((request) => request.id === "invalid-sensitive-row-id"),
  false,
);
assert.equal(diagnostics.length, 1);
const serializedDiagnostic = JSON.stringify(diagnostics[0]);
for (const sensitiveValue of [
  invalidStored.id,
  invalidStored.submission_key,
  invalidStored.name,
  invalidStored.phone,
  invalidStored.email,
  invalidStored.note,
]) {
  assert.equal(serializedDiagnostic.includes(sensitiveValue), false);
}
assert.match(serializedDiagnostic, /DATA_VALIDATION_FAILURE/);
assert.match(serializedDiagnostic, /contact\.phone:invalid_string/);

let allValidDiagnosticCount = 0;
const allValidSnapshot = await listValidConsultationRows(
  async () => [validStoredFirst, validStoredLast],
  () => {
    allValidDiagnosticCount += 1;
  },
);
assert.deepEqual(
  allValidSnapshot.map((request) => request.id),
  ["valid-first-row", "valid-last-row"],
);
assert.equal(allValidDiagnosticCount, 0);

const invalidJsonStored = storedRow("invalid-json-row", "44444444-4444-4444-8444-444444444444", {
  answers_json: "{",
});
const invalidJsonBeforeRead = JSON.stringify(invalidJsonStored);
const invalidJsonDiagnostics: unknown[] = [];
const snapshotWithoutInvalidJson = await listValidConsultationRows(
  async () => [validStoredFirst, invalidJsonStored],
  (diagnostic) => invalidJsonDiagnostics.push(diagnostic),
);
assert.deepEqual(
  snapshotWithoutInvalidJson.map((request) => request.id),
  ["valid-first-row"],
);
assert.equal(JSON.stringify(invalidJsonStored), invalidJsonBeforeRead);
assert.match(JSON.stringify(invalidJsonDiagnostics), /answers_json:invalid_json/);

await assert.rejects(
  listValidConsultationRows(async () => {
    throw new Error("D1 query unavailable");
  }),
  /D1 query unavailable/,
  "database/query errors must remain fatal rather than become an empty snapshot",
);
await assert.rejects(
  listValidConsultationRows(async () => undefined as unknown as ConsultationRow[]),
  /invalid result/,
  "an invalid D1 result shape must remain fatal rather than become an empty snapshot",
);

for (const { code, reason, wasClean } of [
  { code: 1005, reason: "", wasClean: true },
  { code: 1006, reason: "", wasClean: false },
  { code: 1015, reason: "", wasClean: false },
  { code: 1000, reason: "normal", wasClean: true },
  { code: 1001, reason: "going away", wasClean: true },
  { code: 4401, reason: "session revoked", wasClean: true },
]) {
  let outboundCloseCalls = 0;
  const socket = {
    close() {
      outboundCloseCalls += 1;
    },
  } as unknown as WebSocket;
  assert.doesNotThrow(() => handleConsultationWebSocketClose(socket, code, reason, wasClean));
  assert.equal(outboundCloseCalls, 0, `close callback must not retransmit observed code ${code}`);
}

console.log("Security remediation regression tests passed.");
