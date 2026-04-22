import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../App';
import { getSocket } from '../hooks/useSocket';
import { StrokeData } from '../types';
import DrawingCanvas from '../components/DrawingCanvas';
import ChatPanel from '../components/ChatPanel';
import WordSelection from '../components/WordSelection';
import RoundEnd from '../components/RoundEnd';
import GameOver from '../components/GameOver';

export default function GamePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { myId, room, gameState, setGameState, messages, addMessage, currentWord, setCurrentWord, wordHint, setWordHint, timeLeft, setTimeLeft, isDrawing, setIsDrawing, players } = useAppContext();
  const socket = getSocket();

  const [canvasStrokes, setCanvasStrokes] = useState<StrokeData[]>([]);
  const [hasGuessedCorrectly, setHasGuessedCorrectly] = useState(false);
  const [roundData, setRoundData] = useState<{ correct_word?: string; guesser_names?: string[] } | null>(null);

  useEffect(() => {
    if (!socket.connected) socket.connect();
  }, [socket]);

  // Socket event handlers
  useEffect(() => {
    const handleGameState = (state: any) => {
      setGameState(state);
      setCanvasStrokes([]);
      setHasGuessedCorrectly(false);
      setRoundData(null);
    };

    const handleDrawData = (data: StrokeData) => {
      setCanvasStrokes(prev => [...prev, data]);
    };

    const handleChatMessage = (msg: any) => {
      addMessage(msg);
      if (msg.isCorrectGuess && msg.playerId === myId) {
        setHasGuessedCorrectly(true);
      }
    };

    const handleRoundEnd = (data: any) => {
      setRoundData(data);
    };

    const handleGameOver = (data: any) => {
      // Game is over
      console.log('Game over:', data);
    };

    const handleTimeUpdate = (data: { timeLeft: number }) => {
      setTimeLeft(data.timeLeft);
    };

    socket.on('game_state', handleGameState);
    socket.on('draw_data', handleDrawData);
    socket.on('chat_message', handleChatMessage);
    socket.on('round_end', handleRoundEnd);
    socket.on('game_over', handleGameOver);
    socket.on('time_update', handleTimeUpdate);

    return () => {
      socket.off('game_state', handleGameState);
      socket.off('draw_data', handleDrawData);
      socket.off('chat_message', handleChatMessage);
      socket.off('round_end', handleRoundEnd);
      socket.off('game_over', handleGameOver);
      socket.off('time_update', handleTimeUpdate);
    };
  }, [socket, addMessage, myId, setGameState, setTimeLeft]);

  if (!gameState) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  const isDrawer = gameState.drawerId === myId;

  const handleSendMessage = (text: string) => {
    socket.emit('send_message', { text }, (res: any) => {
      if (res?.success) {
        addMessage({
          playerId: myId,
          playerName: 'You',
          text,
          isCorrect: res.isCorrectGuess
        });
      }
    });
  };

  // Show round end screen
  if (roundData) {
    return (
      <RoundEnd
        word={roundData.correct_word || 'Unknown'}
        scores={players.map(p => ({ id: p.id, name: p.name, score: p.score, avatar: p.avatar }))}
        players={players}
        onContinue={() => setRoundData(null)}
      />
    );
  }

  // Show game over screen
  if (gameState.phase === 'results' || (gameState.round > gameState.totalRounds)) {
    const leaderboard = [...players].sort((a, b) => b.score - a.score);
    const winner = leaderboard[0] || null;
    return (
      <GameOver
        winner={winner ? { id: winner.id, name: winner.name, score: winner.score, avatar: winner.avatar } : null}
        leaderboard={leaderboard.map(p => ({ id: p.id, name: p.name, score: p.score, avatar: p.avatar }))}
        myId={myId}
      />
    );
  }

  // Show word selection for drawer
  if (isDrawer && gameState.phase === 'drawing' && !currentWord) {
    return (
      <WordSelection
        words={['Word 1', 'Word 2', 'Word 3']}
        onChoose={(word: string) => {
          setCurrentWord(word);
          socket.emit('word_selected', { word });
        }}
        drawTime={gameState.phase === 'drawing' ? timeLeft : 0}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Top bar with info */}
      <div style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div>
            <span style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>Round</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent)' }}>{gameState.round}/{gameState.totalRounds}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>Time</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: timeLeft > 10 ? 'var(--accent)' : 'var(--error)' }}>{timeLeft}s</div>
          </div>
          {currentWord && isDrawer && (
            <div>
              <span style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>Your Word</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent2)' }}>🤐 Secret</div>
            </div>
          )}
        </div>
        <button className="btn-secondary" onClick={() => navigate(`/lobby/${roomId}`)}>
          ← Back to Lobby
        </button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', gap: 12, padding: 12, minHeight: 0 }}>
        {/* Canvas area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ background: 'var(--card)', borderRadius: 12, flex: 1, display: 'flex', padding: 8, minHeight: 0 }}>
            <DrawingCanvas isDrawer={isDrawer} canvasStrokes={canvasStrokes} />
          </div>
        </div>

        {/* Right sidebar with info and chat */}
        <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
          {/* Current Word for guesser */}
          {!isDrawer && currentWord && (
            <div className="card" style={{ padding: 12 }}>
              <p style={{ color: 'var(--text3)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Word Hint</p>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent2)', textAlign: 'center' }}>
                {wordHint || '?'}
              </div>
            </div>
          )}

          {/* Chat panel */}
          <div style={{ flex: 1, background: 'var(--card)', borderRadius: 12, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <ChatPanel
              messages={messages}
              onSend={handleSendMessage}
              isDrawer={isDrawer}
              hasGuessedCorrectly={hasGuessedCorrectly}
              phase={gameState.phase}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
