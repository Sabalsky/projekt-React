/**
 * Wyjatek aplikacyjny niosacy kod HTTP - pozwala warstwie serwisowej
 * sygnalizowac bledy biznesowe, ktore globalny errorHandler mapuje na odpowiedz.
 */
export class AppError extends Error {
  /**
   * @param {number} statusCode - kod HTTP (np. 400, 404, 409)
   * @param {string} message - komunikat dla klienta
   * @param {object} [details] - dodatkowe szczegoly (np. bledy walidacji)
   */
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg, details) {
    return new AppError(400, msg, details);
  }
  static unauthorized(msg = 'Brak autoryzacji') {
    return new AppError(401, msg);
  }
  static forbidden(msg = 'Brak uprawnien do tej operacji') {
    return new AppError(403, msg);
  }
  static notFound(msg = 'Zasob nie zostal znaleziony') {
    return new AppError(404, msg);
  }
  static conflict(msg) {
    return new AppError(409, msg);
  }
}
