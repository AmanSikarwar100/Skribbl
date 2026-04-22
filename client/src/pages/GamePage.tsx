import React from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../App';
import DrawingCanvas from '../components/DrawingCanvas';
import ChatPanel from '../components/ChatPanel';
import WordSelection from '../components/WordSelection';
import RoundEnd from '../components/RoundEnd';
import GameOver from '../components/GameOver';
import Avatar from '../components/Avatar';

export default function GamePage() {
  const { roomId } = useParams();
  const {
    room,
    gameState,
    players,
    messages,
    addMessage,
    currentWord,
    wordHint,
    timeLeft,
    isDrawing,
    myId
  } = useAppContext();

  if (!room || !gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  const drawer = players.find(p => p.id === gameState.drawerId);
  const drawerName = drawer ? drawer.name : 'Someone';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans">
      {/* Top Bar */}
      <div className="bg-white shadow-md p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Room {roomId}</h1>
          <p>Round {gameState.round}/{gameState.totalRounds} - {gameState.phase.replace('_', ' ').toUpperCase()}</p>
        </div>
        <div className="text-xl font-mono">{gameState.timeLeft ? formatTime(gameState.timeLeft) : '00:00'}</div>
        {isDrawing && <div className="text-green-600 font-bold">🖌️ You are drawing: {wordHint}</div>}
        {!isDrawing && currentWord && <div>Word: {wordHint || '?'}</div>}
      </div>

      {/* Main Game Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Players Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <h3 className="font-bold text-lg mb-4">Players ({players.length})</h3>
          <div className="space-y-2">
            {players.map(player => (
              <div key={player.id} className={`flex items-center p-2 rounded-lg transition-all ${
                player.id === gameState.drawerId ? 'bg-yellow-100 border-2 border-yellow-400' :
                player.hasGuessed ? 'bg-green-100' : ''
              }`}>
                <Avatar index={player.avatar} name={player.name} size={40} />

                <div className="ml-3 flex-1">
                  <div className="font-medium">{player.name}</div>
                  <div className="text-sm text-gray-500">Score: {player.score}</div>
                  {player.hasGuessed && <span className="text-xs bg-green-200 px-2 py-1 rounded-full">Guessed!</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white">
          {['drawing', 'guessing'].includes(gameState.phase) && (
            <DrawingCanvas isDrawer={isDrawing} />
          )}

          <div className="mt-8 text-center">
            <p className="text-2xl font-bold text-gray-700 mb-2">{drawerName} is drawing!</p>
            {wordHint && <p className="text-4xl font-mono bg-yellow-200 px-8 py-4 rounded-lg shadow-lg">{wordHint}</p>}
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-96 bg-white border-l border-gray-200">
          <ChatPanel messages={messages} onSend={text => addMessage({ playerId: myId, playerName: '', text, timestamp: Date.now() })} isDrawer={isDrawing} hasGuessedCorrectly={false} phase={gameState.phase} />
        </div>
      </div>

      {/* Overlays */}
      {gameState.phase === 'round_end' && (
        <RoundEnd 
          word={gameState.currentWord || 'Unknown'} 
          scores={players.map(p => ({ id: p.id, name: p.name, score: p.score, avatar: p.avatar }))} 
          players={players} 
        />
      )}
{(gameState.phase as string) === 'word_selection' && (
        <WordSelection 
          words={[]} 
          onChoose={() => {}} 
          drawTime={60} 
        />
      )}
    </div>
  );
}
