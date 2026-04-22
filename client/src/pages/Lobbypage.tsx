import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../App';
import { getSocket } from '../hooks/useSocket';
import { Player } from '../types';
import Avatar from '../components/Avatar';

export default function LobbyPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { myId, myName, room, setRoom, players, setPlayers, setGameState } = useAppContext();
  const onPlayerJoined = useCallback(({ players: updatedPlayers }: { player: Player; players: Player[] }) => {
    setPlayers(updatedPlayers);
  }, [setPlayers]);

  const onPlayerLeft = useCallback(({ players: updatedPlayers, newHostId }: { playerId: string; playerName: string; players: Player[]; newHostId: string }) => {
    setPlayers(updatedPlayers);
    if (room) setRoom({ ...room, hostId: newHostId, players: updatedPlayers });
  }, [setPlayers, setRoom, room]);

  const onGameState = useCallback((state: { phase: string; round: number; totalRounds: number; drawerId: string; players: Player[] }) => {
    if (state.phase !== 'lobby') {
      setGameState(state as Parameters<typeof setGameState>[0]);
      setPlayers(state.players || []);
      navigate(`/game/${roomId}`);
    }
  }, [setGameState, setPlayers, navigate, roomId]);
  const socket = getSocket();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const isHost = room?.hostId === myId;

  // Effect 1: Initial setup and fetch
  useEffect(() => {
    if (!myName || !roomId) { 
      navigate('/'); 
      return; 
    }
    
    if (!socket.connected) {
      socket.connect();
      return;
    }

    if (!room) {
      fetch(`/api/rooms/${roomId}`)
        .then(r => r.json())
        .then(data => {
          if (data.room) {
            setRoom(data.room);
            setPlayers(data.room.players);
          } else {
            navigate('/');
          }
        })
        .catch(() => navigate('/'));
    }
  }, [myName, roomId, room, socket.connected, navigate, setRoom, setPlayers]);

  // Effect 2: Socket listeners (stable)
  useEffect(() => {
    if (!socket.connected) return;

    socket.on('player_joined', onPlayerJoined);
    socket.on('player_left', onPlayerLeft);
    socket.on('game_state', onGameState);
    socket.on('round_start', () => navigate(`/game/${roomId}`));

    return () => {
      socket.off('player_joined', onPlayerJoined);
      socket.off('player_left', onPlayerLeft);
      socket.off('game_state', onGameState);
      socket.off('round_start', () => navigate(`/game/${roomId}`));
    };
  }, [socket.connected, onPlayerJoined, onPlayerLeft, onGameState, navigate, roomId]);

  const handleStart = () => {
    if (players.length < 2) { setError('Need at least 2 players to start!'); return; }
    socket.emit('start_game', {}, (res: { success: boolean; error?: string }) => {
      if (!res?.success) setError(res?.error || 'Failed to start');
    });
  };

  const copyLink = () => {
    const url = `${window.location.origin}?join=${roomId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentPlayers = room?.players || players;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--accent)', marginBottom: 4 }}>🎨 Game Lobby</h1>
          <p style={{ color: 'var(--text2)', fontWeight: 600 }}>Waiting for players...</p>
        </div>

        {/* Room Code */}
        <div className="card" style={{ padding: 20, marginBottom: 16, textAlign: 'center' }}>
          <p style={{ color: 'var(--text3)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Room Code</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'monospace', letterSpacing: 6, color: 'var(--accent3)', textShadow: '0 0 20px rgba(78,205,196,0.4)' }}>
              {roomId}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={copyCode}>
              {copied ? '✅ Copied!' : '📋 Copy Code'}
            </button>
            <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={copyLink}>
              🔗 Copy Link
            </button>
          </div>
        </div>

        {/* Settings summary */}
        {room && (
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <p style={{ color: 'var(--text3)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Room Settings</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                { icon: '👥', label: `${currentPlayers.length}/${room.settings.maxPlayers} players` },
                { icon: '🔄', label: `${room.settings.rounds} rounds` },
                { icon: '⏱️', label: `${room.settings.drawTime}s draw time` },
                { icon: '📝', label: `${room.settings.wordCount} words` },
                { icon: '💡', label: `${room.settings.hints} hints` },
                { icon: room.settings.isPrivate ? '🔒' : '🌍', label: room.settings.isPrivate ? 'Private' : 'Public' },
              ].map(s => (
                <span key={s.label} className="badge badge-blue">{s.icon} {s.label}</span>
              ))}
            </div>
          </div>
        )}

        {/* Players */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <p style={{ color: 'var(--text3)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
            Players ({currentPlayers.length})
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12 }}>
            {currentPlayers.map((p: Player) => (
              <div
                key={p.id}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  background: 'var(--bg2)', borderRadius: 12, padding: '14px 8px',
                  border: `1px solid ${p.id === myId ? 'var(--accent3)' : 'var(--border)'}`,
                  position: 'relative', animation: 'pop 0.4s ease'
                }}
              >
                <Avatar index={p.avatar} name={p.name} size={44} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: p.id === myId ? 'var(--accent3)' : 'var(--text)', textAlign: 'center', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </span>
                {p.id === (room?.hostId) && (
                  <span className="badge badge-yellow" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>👑 Host</span>
                )}
                {p.id === myId && p.id !== room?.hostId && (
                  <span className="badge badge-green" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>You</span>
                )}
              </div>
            ))}
            {/* Empty slots */}
            {room && Array.from({ length: Math.max(0, room.settings.maxPlayers - currentPlayers.length) }).slice(0, 4).map((_, i) => (
              <div
                key={`empty-${i}`}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--bg2)', borderRadius: 12, padding: '14px 8px', border: '1px dashed var(--border)', opacity: 0.4, minHeight: 100 }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>?</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>Waiting...</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, color: 'var(--accent)', fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/')}>
            ← Leave
          </button>
          {isHost ? (
            <button
              className="btn-primary"
              style={{ flex: 2 }}
              onClick={handleStart}
              disabled={currentPlayers.length < 2}
            >
              {currentPlayers.length < 2 ? '⏳ Need 2+ players' : '🎮 Start Game!'}
            </button>
          ) : (
            <div style={{ flex: 2, background: 'var(--card2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontWeight: 700, fontSize: '0.9rem' }}>
              ⏳ Waiting for host...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}