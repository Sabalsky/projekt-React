/**
 * Cienki klient REST API. Frontend komunikuje sie z systemem WYLACZNIE przez te warstwe
 * (zgodnie z wymaganiem: brak bezposredniego dostepu do bazy danych).
 * W dev zapytania ida na /api/* i sa proxowane przez Vite na backend :3000.
 */
const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `Blad ${res.status}`;
    const details = data?.error?.details;
    const err = new Error(msg);
    err.status = res.status;
    err.details = details;
    throw err;
  }
  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),

  // Auctions
  listAuctions: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    ).toString();
    return request(`/auctions${qs ? `?${qs}` : ''}`);
  },
  getAuction: (id) => request(`/auctions/${id}`),
  createAuction: (payload) => request('/auctions', { method: 'POST', body: payload, auth: true }),
  deleteAuction: (id) => request(`/auctions/${id}`, { method: 'DELETE', auth: true }),

  // Bids
  getBids: (id) => request(`/auctions/${id}/bids`),
  placeBid: (id, amount) =>
    request(`/auctions/${id}/bids`, { method: 'POST', body: { amount }, auth: true }),
};
