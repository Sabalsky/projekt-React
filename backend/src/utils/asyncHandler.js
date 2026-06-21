// dzieki temu nie musze pisac try/catch w kazdym kontrolerze -
// blad z asynca leci do next() i lapie go errorHandler
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
