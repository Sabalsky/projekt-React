import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

const STATUS_LABEL = { active: 'Aktywna', ended: 'Zakończona', scheduled: 'Zaplanowana' };

/** Szczegoly aukcji + historia ofert + formularz licytacji. */
export default function AuctionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    const [a, b] = await Promise.all([api.getAuction(id), api.getBids(id)]);
    setAuction(a);
    setBids(b);
  }, [id]);

  useEffect(() => { load().catch((e) => setError(e.message)); }, [load]);

  async function submitBid(e) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    try {
      await api.placeBid(id, Number(amount));
      setMsg('Oferta przyjęta!');
      setAmount('');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeAuction() {
    if (!confirm('Na pewno usunąć tę aukcję?')) return;
    try {
      await api.deleteAuction(id);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !auction) return <p className="error">{error}</p>;
  if (!auction) return <p>Ładowanie...</p>;

  const isOwner = user && user.id === auction.ownerId;
  const canBid = user && auction.status === 'active' && !isOwner;

  return (
    <div className="detail">
      <Link to="/" className="btn-link">Wróć do listy aukcji</Link>
      <div className="card">
        <div className="row">
          <span className="category">{auction.category}</span>
          <span className={`badge badge-${auction.status}`}>{STATUS_LABEL[auction.status]}</span>
        </div>
        <h2>{auction.title}</h2>
        <p>{auction.description || 'Brak opisu'}</p>
        <div className="meta-grid">
          <div><span className="muted small">Cena wywoławcza</span><strong>{auction.startingPrice.toFixed(2)} zł</strong></div>
          <div><span className="muted small">Aktualna cena</span><strong className="big">{auction.currentPrice.toFixed(2)} zł</strong></div>
          <div><span className="muted small">Start</span><span>{new Date(auction.startDate).toLocaleString('pl-PL')}</span></div>
          <div><span className="muted small">Koniec</span><span>{new Date(auction.endDate).toLocaleString('pl-PL')}</span></div>
        </div>

        {isOwner && (
          <button className="btn btn-danger" onClick={removeAuction}>Usuń aukcję</button>
        )}
      </div>

      <div className="card">
        <h3>Złóż ofertę</h3>
        {!user && <p className="muted">Aby licytować, <Link to="/login">zaloguj się</Link>.</p>}
        {user && isOwner && <p className="muted">Nie możesz licytować własnej aukcji.</p>}
        {user && !isOwner && auction.status !== 'active' && <p className="muted">Licytacja niedostępna (aukcja {STATUS_LABEL[auction.status].toLowerCase()}).</p>}
        {canBid && (
          <form onSubmit={submitBid} className="bid-form">
            <input
              type="number" step="0.01" min={auction.currentPrice + 0.01}
              placeholder={`Więcej niż ${auction.currentPrice.toFixed(2)} zł`}
              value={amount} onChange={(e) => setAmount(e.target.value)} required
            />
            <button className="btn">Licytuj</button>
          </form>
        )}
        {msg && <p className="success">{msg}</p>}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="card">
        <h3>Historia ofert ({bids.length})</h3>
        {bids.length === 0 ? (
          <p className="muted">Brak ofert — bądź pierwszy!</p>
        ) : (
          <table className="bids">
            <thead><tr><th>Licytujący</th><th>Kwota</th><th>Data</th></tr></thead>
            <tbody>
              {bids.map((b) => (
                <tr key={b.id}>
                  <td>{b.bidderUsername}</td>
                  <td><strong>{b.amount.toFixed(2)} zł</strong></td>
                  <td className="muted small">{new Date(b.createdAt.replace(' ', 'T') + 'Z').toLocaleString('pl-PL')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
