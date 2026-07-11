import { motion } from "framer-motion";
import StreakCounter from "@/components/shared/StreakCounter";
import DashboardCards from "@/components/home/DashboardCards";
import ActivityFeed from "@/components/home/ActivityFeed";
import PerformanceWidget from "@/components/home/PerformanceWidget";

import { useUser } from "@/contexts/UserContext";

const Index = () => {
  const { user } = useUser();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl glass p-8 neon-glow-purple"
      >
        <div className="absolute inset-0 opacity-10 gradient-primary" />
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">
            Welcome back, <span className="gradient-text">{user?.fullName || "Developer"}</span>
          </h1>
          <p className="text-muted-foreground max-w-lg">
            Continue your coding journey. You're on a {user?.streak || 0}-day streak — keep the momentum going!
          </p>
        </div>
        {/* Floating code symbols */}
        {["{ }", "< />", "=>", "[ ]", "&&"].map((sym, i) => (
          <motion.span
            key={sym}
            className="absolute text-primary/20 font-mono text-2xl font-bold select-none"
            style={{ top: `${15 + i * 15}%`, right: `${5 + i * 8}%` }}
            animate={{ y: [0, -15, 0], opacity: [0.15, 0.3, 0.15] }}
            transition={{ repeat: Infinity, duration: 3 + i * 0.5, delay: i * 0.3 }}
          >
            {sym}
          </motion.span>
        ))}
      </motion.div>

      {/* Streak Stats */}
      <StreakCounter />

      {/* Dashboard Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-foreground">Explore</h2>
        <DashboardCards />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActivityFeed />
        <PerformanceWidget />
      </div>
    </div>
  );
};

export default Index;
