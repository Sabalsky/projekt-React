import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import AuctionsPage from './pages/AuctionsPage.jsx';
import AuctionDetailPage from './pages/AuctionDetailPage.jsx';
import CreateAuctionPage from './pages/CreateAuctionPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <Link to="/" className="brand">Serwis Aukcyjny</Link>
      <nav>
        <Link to="/">Aukcje</Link>
        {user && <Link to="/new">Wystaw przedmiot</Link>}
        {user ? (
          <span className="user-box">
            <span className="hi">{user.username}</span>
            <button className="btn-link" onClick={() => { logout(); navigate('/'); }}>Wyloguj</button>
          </span>
        ) : (
          <Link to="/login">Zaloguj</Link>
        )}
      </nav>
    </header>
  );
}

// jak ktos nie jest zalogowany, to wywalam go na logowanie
function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div className="app">
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/" element={<AuctionsPage />} />
          <Route path="/auctions/:id" element={<AuctionDetailPage />} />
          <Route path="/new" element={<RequireAuth><CreateAuctionPage /></RequireAuth>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">
        Praca zaliczeniowa &mdash; Tworzenie usług sieciowych REST
      </footer>
    </div>
  );
}
