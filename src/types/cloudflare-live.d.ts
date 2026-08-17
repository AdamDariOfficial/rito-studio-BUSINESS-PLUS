declare module "cloudflare:workers" {
  export class DurableObject<Env = unknown> {
    protected ctx: DurableObjectState;
    protected env: Env;
    constructor(ctx: DurableObjectState, env: Env);
  }
}

interface DurableObjectState {
  acceptWebSocket(webSocket: WebSocket): void;
  getWebSockets(): WebSocket[];
}

interface WebSocket {
  serializeAttachment?(value: unknown): void;
  deserializeAttachment?(): unknown;
}

declare class WebSocketPair {
  0: WebSocket;
  1: WebSocket;
}

interface ResponseInit {
  webSocket?: WebSocket;
}

interface SubtleCrypto {
  timingSafeEqual(
    first: ArrayBuffer | ArrayBufferView,
    second: ArrayBuffer | ArrayBufferView,
  ): boolean;
}
