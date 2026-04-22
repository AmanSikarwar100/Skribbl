export interface Player {
  id: string;
  name: string;
  avatar: number;
  score: number;
  hasGuessed?: boolean;
  hasGuessedCorrectly?: boolean;
  isActive?: boolean;
}

export interface RoomSettings {
  maxPlayers: number;
  rounds: number;
  drawTime: number;
  wordCount: number;
  hints: number;
  isPrivate: boolean;
}

export interface Room {
  id: string;
  hostId: string;
  players: Player[];
  settings: RoomSettings;
  currentRound?: number;
  totalRounds?: number;
  status?: 'waiting' | 'playing' | 'finished';
}

export interface PublicRoom {
  id: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  currentRound?: number;
  totalRounds?: number;
  rounds?: number;
}

export interface GameState {
  phase: 'lobby' | 'drawing' | 'guessing' | 'voting' | 'results' | 'round_end';
  round: number;
  totalRounds: number;
  drawerId: string;
  players: Player[];
  currentWord?: string;
  wordHint?: string;
  timeLeft?: number;
}

export interface ChatMessage {
  id?: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp?: number;
  isSystem?: boolean;
  isCorrect?: boolean;
  isClose?: boolean;
}

export interface StrokeData {
  type: 'start' | 'move' | 'end';
  x: number;
  y: number;
  color?: string;
  size?: number;
}

export interface DrawingData extends StrokeData {
  drawerId?: string;
}
