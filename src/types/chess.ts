export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  rating: number;
  friends?: string[];
  createdAt: any;
}

export interface GameState {
  id: string;
  white: string;
  black?: string;
  fen: string;
  pgn?: string;
  status: 'waiting' | 'ongoing' | 'finished';
  winner?: string;
  createdAt: any;
  lastMoveAt: any;
}

export interface ChatMessage {
  id: string;
  gameId: string;
  senderId: string;
  text: string;
  createdAt: any;
}
