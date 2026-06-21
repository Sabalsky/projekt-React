// wlasny blad z kodem HTTP - serwisy rzucaja nim przy bledach biznesowych,
// a errorHandler na koncu zamienia go na odpowiedz JSON
export class AppError extends Error {
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
