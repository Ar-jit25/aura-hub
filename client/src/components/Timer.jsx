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
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          clearInterval(interval);
          setIsActive(false);
          // Auto-switch mode or play alert could be added here
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
    if (newMode === 'work') mins = workTime;
    else if (newMode === 'short') mins = shortTime;
    else if (newMode === 'long') mins = longTime;
    
    setMinutes(mins);
    setSeconds(0);
  };

  const handleTimeChange = (val, targetMode) => {
    const mins = parseInt(val) || 1;
    if (targetMode === 'work') setWorkTime(mins);
    if (targetMode === 'short') setShortTime(mins);
    if (targetMode === 'long') setLongTime(mins);

    if (!isActive && mode === targetMode) {
      setMinutes(mins);
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

      <div className="custom-config">
        <div className="input-group">
          <label>Minutes</label>
          {mode === 'work' && <input type="number" value={workTime} onChange={(e) => handleTimeChange(e.target.value, 'work')} min="1" max="120" />}
          {mode === 'short' && <input type="number" value={shortTime} onChange={(e) => handleTimeChange(e.target.value, 'short')} min="1" max="60" />}
          {mode === 'long' && <input type="number" value={longTime} onChange={(e) => handleTimeChange(e.target.value, 'long')} min="1" max="180" />}
        </div>
      </div>

      <div className="controls">
        <button className={`main-btn ${isActive ? 'pause' : 'start'}`} onClick={toggleTimer}>
          {isActive ? 'Pause' : 'Start ' + mode.charAt(0).toUpperCase() + mode.slice(1)}
        </button>
        <button className="reset-btn" onClick={() => resetTimer()}>Reset</button>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&display=swap');

        .timer-container { padding: 35px; display: flex; flex-direction: column; align-items: center; min-height: 480px; justify-content: space-between; gap: 20px;}
        
        .mode-tabs { display: flex; gap: 8px; background: rgba(255, 255, 255, 0.03); padding: 5px; border-radius: 14px; }
        .mode-tabs button { background: transparent; border: none; color: var(--text-secondary); padding: 10px 18px; border-radius: 10px; cursor: pointer; transition: 0.3s; font-family: inherit; }
        .mode-tabs button.active { background: var(--primary); color: white; }

        .clock-display { font-family: 'JetBrains Mono', monospace; font-size: 7rem; font-weight: 700; color: white; text-shadow: 0 0 30px rgba(139, 92, 246, 0.4); letter-spacing: -5px; }
        .separator { animation: blink 2s infinite; opacity: 0.8; margin-bottom: 10px; }
        @keyframes blink { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }

        .custom-config { display: flex; flex-direction: column; align-items: center; }
        .input-group { display: flex; align-items: center; gap: 10px; color: var(--text-secondary); font-size: 0.9rem; }
        .input-group input { width: 60px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); border-radius: 8px; padding: 6px; color: white; text-align: center; font-family: inherit; }

        .controls { display: flex; gap: 15px; width: 100%; }
        .main-btn { flex: 2; padding: 18px; border-radius: 12px; border: none; font-weight: 600; font-size: 1.1rem; cursor: pointer; transition: 0.3s; }
        .main-btn.start { background: white; color: var(--bg-dark); }
        .main-btn.pause { background: var(--secondary); color: white; }
        .reset-btn { flex: 1; padding: 18px; border-radius: 12px; border: 1px solid var(--glass-border); background: rgba(255, 255, 255, 0.02); color: white; cursor: pointer; }

        @media (max-width: 450px) { .clock-display { font-size: 5rem; } }
      `}</style>
    </div>
  );
};

export default Timer;
