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
    const handlePlayerJoined = ({ player, players }: { player: Player; players: Player[] }) => {
      console.log("Player joined:", player);
      setPlayers(players);
    };

    const handlePlayerLeft = ({ players }: { players: Player[] }) => {
      console.log("Player left:", players);
      setPlayers(players);
    };

    const handlePlayersUpdate = ({ players }: { players: Player[] }) => {
      console.log("Players update:", players);
      setPlayers(players);
    };

    const handleGameState = (state: GameState) => {\n      console.log("Game state received:", state);\n\n      if (state.phase === "word_selection") {\n        navigate(`/game/${roomId}`);\n      }\n    };

    socket.on("player_joined", handlePlayerJoined);
    socket.on("player_left", handlePlayerLeft);
    socket.on("players_update", handlePlayersUpdate);
    socket.on("game_state", handleGameState);

    return () => {
      socket.off("player_joined", handlePlayerJoined);
      socket.off("player_left", handlePlayerLeft);
      socket.off("players_update", handlePlayersUpdate);
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

      <button onClick={() => {
        socket.emit("leave_room");
        navigate('/');
      }}>
        Leave
      </button>

      <button onClick={handleStart}>
        Start Game
      </button>
    </div>
  );
}
