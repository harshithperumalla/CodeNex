import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";

const pageTitles: Record<string, string> = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/coding": "Coding",
  "/aptitude": "Aptitude",
  "/english": "English",
  "/courses": "Courses",
  "/games": "Games",
  "/typing-test": "Typing Test",
  "/meetings": "Meetings",
  "/leaderboard": "Leaderboard",
  "/badges": "Badges",
  "/suggestions": "Suggestions",
  "/profile": "Profile",
  "/settings": "Settings",
};

interface PageTitleAnimationProps {
  pathname: string;
}

const PageTitleAnimation = ({ pathname }: PageTitleAnimationProps) => {
  const [showTitle, setShowTitle] = useState(false);
  const [currentPath, setCurrentPath] = useState(pathname);

  const playClickSound = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }, []);

  useEffect(() => {
    if (pathname !== currentPath) {
      setCurrentPath(pathname);
      setShowTitle(true);
      playClickSound();
      const timer = setTimeout(() => setShowTitle(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [pathname, currentPath, playClickSound]);

  const title = pageTitles[pathname] || "";
  if (!title) return null;

  return (
    <AnimatePresence>
      {showTitle && (
        <>
          {/* Backdrop blur */}
          <motion.div
            className="fixed inset-0 z-[100] pointer-events-none"
            initial={{ backdropFilter: "blur(0px)", opacity: 0 }}
            animate={{ backdropFilter: "blur(6px)", opacity: 1 }}
            exit={{ backdropFilter: "blur(0px)", opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ background: "hsla(var(--background), 0.3)" }}
          />

          {/* Glow burst */}
          <motion.div
            className="fixed inset-0 z-[101] pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute w-[400px] h-[400px] rounded-full"
              style={{
                background: "radial-gradient(circle, hsla(var(--primary), 0.3) 0%, hsla(var(--primary), 0.1) 40%, transparent 70%)",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.8, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </motion.div>

          {/* Particles */}
          <motion.div
            className="fixed inset-0 z-[102] pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const distance = 80 + Math.random() * 60;
              return (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: i % 2 === 0
                      ? "hsl(var(--primary))"
                      : "hsl(var(--neon-cyan))",
                    boxShadow: `0 0 8px ${i % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--neon-cyan))"}`,
                  }}
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  animate={{
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    scale: 0,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                />
              );
            })}
          </motion.div>

          {/* Title */}
          <motion.div
            className="fixed inset-0 z-[103] pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <motion.h1
              className="text-5xl lg:text-7xl font-bold tracking-tight select-none"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-cyan)), hsl(var(--neon-purple)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "none",
                filter: "drop-shadow(0 0 30px hsla(var(--primary), 0.4)) drop-shadow(0 0 60px hsla(var(--neon-purple), 0.2))",
                perspective: "1000px",
              }}
              initial={{
                scale: 0.3,
                rotateX: 45,
                rotateY: -15,
                opacity: 0,
                y: 40,
              }}
              animate={{
                scale: [0.3, 1.08, 1],
                rotateX: [45, -5, 0],
                rotateY: [-15, 5, 0],
                opacity: [0, 1, 1],
                y: [40, -10, 0],
              }}
              exit={{
                scale: 1.1,
                rotateX: -20,
                opacity: 0,
                y: -30,
              }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
                times: [0, 0.6, 1],
              }}
            >
              {title}
            </motion.h1>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PageTitleAnimation;
