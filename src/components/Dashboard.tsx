import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, limit, getDocs } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { GameState, UserProfile } from '../types/chess';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Trophy, Users, Play, UserPlus, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard({ onSelectGame }: { onSelectGame: (id: string) => void, onNavigate: (page: string) => void }) {
  const { user, profile } = useAuth();
  const [activeGames, setActiveGames] = useState<GameState[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    // Active games
    const qActive = query(
      collection(db, 'games'),
      where('status', '==', 'ongoing'),
      where('white', '==', user.uid)
    );
    const qActive2 = query(
      collection(db, 'games'),
      where('status', '==', 'ongoing'),
      where('black', '==', user.uid)
    );

    const unsub1 = onSnapshot(qActive, (snap) => {
      const games = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GameState));
      setActiveGames(prev => {
        const other = prev.filter(g => g.black === user.uid);
        return [...games, ...other];
      });
    });

    const unsub2 = onSnapshot(qActive2, (snap) => {
      const games = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GameState));
      setActiveGames(prev => {
        const other = prev.filter(g => g.white === user.uid);
        return [...other, ...games];
      });
    });

    // Fetch users for invitation
    const fetchUsers = async () => {
      const qUsers = query(collection(db, 'users'), limit(20));
      const snap = await getDocs(qUsers);
      setAllUsers(snap.docs.map(doc => doc.data() as UserProfile).filter(u => u.uid !== user.uid));
    };
    fetchUsers();

    return () => {
      unsub1();
      unsub2();
    };
  }, [user]);

  const createGameWithFriend = async (friendId: string) => {
    if (!user) return;
    try {
      const newGame = {
        white: user.uid,
        black: friendId,
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        status: 'ongoing',
        createdAt: serverTimestamp(),
        lastMoveAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'games'), newGame);
      onSelectGame(docRef.id);
      toast.success("Game started!");
    } catch (e) {
      toast.error("Failed to start game");
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Chess Lobby</h1>
          <p className="text-muted-foreground">Rating: {profile?.rating} • Ready to play?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Games</CardTitle>
            <CardDescription>Your ongoing matches</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {activeGames.length > 0 ? (
                <div className="space-y-4">
                  {activeGames.map(game => (
                    <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer" onClick={() => onSelectGame(game.id)}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Game vs {game.white === user?.uid ? (game.black?.slice(0, 8) || 'Waiting...') : (game.white?.slice(0, 8))}</p>
                          <p className="text-xs text-muted-foreground">Last move: {game.lastMoveAt?.seconds ? new Date(game.lastMoveAt.seconds * 1000).toLocaleTimeString() : 'Just now'}</p>
                        </div>
                      </div>
                      <Badge>Ongoing</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                  <Play className="w-12 h-12 mb-2 opacity-20" />
                  <p>No active games. Invite a friend!</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" /> Invite Friends
            </CardTitle>
            <CardDescription>Start a game with someone</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search players..." 
                className="pl-8" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {filteredUsers.map(u => (
                  <div key={u.uid} className="flex items-center justify-between p-2 hover:bg-accent rounded-md transition-colors">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={u.photoURL} />
                        <AvatarFallback>{u.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{u.displayName}</p>
                        <p className="text-[10px] text-muted-foreground">Rating: {u.rating}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => createGameWithFriend(u.uid)}>
                      Invite
                    </Button>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-4">No players found</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
