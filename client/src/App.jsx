import React, { useState, useEffect, useRef } from 'react';
import './styles/global.css';
import Timer from './components/Timer';
import TaskList from './components/TaskList';
import MusicPlayer from './components/MusicPlayer';
import Auth from './components/Auth';

const QUOTES = [
  { text: "Focus is the art of knowing what to ignore.", author: "Ritu Ghatourey" },
  { text: "Your mind is for having ideas, not holding them.", author: "David Allen" },
  { text: "Deep work is the superpower of the 21st century.", author: "Cal Newport" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" }
];

function App() {
  const [user, setUser] = useState(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('aura_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      handleNext();
    }, 60000);
  };

  const handleNext = () => {
    setFade(false);
    setTimeout(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
      setFade(true);
      startTimer();
    }, 500);
  };

  const handlePrev = () => {
    setFade(false);
    setTimeout(() => {
      setQuoteIndex((prev) => (prev === 0 ? QUOTES.length - 1 : prev - 1));
      setFade(true);
      startTimer();
    }, 500);
  };

  const handleLogout = () => {
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_user');
    setUser(null);
  };

  return (
    <div className="panoramic-shell">
      <div className="aura-canvas">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
      
      {!user ? (
        <div className="auth-fullscreen">
          <Auth onLogin={setUser} />
        </div>
      ) : (
        <>
          <nav className="site-header glass">
            <h1 className="brand-logo">Aura <span>Hub</span></h1>
            <div className="nav-actions">
              <span className="user-handle">@{user.username}</span>
              <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
            </div>
          </nav>

          <main className="dashboard-grid">
            <section className="focus-hub">
              <div className="timer-wrapper">
                <Timer />
              </div>
            </section>

            <section className="management-panel">
              <div className="music-module glass">
                <MusicPlayer />
              </div>
              <div className="tasks-module glass">
                <TaskList />
              </div>
            </section>
          </main>

          <footer className="quote-bar glass">
            <button onClick={handlePrev}>‹</button>
            <div className={`quote-box ${fade ? 'fade-in' : 'fade-out'}`}>
              <p>"{QUOTES[quoteIndex].text}" — <span>{QUOTES[quoteIndex].author}</span></p>
            </div>
            <button onClick={handleNext}>›</button>
          </footer>
        </>
      )}

      <style jsx>{`
        .panoramic-shell { width: 100%; height: 100vh; display: flex; flex-direction: column; overflow: hidden; position: fixed; top: 0; left: 0; }
        .auth-fullscreen { flex: 1; display: flex; justify-content: center; align-items: center; z-index: 20; }
        .site-header { height: 60px; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 40px; flex-shrink: 0; border: none; border-bottom: 1px solid var(--glass-border); z-index: 10; }
        .brand-logo { font-size: 1.2rem; font-weight: 300; letter-spacing: 5px; text-transform: uppercase; }
        .brand-logo span { color: var(--primary); font-weight: 700; }
        .nav-actions { display: flex; align-items: center; gap: 20px; }
        .user-handle { font-size: 0.8rem; color: var(--primary); font-weight: 600; letter-spacing: 1px; }
        .logout-btn { background: transparent; border: 1px solid var(--glass-border); padding: 6px 15px; border-radius: 20px; color: white; cursor: pointer; font-size: 0.7rem; transition: 0.3s; }
        .logout-btn:hover { background: var(--secondary); border-color: var(--secondary); }
        .dashboard-grid { flex: 1; display: grid; grid-template-columns: 1fr 400px; padding: 20px; gap: 20px; width: 100%; box-sizing: border-box; max-height: calc(100vh - 130px); overflow: hidden; }
        .focus-hub { display: flex; justify-content: center; align-items: center; background: rgba(255,255,255,0.01); border-radius: 24px; border: 1px solid var(--glass-border); height: 100%; }
        .management-panel { display: flex; flex-direction: column; gap: 20px; height: 100%; overflow: hidden; }
        .music-module { padding: 15px; border-radius: 20px; flex-shrink: 0; }
        .tasks-module { flex: 1; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; }
        .quote-bar { height: 70px; width: 100%; display: flex; justify-content: center; align-items: center; padding: 0 40px; flex-shrink: 0; border: none; border-top: 1px solid var(--glass-border); }
        .quote-bar button { background: transparent; border: none; color: var(--text-dim); font-size: 1.8rem; cursor: pointer; transition: 0.3s; }
        .quote-box { flex: 1; text-align: center; }
        @media (max-width: 1100px) { .dashboard-grid { grid-template-columns: 1fr; overflow-y: auto; height: auto; max-height: none; } .panoramic-shell { overflow-y: auto; height: auto; position: relative; } .management-panel { height: 800px; } }
      `}</style>
    </div>
  );
}

export default App;
