import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

/** Formularz wystawienia przedmiotu na aukcje. */
export default function CreateAuctionPage() {
  const navigate = useNavigate();
  const now = new Date();
  const inWeek = new Date(Date.now() + 7 * 24 * 3600 * 1000);
  const toLocalInput = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const [form, setForm] = useState({
    title: '', description: '', category: '', startingPrice: '',
    startDate: toLocalInput(now), endDate: toLocalInput(inWeek),
  });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const created = await api.createAuction({
        title: form.title,
        description: form.description,
        category: form.category,
        startingPrice: Number(form.startingPrice),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      });
      navigate(`/auctions/${created.id}`);
    } catch (err) {
      setError(err.details?.map((d) => `${d.field}: ${d.message}`).join('; ') || err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card narrow">
      <h2>Wystaw przedmiot na aukcję</h2>
      <form onSubmit={submit} className="form">
        <label>Nazwa przedmiotu<input value={form.title} onChange={set('title')} required minLength={3} /></label>
        <label>Opis<textarea value={form.description} onChange={set('description')} rows={3} /></label>
        <label>Kategoria<input value={form.category} onChange={set('category')} required placeholder="np. Elektronika" /></label>
        <label>Cena wywoławcza (zł)<input type="number" step="0.01" min="0.01" value={form.startingPrice} onChange={set('startingPrice')} required /></label>
        <div className="two-col">
          <label>Data rozpoczęcia<input type="datetime-local" value={form.startDate} onChange={set('startDate')} required /></label>
          <label>Data zakończenia<input type="datetime-local" value={form.endDate} onChange={set('endDate')} required /></label>
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Zapisywanie...' : 'Wystaw aukcję'}</button>
      </form>
    </div>
  );
}
