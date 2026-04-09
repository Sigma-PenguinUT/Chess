import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import GameRoom from './components/GameRoom';
import { Toaster } from 'sonner';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  if (activeGameId) {
    return <GameRoom gameId={activeGameId} onBack={() => setActiveGameId(null)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b px-6 py-4 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveGameId(null)}>
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground font-bold">G</span>
          </div>
          <span className="font-bold tracking-tight">Grandmaster.io</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold">{user.displayName}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Grandmaster</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-accent border overflow-hidden">
            <img src={user.photoURL || ''} alt="Profile" referrerPolicy="no-referrer" />
          </div>
        </div>
      </nav>

      <main className="pb-20">
        <Dashboard onSelectGame={setActiveGameId} onNavigate={() => {}} />
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
