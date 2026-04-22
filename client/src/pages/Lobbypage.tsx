import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../App';
import { getSocket } from '../hooks/useSocket';
import type { Socket } from 'socket.io-client';
import { Player, GameState } from '../types';
import Avatar from '../components/Avatar';

export default function LobbyPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const {
    myId,
    myName,
    players,
    setPlayers,
    setGameState
  } = useAppContext();

  const socket: Socket = getSocket();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Join room
  useEffect(() => {
    if (!myName || !roomId) {
      navigate('/');
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    console.log("Joining room:", roomId);

    socket.emit("join_room", {
      roomId,
      name: myName
    });
  }, [roomId, myName]);

  // Socket listeners
  useEffect(() => {
    const handlePlayers = (updatedPlayers: Player[]) => {
      console.log("Players:", updatedPlayers);
      setPlayers(updatedPlayers);
    };

    const handleGameState = (state: GameState) => {
      console.log("GameState:", state);

      if (state.phase !== 'lobby') {
        setGameState(state);
        setPlayers(state.players || []);
        navigate(`/game/${roomId!}`);
      }
    };

    socket.on("players", handlePlayers);
    socket.on("game_state", handleGameState);

    return () => {
      socket.off("players", handlePlayers);
      socket.off("game_state", handleGameState);
    };
  }, [socket, setPlayers, setGameState, navigate, roomId]);

  // Start game
  const handleStart = () => {
    if (players.length < 2) {
      setError('Need at least 2 players');
      return;
    }

    socket.emit("start_game");
  };

  // Copy room code
  const copyCode = () => {
    if (!roomId) return;

    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🎨 Lobby</h1>

      <h2>Room ID: {roomId}</h2>

      <button onClick={copyCode}>
        {copied ? "Copied!" : "Copy Room Code"}
      </button>

      <h3>Players ({players.length})</h3>

      {players.map((p: Player) => (
        <div key={p.id} style={{ margin: 10 }}>
          <Avatar index={p.avatar} name={p.name} size={40} />
          {p.name} {p.id === myId && "(You)"}
        </div>
      ))}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <br />

      <button onClick={() => navigate('/')}>
        Leave
      </button>

      <button onClick={handleStart}>
        Start Game
      </button>
    </div>
  );
}

