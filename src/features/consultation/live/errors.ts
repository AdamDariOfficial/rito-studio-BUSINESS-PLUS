export class ConsultationInputError extends Error {
  constructor(message = "Controlla i dati della richiesta.") {
    super(message);
    this.name = "ConsultationInputError";
  }
}

export class ConsultationRateLimitError extends Error {
  constructor(message = "Troppe richieste ravvicinate. Attendi un momento e riprova.") {
    super(message);
    this.name = "ConsultationRateLimitError";
  }
}
