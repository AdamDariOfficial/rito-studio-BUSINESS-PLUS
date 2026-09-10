// The Worker compatibility date enables Cloudflare's automatic close-frame reply.
// This callback runs after the runtime has completed the close handshake, so it must
// not attempt to transmit observed sentinel codes such as 1005, 1006, or 1015.
export function handleConsultationWebSocketClose(
  webSocket: WebSocket,
  code: number,
  reason: string,
  wasClean: boolean,
): void {
  void webSocket;
  void code;
  void reason;
  void wasClean;
}
