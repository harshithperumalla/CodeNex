import { motion, AnimatePresence } from "framer-motion";
import { usePageTransition } from "@/contexts/PageTransitionContext";

const PageTransitionOverlay = () => {
  const { isTransitioning, transitionTitle } = usePageTransition();

  return (
    <AnimatePresence>
      {isTransitioning && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: "hsla(var(--background), 0.55)",
              backdropFilter: "blur(12px)",
            }}
          />

          {/* Glow burst */}
          <motion.div className="fixed inset-0 z-[201] pointer-events-none flex items-center justify-center">
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, hsla(var(--primary), 0.25) 0%, hsla(var(--primary), 0.08) 40%, transparent 70%)",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.8, 1.4], opacity: [0, 0.9, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </motion.div>

          {/* Particles */}
          <motion.div
            className="fixed inset-0 z-[202] pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const distance = 90 + Math.random() * 70;
              return (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    background:
                      i % 3 === 0
                        ? "hsl(var(--primary))"
                        : i % 3 === 1
                        ? "hsl(var(--neon-cyan))"
                        : "hsl(var(--neon-purple))",
                    boxShadow: `0 0 10px currentColor`,
                  }}
                  initial={{ x: 0, y: 0, scale: 1, opacity: 0.9 }}
                  animate={{
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    scale: 0,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                />
              );
            })}
          </motion.div>

          {/* Gradient light streak */}
          <motion.div
            className="fixed inset-0 z-[202] pointer-events-none flex items-center justify-center overflow-hidden"
          >
            <motion.div
              className="absolute w-[600px] h-[4px] rounded-full"
              style={{
                background: "linear-gradient(90deg, transparent, hsl(var(--primary)), hsl(var(--neon-cyan)), hsl(var(--neon-purple)), transparent)",
              }}
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: ["−100%", "100%"], opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Title */}
          <motion.div
            className="fixed inset-0 z-[203] pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            <motion.div
              className="relative"
              style={{ perspective: "1200px" }}
            >
              <motion.h1
                className="text-5xl md:text-6xl lg:text-8xl font-black tracking-tight select-none"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-cyan)), hsl(var(--neon-purple)), hsl(var(--primary)))",
                  backgroundSize: "300% 300%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter:
                    "drop-shadow(0 0 40px hsla(var(--primary), 0.5)) drop-shadow(0 0 80px hsla(var(--neon-purple), 0.25))",
                }}
                initial={{
                  scale: 0.3,
                  rotateX: 50,
                  rotateY: -20,
                  opacity: 0,
                  y: 50,
                }}
                animate={{
                  scale: [0.3, 1.1, 1],
                  rotateX: [50, -8, 0],
                  rotateY: [-20, 6, 0],
                  opacity: [0, 1, 1],
                  y: [50, -12, 0],
                  backgroundPosition: ["0% 50%", "100% 50%"],
                }}
                exit={{
                  scale: 1.15,
                  rotateX: -25,
                  opacity: 0,
                  y: -40,
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                  times: [0, 0.55, 1],
                }}
              >
                {transitionTitle}
              </motion.h1>

              {/* Floating micro-motion subtitle glow */}
              <motion.div
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-1 rounded-full"
                style={{
                  background: "linear-gradient(90deg, transparent, hsl(var(--primary)), hsl(var(--neon-cyan)), transparent)",
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: [0, 1.2, 0.8], opacity: [0, 0.8, 0] }}
                transition={{ duration: 0.9, delay: 0.2 }}
              />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PageTransitionOverlay;
