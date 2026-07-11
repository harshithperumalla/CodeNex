import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
  Home, BarChart3, Code2, Brain, MessageSquare,
  BookOpen, Gamepad2, Video, Trophy, Award, Settings, Keyboard, Lightbulb, UserRound, Users
} from "lucide-react";
import { usePageTransition } from "@/contexts/PageTransitionContext";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { to: "/coding", icon: Code2, label: "Coding" },
  { to: "/aptitude", icon: Brain, label: "Aptitude" },
  { to: "/english", icon: MessageSquare, label: "English" },
  { to: "/courses", icon: BookOpen, label: "Courses" },
  { to: "/games", icon: Gamepad2, label: "Games" },
  { to: "/typing-test", icon: Keyboard, label: "Typing Test" },
  { to: "/meetings", icon: Video, label: "Meetings" },
  { to: "/mentors", icon: Users, label: "Mentors" },
  { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { to: "/badges", icon: Award, label: "Badges" },
  { to: "/suggestions", icon: Lightbulb, label: "Suggestions" },
  { to: "/profile", icon: UserRound, label: "Profile" },
];

const floatingLabelVariants = {
  initial: { opacity: 0, scale: 0.8, y: 6, rotateX: 25, rotateY: -10 },
  animate: {
    opacity: 1, scale: [0.8, 1.06, 1], y: [6, -2, 0], rotateX: [25, -4, 0], rotateY: [-10, 3, 0],
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  exit: { opacity: 0, scale: 0.85, y: 4, rotateX: 10, transition: { duration: 0.3, ease: "easeIn" as const } },
};

const Sidebar = () => {
  const location = useLocation();
  const { triggerTransition, isTransitioning } = usePageTransition();
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent, to: string, label: string) => {
      e.preventDefault();
      if (isTransitioning || location.pathname === to) return;
      setActiveLabel(label);
      triggerTransition(to, label);
    },
    [triggerTransition, isTransitioning, location.pathname]
  );

  useEffect(() => {
    if (!activeLabel) return;
    const timer = setTimeout(() => setActiveLabel(null), 1800);
    return () => clearTimeout(timer);
  }, [activeLabel]);

  const renderFloatingLabel = (label: string, show: boolean) => (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={floatingLabelVariants}
          initial="initial" animate="animate" exit="exit"
          className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-[60] pointer-events-none lg:hidden"
          style={{ perspective: "400px", transformStyle: "preserve-3d" }}
        >
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[5px] w-2.5 h-2.5 rotate-45"
            style={{ background: "hsl(var(--primary) / 0.15)", backdropFilter: "blur(12px)", borderLeft: "1px solid hsl(var(--primary) / 0.4)", borderBottom: "1px solid hsl(var(--primary) / 0.4)" }}
          />
          <div
            className="relative px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-semibold"
            style={{ background: "hsl(var(--card) / 0.7)", backdropFilter: "blur(16px)", border: "1px solid hsl(var(--primary) / 0.4)", boxShadow: "0 0 20px hsl(var(--primary) / 0.2), 0 0 40px hsl(var(--primary) / 0.1), 0 8px 24px hsl(0 0% 0% / 0.3)" }}
          >
            <span className="relative z-10" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(280 80% 70%), hsl(var(--primary)))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {label}
            </span>
            <div className="absolute inset-0 rounded-full opacity-30" style={{ background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.2), transparent 70%)" }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <aside className="fixed left-0 top-0 h-full w-[72px] lg:w-[220px] glass-strong z-50 flex flex-col items-center lg:items-stretch py-6 gap-1 overflow-y-auto">
      <div className="flex items-center justify-center lg:justify-start lg:px-5 mb-6">
        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
          <Code2 className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="hidden lg:block ml-3 font-bold text-lg gradient-text">CodeNex</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1 w-full px-2 lg:px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <a
              key={item.to}
              href={item.to}
              onClick={(e) => handleClick(e, item.to, item.label)}
              className="relative flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-lg transition-all group cursor-pointer"
              style={{ perspective: "600px" }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg gradient-primary opacity-20"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
              <span className={`hidden lg:block text-sm font-medium transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                {item.label}
              </span>
              {renderFloatingLabel(item.label, activeLabel === item.label)}
            </a>
          );
        })}
      </nav>

      <div className="px-2 lg:px-3 mt-auto flex flex-col gap-1">
        <a
          href="/settings"
          onClick={(e) => handleClick(e, "/settings", "Settings")}
          className="relative flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          style={{ perspective: "600px" }}
        >
          <Settings className="w-5 h-5" />
          <span className="hidden lg:block text-sm font-medium">Settings</span>
          {renderFloatingLabel("Settings", activeLabel === "Settings")}
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
