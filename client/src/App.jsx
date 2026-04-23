import React from 'react';
import './styles/global.css';
import Timer from './components/Timer';
import TaskList from './components/TaskList';

function App() {
  return (
    <div className="app-container">
      <div className="mesh-gradient"></div>
      
      <main className="content">
        <header className="header glass">
          <h1 className="title-gradient">Aura Hub</h1>
          <p className="subtitle">Your Minimalist Productivity Sanctuary</p>
        </header>

        <section className="dashboard-grid">
          <div className="timer-section">
            <Timer />
          </div>
          <div className="tasks-section">
            <TaskList />
          </div>
        </section>

        <section className="info-cards">
          <div className="glass-card feature">
            <h3>Focus Mode</h3>
            <p>High-intensity concentration cycles. Set your custom time and find your flow.</p>
          </div>
          <div className="glass-card feature">
            <h3>Intentions</h3>
            <p>Organize your day with clarity. Your tasks and notes are saved automatically.</p>
          </div>
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
          gap: 50px;
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
          margin-top: 10px;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 30px;
          align-items: start;
        }
        .info-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 25px;
        }
        .feature {
          padding: 35px;
          text-align: left;
        }
        .feature h3 {
          font-size: 1.4rem;
          margin-bottom: 15px;
          color: var(--primary);
        }
        .feature p {
          color: var(--text-secondary);
          line-height: 1.7;
          font-size: 1rem;
        }

        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .app-container {
            padding: 40px 20px;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
