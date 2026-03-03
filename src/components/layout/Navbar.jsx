import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/navbar.css';

export default function Navbar() {
  const { user, profile, signOut, isOrganiser, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleHashLink(hash) {
    setMenuOpen(false);
    if (!isLanding) {
      navigate('/' + hash);
    } else {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="logo">
          <span className="logo-text">NIRMAVORA</span>
          <span className="logo-year">FEST</span>
        </Link>

        <button
          className={`nav-toggle${menuOpen ? ' active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <span /><span /><span />
        </button>

        <ul className={`nav-menu${menuOpen ? ' active' : ''}`}>
          {isLanding && (
            <>
              <li><a onClick={() => handleHashLink('#home')}>Home</a></li>
              <li><a onClick={() => handleHashLink('#about')}>About</a></li>
              <li><a onClick={() => handleHashLink('#designathon')}>Designathon</a></li>
              <li><a onClick={() => handleHashLink('#hackathon')}>Hackathon</a></li>
              <li><a onClick={() => handleHashLink('#timeline')}>Timeline</a></li>
              <li><a onClick={() => handleHashLink('#fees')}>Fees</a></li>
              <li><a onClick={() => handleHashLink('#location')}>Location</a></li>
              <li><a onClick={() => handleHashLink('#contact')}>Contact</a></li>
            </>
          )}
          {!isLanding && (
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          )}
          {user ? (
            <>
              <li><Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link></li>
              {isOrganiser && (
                <li><Link to="/coordinator/panel" onClick={() => setMenuOpen(false)}>Coordinator</Link></li>
              )}
              {isAdmin && (
                <li><Link to="/admin" onClick={() => setMenuOpen(false)}>Admin CC</Link></li>
              )}
              <li>
                <button className="btn-nav-signout" onClick={handleSignOut}>Sign Out</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/auth" className="btn-nav-register" onClick={() => setMenuOpen(false)}>
                  Register Now
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
