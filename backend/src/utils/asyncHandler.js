/**
 * Owija handler kontrolera tak, by wyjatki (rowniez z await)
 * trafialy do next() i globalnego errorHandlera - bez powtarzania try/catch.
 * @param {Function} fn
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
