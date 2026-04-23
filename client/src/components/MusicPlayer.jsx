import React, { useState, useEffect, useRef } from 'react';

const MusicPlayer = () => {
  const [activeVibe, setActiveVibe] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const playerRef = useRef(null);
  const [isApiReady, setIsApiReady] = useState(false);

  // Focus on the three perfectly reliable vibes
  const vibes = [
    { id: 'rain', name: 'Rainy Night', icon: '🌧️', videoId: 'mPZkdNFkNps' },
    { id: 'forest', name: 'Morning Forest', icon: '🌿', videoId: 'vPhg6sc1Mk4' },
    { id: 'lofi', name: 'Zen Lofi', icon: '🎹', videoId: 'jfKfPfyJRdk' }
  ];

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsApiReady(true);
      };
    } else {
      setIsApiReady(true);
    }
  }, []);

  const handleVibeClick = (vibe) => {
    if (!isApiReady) return;

    if (activeVibe?.id === vibe.id) {
      if (isPlaying) {
        playerRef.current?.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current?.playVideo();
        setIsPlaying(true);
      }
    } else {
      setActiveVibe(vibe);
      setIsPlaying(true);
      
      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        playerRef.current.loadVideoById(vibe.videoId);
        playerRef.current.setVolume(volume);
        playerRef.current.playVideo();
      } else {
        playerRef.current = new window.YT.Player('yt-player', {
          height: '0',
          width: '0',
          videoId: vibe.videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            showinfo: 0,
            modestbranding: 1,
            loop: 1,
            playlist: vibe.videoId
          },
          events: {
            onReady: (event) => {
              event.target.setVolume(volume);
              event.target.playVideo();
            }
          }
        });
      }
    }
  };

  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  return (
    <div className="music-container glass">
      <div id="yt-player" style={{ position: 'absolute', top: '-1000px', left: '-1000px', opacity: 0 }}></div>
      
      <div className="player-header">
        <div className="status">
          <div className={`indicator ${isPlaying ? 'playing' : ''}`}></div>
          <h3>{activeVibe ? activeVibe.name : 'Select Aura'}</h3>
        </div>
        <div className="volume-slider">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={volume} 
            onChange={(e) => setVolume(parseInt(e.target.value))} 
          />
        </div>
      </div>

      <div className="vibe-grid">
        {vibes.map((vibe) => (
          <button 
            key={vibe.id} 
            className={`vibe-card ${activeVibe?.id === vibe.id ? 'active' : ''}`}
            onClick={() => handleVibeClick(vibe)}
          >
            <span className="vibe-icon">{vibe.icon}</span>
            <span className="vibe-name">{vibe.name}</span>
            {activeVibe?.id === vibe.id && isPlaying && (
              <div className="viz">
                <span></span><span></span><span></span>
              </div>
            )}
          </button>
        ))}
      </div>

      {!isApiReady && <p className="loading-api">Waking Sanctuaries...</p>}

      <style jsx>{`
        .music-container { padding: 30px; display: flex; flex-direction: column; gap: 20px; }
        .player-header { display: flex; justify-content: space-between; align-items: center; }
        .status { display: flex; align-items: center; gap: 10px; }
        .indicator { width: 10px; height: 10px; background: rgba(255,255,255,0.1); border-radius: 50%; }
        .indicator.playing { background: #10b981; box-shadow: 0 0 15px #10b981; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
        .volume-slider input { width: 100px; accent-color: var(--primary); cursor: pointer; outline: none; }
        .vibe-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .vibe-card { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 20px; padding: 25px 5px; display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; transition: 0.3s; position: relative; overflow: hidden; }
        .vibe-card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.06); }
        .vibe-card.active { border-color: var(--primary); background: rgba(139, 92, 246, 0.15); }
        .vibe-icon { font-size: 2.2rem; }
        .vibe-name { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-secondary); font-weight: 500; }
        .loading-api { font-size: 0.6rem; color: var(--primary); text-align: center; }
        .viz { display: flex; gap: 3px; height: 12px; margin-top: 5px; }
        .viz span { width: 3px; background: var(--primary); border-radius: 10px; animation: wave 0.6s infinite alternate; }
        .viz span:nth-child(2) { animation-delay: 0.1s; }
        .viz span:nth-child(3) { animation-delay: 0.2s; }
        @keyframes wave { from { height: 4px; } to { height: 12px; } }
      `}</style>
    </div>
  );
};

export default MusicPlayer;
