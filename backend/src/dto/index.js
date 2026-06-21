/**
 * DTO (Data Transfer Objects) - mapuja surowe rekordy z bazy (snake_case)
 * na ksztalt zwracany przez API (camelCase). Gwarantuja, ze wrazliwe pola
 * (np. password_hash) nigdy nie trafiaja do odpowiedzi.
 */

export function toUserDto(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    createdAt: row.created_at,
  };
}

export function toAuctionDto(row) {
  if (!row) return null;
  const now = new Date();
  const start = new Date(row.start_date);
  const end = new Date(row.end_date);
  let status = 'active';
  if (start > now) status = 'scheduled';
  else if (end <= now) status = 'ended';

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    startingPrice: row.starting_price,
    currentPrice: row.current_price,
    startDate: row.start_date,
    endDate: row.end_date,
    ownerId: row.owner_id,
    status,
    createdAt: row.created_at,
  };
}

export function toBidDto(row) {
  if (!row) return null;
  return {
    id: row.id,
    auctionId: row.auction_id,
    bidderId: row.bidder_id,
    bidderUsername: row.bidder_username, // obecne tylko w zapytaniach z JOIN
    amount: row.amount,
    createdAt: row.created_at,
  };
}
