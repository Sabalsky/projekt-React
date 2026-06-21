import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

const STATUS_LABEL = { active: 'Aktywna', ended: 'Zakończona', scheduled: 'Zaplanowana' };

// strona glowna - lista aukcji z filtrami i stronicowaniem
export default function AuctionsPage() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ category: '', status: '', sortBy: 'created_at', order: 'desc' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .listAuctions({ ...filters, page, limit: 6 })
      .then((d) => { setData(d); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filters, page]);

  const set = (k) => (e) => { setPage(1); setFilters({ ...filters, [k]: e.target.value }); };

  return (
    <div>
      <div className="page-head">
        <h2>Dostępne aukcje</h2>
        <span className="muted">{data.total} wyników</span>
      </div>

      <div className="filters">
        <input placeholder="Kategoria..." value={filters.category} onChange={set('category')} />
        <select value={filters.status} onChange={set('status')}>
          <option value="">Wszystkie statusy</option>
          <option value="active">Aktywne</option>
          <option value="scheduled">Zaplanowane</option>
          <option value="ended">Zakończone</option>
        </select>
        <select value={filters.sortBy} onChange={set('sortBy')}>
          <option value="created_at">Sortuj: data dodania</option>
          <option value="end_date">Sortuj: data końca</option>
          <option value="current_price">Sortuj: cena</option>
          <option value="title">Sortuj: nazwa</option>
        </select>
        <select value={filters.order} onChange={set('order')}>
          <option value="desc">malejąco</option>
          <option value="asc">rosnąco</option>
        </select>
      </div>

      {loading && <p>Ładowanie...</p>}
      {error && <p className="error">{error}</p>}

      <div className="grid">
        {data.items.map((a) => (
          <Link to={`/auctions/${a.id}`} key={a.id} className="card auction-card">
            <div className="row">
              <span className="category">{a.category}</span>
              <span className={`badge badge-${a.status}`}>{STATUS_LABEL[a.status]}</span>
            </div>
            <h3>{a.title}</h3>
            <p className="desc">{a.description || 'Brak opisu'}</p>
            <div className="price">
              <span className="muted small">Aktualna cena</span>
              <strong>{a.currentPrice.toFixed(2)} zł</strong>
            </div>
            <p className="muted small">Koniec: {new Date(a.endDate).toLocaleString('pl-PL')}</p>
          </Link>
        ))}
      </div>

      {!loading && data.items.length === 0 && <p className="muted">Brak aukcji spełniających kryteria.</p>}

      {data.totalPages > 1 && (
        <div className="pagination">
          <button className="btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Poprzednia</button>
          <span>Strona {data.page} z {data.totalPages}</span>
          <button className="btn-sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Następna</button>
        </div>
      )}
    </div>
  );
}
