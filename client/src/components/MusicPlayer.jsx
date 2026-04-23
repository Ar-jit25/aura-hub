import React, { useState, useEffect, useRef } from 'react';

const MusicPlayer = () => {
  const [activeVibe, setActiveVibe] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const playerRef = useRef(null);
  const [isApiReady, setIsApiReady] = useState(false);

  const vibes = [
    { id: 'rain', name: 'Rain', icon: '🌧️', videoId: 'mPZkdNFkNps' },
    { id: 'forest', name: 'Forest', icon: '🌿', videoId: 'vPhg6sc1Mk4' },
    { id: 'lofi', name: 'Lofi', icon: '🎹', videoId: 'jfKfPfyJRdk' }
  ];

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => setIsApiReady(true);
    } else setIsApiReady(true);
  }, []);

  const handleVibeClick = (vibe) => {
    if (!isApiReady) return;
    if (activeVibe?.id === vibe.id) {
      isPlaying ? playerRef.current?.pauseVideo() : playerRef.current?.playVideo();
      setIsPlaying(!isPlaying);
    } else {
      setActiveVibe(vibe);
      setIsPlaying(true);
      if (playerRef.current) {
        playerRef.current.loadVideoById(vibe.videoId);
        playerRef.current.setVolume(volume);
        playerRef.current.playVideo();
      } else {
        playerRef.current = new window.YT.Player('yt-player', {
          height: '0', width: '0', videoId: vibe.videoId,
          playerVars: { autoplay: 1, controls: 0, showinfo: 0, modestbranding: 1, loop: 1, playlist: vibe.videoId },
          events: { onReady: (e) => { e.target.setVolume(volume); e.target.playVideo(); } }
        });
      }
    }
  };

  return (
    <div className="vibe-module">
      <div id="yt-player" style={{ display: 'none' }}></div>
      <div className="module-top">
        <h3 className="module-label">Ambience</h3>
        <div className="vol-set">
          <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(parseInt(e.target.value))} />
        </div>
      </div>

      <div className="vibe-stack">
        {vibes.map(vibe => (
          <button 
            key={vibe.id} 
            className={`vibe-row ${activeVibe?.id === vibe.id ? 'active' : ''}`}
            onClick={() => handleVibeClick(vibe)}
          >
            <span className="v-icon">{vibe.icon}</span>
            <span className="v-name">{vibe.name}</span>
            {activeVibe?.id === vibe.id && isPlaying && <div className="playing-bars"><span></span><span></span></div>}
          </button>
        ))}
      </div>

      <style jsx>{`
        .vibe-module { display: flex; flex-direction: column; gap: 20px; }
        .module-top { display: flex; justify-content: space-between; align-items: center; }
        .module-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 3px; color: var(--text-dim); }
        .vol-set input { width: 80px; accent-color: var(--primary); outline: none; }

        .vibe-stack { display: flex; flex-direction: column; gap: 10px; }
        .vibe-row { 
          background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); 
          padding: 12px 20px; border-radius: 12px; display: flex; align-items: center; gap: 15px;
          cursor: pointer; transition: 0.3s; color: var(--text-dim); font-family: inherit;
        }
        .vibe-row:hover { background: rgba(255,255,255,0.06); color: white; }
        .vibe-row.active { background: rgba(192, 132, 252, 0.1); border-color: var(--primary); color: white; }

        .v-icon { font-size: 1.2rem; }
        .v-name { font-size: 0.85rem; font-weight: 500; letter-spacing:1px;}

        .playing-bars { display: flex; gap: 3px; margin-left: auto; }
        .playing-bars span { width: 2px; height: 10px; background: var(--primary); animation: jump 0.6s infinite alternate; }
        .playing-bars span:last-child { animation-delay: 0.2s; }
        @keyframes jump { from { transform: scaleY(0.4); } to { transform: scaleY(1.2); } }
      `}</style>
    </div>
  );
};

export default MusicPlayer;
