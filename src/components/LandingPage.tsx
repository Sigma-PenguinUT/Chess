import { useAuth } from '../AuthContext';
import { Button } from './ui/button';
import { Trophy, Shield, Zap, Users } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-6 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Trophy className="text-primary-foreground w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tighter">Grandmaster.io</span>
        </div>
        <Button onClick={login}>Sign In</Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl space-y-6"
        >
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight">
            Master the <span className="text-primary">Ultimate</span> Game.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The world's most advanced chess platform. Play, learn, and compete with grandmasters from around the globe.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={login} className="text-lg px-8 py-6">Get Started for Free</Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">View Leaderboard</Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {[
            { icon: Zap, title: "Real-time Play", desc: "Ultra-low latency multiplayer engine for seamless blitz and bullet games." },
            { icon: Shield, title: "Fair Play", desc: "Advanced anti-cheat systems and verified grandmaster ratings." },
            { icon: Users, title: "Community", desc: "Join clubs, participate in forums, and make friends with fellow enthusiasts." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-8 rounded-2xl bg-accent/50 border space-y-4 text-left"
            >
              <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center border shadow-sm">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="p-8 border-t text-center text-muted-foreground text-sm">
        © 2026 Grandmaster.io. All rights reserved. Built with passion for the game.
      </footer>
    </div>
  );
}
