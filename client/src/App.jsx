import React, { useState, useEffect, useRef } from 'react';
import './styles/global.css';
import Timer from './components/Timer';
import TaskList from './components/TaskList';
import MusicPlayer from './components/MusicPlayer';

const QUOTES = [
  { text: "Focus is the art of knowing what to ignore.", author: "Ritu Ghatourey" },
  { text: "Your mind is for having ideas, not holding them.", author: "David Allen" },
  { text: "Deep work is the superpower of the 21st century.", author: "Cal Newport" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "One day or day one. You decide.", author: "Aura Mastery" },
  { text: "Energy is the essence of life. Use it wisely.", author: "Oprah Winfrey" },
  { text: "Don't busy yourself with being busy.", author: "Minimalist Wisdom" },
  { text: "Small steps in the right direction become the biggest.", author: "Mindful Focus" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Amateurs wait for inspiration, the rest of us go to work.", author: "Stephen King" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Discipline is choosing what you want most over what you want now.", author: "Abraham Lincoln" }
];

function App() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const timerRef = useRef(null);

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
      startTimer(); // Reset auto-cycle timer on manual change
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

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="app-container">
      <div className="mesh-gradient"></div>
      
      <main className="content">
        <header className="header glass">
          <h1 className="title-gradient">Aura Hub</h1>
          <p className="subtitle">Your Minimalist Productivity Sanctuary</p>
        </header>

        <section className="dashboard-grid">
          <div className="main-tools">
            <Timer />
            <MusicPlayer />
          </div>
          <div className="tasks-sidebar">
            <TaskList />
          </div>
        </section>

        <section className="quote-panel glass">
          <button className="nav-btn prev" onClick={handlePrev}>‹</button>
          <div className={`quote-content ${fade ? 'fade-in' : 'fade-out'}`}>
            <p>"{QUOTES[quoteIndex].text}"</p>
            <span>— {QUOTES[quoteIndex].author}</span>
          </div>
          <button className="nav-btn next" onClick={handleNext}>›</button>
        </section>
      </main>

      <style jsx>{`
        .app-container {
          width: 100%;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          padding: 80px 20px;
          box-sizing: border-box;
        }
        .content {
          max-width: 1200px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 40px;
          margin-bottom: 50px;
        }
        .header {
          padding: 60px 40px;
          text-align: center;
          border-radius: 30px;
        }
        .header h1 {
          font-size: clamp(3rem, 10vw, 5rem);
          font-weight: 700;
          margin-bottom: 10px;
          letter-spacing: -2px;
          line-height: 1;
        }
        .header p {
          color: var(--text-secondary);
          font-size: 1.1rem;
          font-weight: 300;
          letter-spacing: 4px;
          text-transform: uppercase;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 30px;
          align-items: start;
        }
        .main-tools {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        .quote-panel {
          padding: 40px;
          text-align: center;
          min-height: 180px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }
        .nav-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          font-size: 1.8rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          opacity: 0;
        }
        .quote-panel:hover .nav-btn {
          opacity: 1;
        }
        .nav-btn:hover {
          background: var(--primary);
          color: white;
          transform: scale(1.1);
        }

        .quote-content {
          transition: opacity 0.5s ease;
          max-width: 800px;
          flex: 1;
          padding: 0 40px;
        }
        .quote-content.fade-in { opacity: 1; }
        .quote-content.fade-out { opacity: 0; }

        .quote-panel p {
          font-size: 1.35rem;
          font-weight: 300;
          font-style: italic;
          line-height: 1.6;
          margin-bottom: 15px;
          color: white;
        }
        .quote-panel span {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 3px;
          color: var(--primary);
          font-weight: 500;
        }

        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .nav-btn { opacity: 1; width: 36px; height: 36px; font-size: 1.4rem; }
        }
      `}</style>
    </div>
  );
}

export default App;
