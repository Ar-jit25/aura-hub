import React, { useState, useEffect } from 'react';

const Timer = () => {
  const [workTime, setWorkTime] = useState(25);
  const [shortTime, setShortTime] = useState(5);
  const [longTime, setLongTime] = useState(15);
  
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work');

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) setSeconds(seconds - 1);
        else if (minutes > 0) { setMinutes(minutes - 1); setSeconds(59); }
        else { clearInterval(interval); setIsActive(false); }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = (newMode = mode) => {
    setIsActive(false);
    setMode(newMode);
    let mins = newMode === 'work' ? workTime : newMode === 'short' ? shortTime : longTime;
    setMinutes(mins);
    setSeconds(0);
  };

  const handleTimeChange = (val, targetMode) => {
    const mins = parseInt(val) || 1;
    if (targetMode === 'work') setWorkTime(mins);
    if (targetMode === 'short') setShortTime(mins);
    if (targetMode === 'long') setLongTime(mins);
    if (!isActive && mode === targetMode) { setMinutes(mins); setSeconds(0); }
  };

  const formatTime = (time) => String(time).padStart(2, '0');

  return (
    <div className="monumental-timer">
      <div className="timer-nav">
        <button className={mode === 'work' ? 'active' : ''} onClick={() => resetTimer('work')}>Focus</button>
        <button className={mode === 'short' ? 'active' : ''} onClick={() => resetTimer('short')}>Short Break</button>
        <button className={mode === 'long' ? 'active' : ''} onClick={() => resetTimer('long')}>Long Break</button>
      </div>

      <div className="digital-display">
        <div className="time-block">
          <span className="numbers">{formatTime(minutes)}</span>
          <span className="label">MIN</span>
        </div>
        <span className="colon-blink">:</span>
        <div className="time-block">
          <span className="numbers">{formatTime(seconds)}</span>
          <span className="label">SEC</span>
        </div>
      </div>

      <div className="timer-controls">
        <button className={`play-btn ${isActive ? 'pause' : 'play'}`} onClick={toggleTimer}>
          {isActive ? 'Pause' : 'Start Session'}
        </button>
        <div className="edit-zone">
          <input 
            type="number" 
            value={mode === 'work' ? workTime : mode === 'short' ? shortTime : longTime} 
            onChange={(e) => handleTimeChange(e.target.value, mode)} 
          />
          <span>mins</span>
        </div>
      </div>

      <style jsx>{`
        .monumental-timer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
        }

        .timer-nav {
          display: flex;
          gap: 20px;
          padding: 10px;
        }

        .timer-nav button {
          background: transparent;
          border: none;
          color: var(--text-dim);
          font-size: 0.9rem;
          letter-spacing: 3px;
          text-transform: uppercase;
          cursor: pointer;
          transition: 0.3s;
          position: relative;
        }

        .timer-nav button.active {
          color: var(--primary);
          font-weight: 600;
        }

        .timer-nav button.active::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--primary);
          box-shadow: 0 0 10px var(--primary);
        }

        .digital-display {
          font-family: 'JetBrains Mono', monospace;
          display: flex;
          align-items: baseline;
          gap: 20px;
          color: white;
        }

        .time-block {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .numbers {
          font-size: clamp(8rem, 15vw, 15rem);
          font-weight: 700;
          line-height: 0.8;
          text-shadow: 0 0 50px rgba(192, 132, 252, 0.3);
        }

        .label {
          font-size: 0.9rem;
          color: var(--text-dim);
          letter-spacing: 5px;
          margin-top: 10px;
        }

        .colon-blink {
          font-size: 8rem;
          opacity: 0.3;
          animation: blink 2s infinite;
        }

        @keyframes blink { 0%, 100% { opacity: 0.1; } 50% { opacity: 0.6; } }

        .timer-controls {
          display: flex;
          align-items: center;
          gap: 30px;
          background: rgba(255,255,255,0.03);
          padding: 10px 30px;
          border-radius: 50px;
          border: 1px solid var(--glass-border);
        }

        .play-btn {
          background: var(--primary);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 30px;
          font-weight: 600;
          letter-spacing: 1px;
          cursor: pointer;
          transition: 0.3s;
        }

        .edit-zone {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.8rem;
          color: var(--text-dim);
          text-transform: uppercase;
        }

        .edit-zone input {
          width: 50px;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--glass-border);
          color: white;
          text-align: center;
          font-family: inherit;
        }

        @media (max-width: 1200px) {
          .numbers { font-size: 8rem; }
        }
      `}</style>
    </div>
  );
};

export default Timer;
