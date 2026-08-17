# RITO Studio BUSINESS PLUS — Live Adapter Compatibility Spike

**Status:** local compatibility spike candidate — execution pending
**Version:** 1.0
**Date:** 11 August 2026
**Scope:** prove the current Lovable/Nitro Cloudflare adapter before any build-adapter migration

## 1. Objective

Prove, with the current repository stack and without creating remote Cloudflare resources,
that the existing `@lovable.dev/vite-tanstack-config` + Nitro `cloudflare-module` path can
support the infrastructure primitives required by `docs/BUSINESS_PLUS_LIVE_ARCHITECTURE.md`.

The spike is successful only if all of the following are directly demonstrated in the
local Workers runtime:

```text
D1 binding visible + read/write
Durable Object binding reachable
Hibernation WebSocket upgrade + message round-trip
existing TanStack SSR routes still render
Nitro-generated Wrangler config contains the source bindings/exports
no remote Cloudflare resource is created
```

This is an infrastructure compatibility experiment, not the live Consultation Inbox
implementation.

## 2. Baseline evidence

Repository baseline:

```text
repository: AdamDariOfficial/rito-studio-BUSINESS-PLUS
branch:     feat/rito-business-plus-complete
HEAD:       eba1a2a91fd3a531b4a4667d038b631758d0a664
parent:     LIVE_ARCHITECTURE_SPEC_CCP_v1.0.0 validated state
```

The parent validation directly confirmed:

```text
frozen install:              PASS
production build:            PASS
generated route tree:        PASS
typecheck:                   PASS
lint:                        PASS
scope/checksum regression:   PASS
staged:                      0
Cloudflare resources:        NOT CREATED
```

## 3. Current adapter evidence

Installed repository versions used by this spike:

```text
@lovable.dev/vite-tanstack-config  2.9.1
nitro                              3.0.260603-beta
@tanstack/react-start              1.168.26
vite                               8.0.16
```

The installed Nitro provider documentation states that the `cloudflare_module` preset:

- may merge a repository `wrangler.json`, `wrangler.jsonc` or `wrangler.toml` with the
  generated deployment configuration;
- may expose additional Worker exports through a root `exports.cloudflare.ts` file;
- generates the Worker entry/output required by Wrangler.

This makes the current adapter a credible candidate. The runtime spike below is still
required before the adapter can be approved.

## 4. Spike-only files

```text
wrangler.jsonc
exports.cloudflare.ts
src/server.ts
src/types/cloudflare-live-adapter-spike.d.ts
tools/live-adapter-spike/test.mjs
```

The source Wrangler configuration is intentionally marked **DO NOT DEPLOY** and uses an
all-zero D1 identifier. It exists only so Nitro can merge the binding shape into its
locally built Worker configuration.

The spike bindings are deliberately separate from the future production names:

```text
SPIKE_DB
SPIKE_REALTIME
LIVE_ADAPTER_SPIKE=1
```

## 5. Local-only endpoints

The custom server entry intercepts only this private diagnostic namespace when
`LIVE_ADAPTER_SPIKE=1` is present:

```text
GET /__tretnix/live-adapter-spike/health
GET /__tretnix/live-adapter-spike/d1
GET /__tretnix/live-adapter-spike/realtime   (WebSocket upgrade)
```

Normal requests continue to the existing TanStack Start server entry and catastrophic
SSR normalization.

Outside the spike environment these diagnostic endpoints do not activate.

## 6. D1 proof

The D1 endpoint must:

1. observe `SPIKE_DB` from the Worker environment;
2. create a spike-only local table if missing;
3. write a deterministic value using a prepared statement;
4. read it back;
5. return `ok: true` only when the value matches.

No consultation data or PII is used.

## 7. Durable Object / Hibernation WebSocket proof

`exports.cloudflare.ts` exports `RealtimeAdapterSpikeHub`.

The class must:

```text
receive the WebSocket upgrade through SPIKE_REALTIME
create WebSocketPair
call DurableObjectState.acceptWebSocket(server)
send a `ready` envelope
receive `ping`
reply with `pong`
```

Calling `acceptWebSocket` is the proof that this spike uses the Durable Object Hibernation
WebSocket API rather than a standard pinned WebSocket handler.

## 8. SSR regression proof

While running under the same local Wrangler Worker, the automated probe must receive
SSR HTML with HTTP 200 from at least:

```text
/
/consulenza
/admin
```

A spike that proves bindings but breaks the existing application is a failure.

## 9. Generated configuration proof

After `bun run build`, `.output/server/wrangler.json` must preserve Nitro's generated
`main` and `assets` fields while also containing the source:

```text
SPIKE_DB D1 binding
SPIKE_REALTIME Durable Object binding
RealtimeAdapterSpikeHub exports declaration
LIVE_ADAPTER_SPIKE variable
```

The built Worker must export `RealtimeAdapterSpikeHub`.

## 10. Execution model

The Controlled Change Package performs Apply + normal repository Validate first.

The runtime compatibility proof is then run explicitly with the package spike runner.
The runner:

```text
uses pinned Wrangler 4.114.0 through npx
runs Wrangler in local mode only
binds only 127.0.0.1
uses package-local persistence/log directories
never calls wrangler deploy
never logs into Cloudflare
never creates remote D1/DO resources
```

Downloading the pinned Wrangler CLI through npm is a tooling prerequisite for this
local spike; it is not added to the application dependency graph or Bun lockfile.

## 11. Acceptance criteria

### PASS — preserve current adapter

All of the following are required:

```text
normal repository Validate PASS
generated Wrangler merge PASS
built Worker export PASS
local Wrangler startup PASS
D1 read/write PASS
Durable Object reachability PASS
Hibernation WebSocket ready/ping/pong PASS
SSR /, /consulenza, /admin PASS
no remote resource/deploy action PASS
```

If these gates pass, `BW-DEC-060` resolves in favor of preserving the current
Lovable/Nitro adapter for the live implementation.

### FAIL — adapter migration becomes eligible

If a requirement fails for an adapter/runtime reason, preserve the exact log and classify
the root cause before proposing a migration to `@cloudflare/vite-plugin`.

A failed spike does **not** automatically authorize that migration.

## 12. Explicit exclusions

This spike does not implement or authorize:

```text
real consultation persistence
real D1 schema/migrations
Cloudflare Access
production AdminAuth
rate limiting
realtime Consultation Inbox client
staging resources
production resources
real personal data
commit/push/PR/merge/deploy
```


## 13. Recorded outcome and supersession

The spike payload was applied and its normal repository validation passed, including the
generated Wrangler merge and `RealtimeAdapterSpikeHub` export. The subsequent local runtime
diagnostic produced the following evidence on Windows 11:

```text
Bare Worker / workerd bootstrap        PASS
D1 local binding/read-write            FAIL
Durable Object declarative exports     FAIL
Durable Object legacy migrations       FAIL
Hibernation WebSocket                  NOT INDEPENDENTLY PROVEN
Generated Nitro Worker startup         FAIL
```

Because minimal D1 and Durable Object cases failed independently of the generated Nitro
Worker, this evidence does not establish an adapter-specific incompatibility. The local
component runtime result is therefore **inconclusive**, not `PASS — PRESERVE` and not an
authorization to migrate tooling.

`BW-DEC-062` supersedes the local component runtime as the decisive compatibility gate.
The authoritative next proof is the isolated Cloudflare staging flow in
`docs/BUSINESS_PLUS_STAGING_RUNBOOK.md`.

The spike-only runtime endpoints, binding types and probe tool are removed by the live
backend staging implementation candidate. This document remains historical audit evidence;
it is not the current runtime specification.
