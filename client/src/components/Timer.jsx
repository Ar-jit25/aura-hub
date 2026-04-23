import React, { useState, useEffect } from 'react';

const Timer = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [customTime, setCustomTime] = useState(25);
  const [mode, setMode] = useState('work');

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          clearInterval(interval);
          setIsActive(false);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = (newMode = mode) => {
    setIsActive(false);
    setMode(newMode);
    let mins = 25;
    if (newMode === 'work') mins = customTime;
    else if (newMode === 'short') mins = 5;
    else if (newMode === 'long') mins = 15;
    
    setMinutes(mins);
    setSeconds(0);
  };

  const handleCustomTimeChange = (e) => {
    const val = parseInt(e.target.value) || 1;
    setCustomTime(val);
    if (!isActive && mode === 'work') {
      setMinutes(val);
      setSeconds(0);
    }
  };

  const formatTime = (time) => String(time).padStart(2, '0');

  return (
    <div className="timer-container glass">
      <div className="mode-tabs">
        <button className={mode === 'work' ? 'active' : ''} onClick={() => resetTimer('work')}>Focus</button>
        <button className={mode === 'short' ? 'active' : ''} onClick={() => resetTimer('short')}>Short Break</button>
        <button className={mode === 'long' ? 'active' : ''} onClick={() => resetTimer('long')}>Long Break</button>
      </div>

      <div className="clock-display">
        <span className="digit">{formatTime(minutes)}</span>
        <span className="separator">:</span>
        <span className="digit">{formatTime(seconds)}</span>
      </div>

      {mode === 'work' && (
        <div className="custom-input">
          <label>Set Minutes:</label>
          <input 
            type="number" 
            value={customTime} 
            onChange={handleCustomTimeChange}
            min="1"
            max="120"
          />
        </div>
      )}

      <div className="controls">
        <button className={`main-btn ${isActive ? 'pause' : 'start'}`} onClick={toggleTimer}>
          {isActive ? 'Pause' : 'Start Focus'}
        </button>
        <button className="reset-btn" onClick={() => resetTimer()}>Reset</button>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&display=swap');

        .timer-container {
          padding: 35px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 25px;
          min-height: 480px;
          justify-content: space-between;
        }
        .mode-tabs {
          display: flex;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          padding: 6px;
          border-radius: 14px;
        }
        .mode-tabs button {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 10px 18px;
          border-radius: 10px;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }
        .mode-tabs button.active {
          background: var(--primary);
          color: white;
        }
        .clock-display {
          font-family: 'JetBrains Mono', monospace;
          font-size: 7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          color: white;
          text-shadow: 0 0 40px rgba(139, 92, 246, 0.5);
          letter-spacing: -5px;
        }
        .separator {
          animation: blink 2s infinite;
          opacity: 0.8;
          margin-bottom: 15px;
        }
        @keyframes blink {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        .custom-input {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .custom-input input {
          width: 60px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          padding: 6px;
          color: white;
          text-align: center;
          font-family: inherit;
        }
        .controls {
          display: flex;
          gap: 15px;
          width: 100%;
        }
        .main-btn {
          flex: 2;
          padding: 18px;
          border-radius: 12px;
          border: none;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .main-btn.start {
          background: white;
          color: var(--bg-dark);
        }
        .main-btn.pause {
          background: var(--secondary);
          color: white;
        }
        .reset-btn {
          flex: 1;
          padding: 18px;
          border-radius: 12px;
          border: 1px solid var(--glass-border);
          background: rgba(255, 255, 255, 0.02);
          color: white;
          cursor: pointer;
        }
        .reset-btn:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        @media (max-width: 450px) {
          .clock-display { font-size: 5rem; }
        }
      `}</style>
    </div>
  );
};

export default Timer;
