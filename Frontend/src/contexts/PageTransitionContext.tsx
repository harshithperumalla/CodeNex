import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface PageTransitionContextType {
  isTransitioning: boolean;
  transitionTitle: string;
  triggerTransition: (path: string, title: string) => void;
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  isTransitioning: false,
  transitionTitle: "",
  triggerTransition: () => {},
});

export const usePageTransition = () => useContext(PageTransitionContext);

export const PageTransitionProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTitle, setTransitionTitle] = useState("");

  const playSound = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.04);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }, []);

  const triggerTransition = useCallback(
    (path: string, title: string) => {
      if (isTransitioning) return;
      setTransitionTitle(title);
      setIsTransitioning(true);
      playSound();

      // Navigate after the title animation peaks (~750ms), then fade out
      setTimeout(() => {
        navigate(path);
      }, 700);

      setTimeout(() => {
        setIsTransitioning(false);
        setTransitionTitle("");
      }, 1100);
    },
    [isTransitioning, navigate, playSound]
  );

  return (
    <PageTransitionContext.Provider value={{ isTransitioning, transitionTitle, triggerTransition }}>
      {children}
    </PageTransitionContext.Provider>
  );
};
