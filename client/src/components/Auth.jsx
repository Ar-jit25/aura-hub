import React, { useState } from 'react';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Explicitly using the full local URL for diagnostic clarity
    const baseUrl = 'http://localhost:5000';
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      console.log(`[AUTH] Attempting ${endpoint} for ${username}...`);
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('aura_token', data.token);
        localStorage.setItem('aura_user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        // Detailed error reporting from the server
        setError(data.message || 'Server returned an error');
        console.error('[AUTH ERROR]', data);
      }
    } catch (err) {
      setError('Cannot reach Aura Server. Is it running?');
      console.error('[AUTH FETCH ERROR]', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-portal glass">
      <div className="auth-content">
        <h2 className="title-display">{isLogin ? 'Enter Hub' : 'Join Aura'}</h2>
        <p className="auth-subtitle">{isLogin ? 'Enter your unique handle' : 'Choose your permanent username'}</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input">
            <input type="text" placeholder="@username" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isLoading} />
          </div>
          <div className="auth-input">
            <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
          </div>
          {error && <div className="auth-error-box"><p className="auth-error">{error}</p></div>}
          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? 'Verifying...' : (isLogin ? 'Unlock Hub' : 'Establish Aura')}
          </button>
        </form>

        <button className="toggle-btn" onClick={() => { setIsLogin(!isLogin); setError(''); }} disabled={isLoading}>
          {isLogin ? "Need a new profile? Establish here" : "Return to your existing hub"}
        </button>
      </div>

      <style jsx>{`
        .auth-portal { padding: 60px; border-radius: 40px; width: 100%; max-width: 500px; text-align: center; animation: emerge 1s ease-out; }
        .auth-subtitle { color: var(--text-dim); margin-bottom: 40px; letter-spacing: 2px; text-transform: uppercase; font-size: 0.7rem; }
        .auth-form { display: flex; flex-direction: column; gap: 20px; }
        .auth-input input { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); padding: 18px; border-radius: 12px; color: white; outline: none; transition: 0.3s; font-family: inherit; }
        .auth-input input:focus { border-color: var(--primary); background: rgba(255,255,255,0.06); }
        .auth-submit { background: var(--primary); color: white; border: none; padding: 18px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.3s; margin-top: 10px; font-family: inherit; text-transform: uppercase; letter-spacing: 1px; }
        .auth-submit:hover:not(:disabled) { box-shadow: 0 0 20px rgba(192, 132, 252, 0.4); transform: scale(1.02); }
        .auth-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .auth-error-box { background: rgba(255, 107, 107, 0.1); border: 1px solid rgba(255, 107, 107, 0.3); padding: 15px; border-radius: 12px; margin-top: 5px; }
        .auth-error { color: #ff6b6b; font-size: 0.85rem; font-weight: 500; }
        
        .toggle-btn { background: transparent; border: none; color: var(--text-dim); margin-top: 30px; cursor: pointer; font-size: 0.8rem; font-family: inherit; }
        .toggle-btn:hover { color: white; }
        @keyframes emerge { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default Auth;
