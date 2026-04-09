import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, updateDoc, collection, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { GameState, ChatMessage } from '../types/chess';
import ChessBoard from './ChessBoard';
import { Chess } from 'chess.js';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Send, ArrowLeft, RotateCcw, Flag } from 'lucide-react';
import { Badge } from './ui/badge';

export default function GameRoom({ gameId, onBack }: { gameId: string, onBack: () => void }) {
  const { user } = useAuth();
  const [gameData, setGameData] = useState<GameState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubGame = onSnapshot(doc(db, 'games', gameId), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as GameState;
        setGameData({ id: snap.id, ...data });

        // If game is waiting and we are not white, join as black
        if (data.status === 'waiting' && data.white !== user?.uid && !data.black) {
          updateDoc(doc(db, 'games', gameId), {
            black: user?.uid,
            status: 'ongoing',
            lastMoveAt: serverTimestamp()
          });
        }
      }
    });

    const qMessages = query(
      collection(db, 'games', gameId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubMessages = onSnapshot(qMessages, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
    });

    return () => {
      unsubGame();
      unsubMessages();
    };
  }, [gameId, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleMove = async (move: any) => {
    if (!gameData || !user) return;
    
    const chess = new Chess(gameData.fen);
    const isWhite = gameData.white === user.uid;
    const isBlack = gameData.black === user.uid;
    
    // Check if it's our turn
    if ((chess.turn() === 'w' && !isWhite) || (chess.turn() === 'b' && !isBlack)) {
      return;
    }

    const newFen = chess.fen();
    const status = chess.isGameOver() ? 'finished' : 'ongoing';
    const winner = chess.isCheckmate() ? (chess.turn() === 'w' ? gameData.black : gameData.white) : (chess.isDraw() ? 'draw' : null);

    await updateDoc(doc(db, 'games', gameId), {
      fen: newFen,
      pgn: chess.pgn(),
      status,
      winner: winner || null,
      lastMoveAt: serverTimestamp()
    });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    await addDoc(collection(db, 'games', gameId, 'messages'), {
      gameId,
      senderId: user.uid,
      text: newMessage,
      createdAt: serverTimestamp()
    });
    setNewMessage('');
  };

  if (!gameData) return <div className="p-8 text-center">Loading game...</div>;

  const isWhite = gameData.white === user?.uid;
  const orientation = isWhite ? 'white' : 'black';

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
          <div className="flex gap-2">
            <Badge variant="outline">Game ID: {gameId.slice(0, 8)}</Badge>
            <Badge>{gameData.status}</Badge>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center bg-accent/20 rounded-xl p-4">
          <ChessBoard 
            fen={gameData.fen} 
            onMove={handleMove} 
            orientation={orientation}
            draggable={gameData.status === 'ongoing'}
          />
        </div>

        <div className="flex justify-center gap-4">
          <Button variant="outline" size="sm" className="gap-2">
            <RotateCcw className="w-4 h-4" /> Resign
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Flag className="w-4 h-4" /> Offer Draw
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 h-full">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="py-3 px-4 border-bottom">
            <CardTitle className="text-sm font-medium">Game Chat</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.senderId === user?.uid ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.senderId === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString() : '...'}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
              <Input 
                placeholder="Type a message..." 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="h-48">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium">Move History</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-24">
              <p className="text-xs font-mono break-all">{gameData.pgn || 'No moves yet'}</p>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
