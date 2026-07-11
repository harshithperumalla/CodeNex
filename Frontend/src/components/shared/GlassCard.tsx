import { motion } from "framer-motion";
import { ReactNode, useState } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: "purple" | "cyan" | "pink" | "none";
  tilt?: boolean;
  delay?: number;
}

const GlassCard = ({ children, className = "", glow = "none", tilt = true, delay = 0 }: GlassCardProps) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const glowClass = {
    purple: "neon-glow-purple",
    cyan: "neon-glow-cyan",
    pink: "neon-glow-pink",
    none: "",
  }[glow];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotateX(-y * 10);
    setRotateY(x * 10);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      style={{ transform: tilt ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)` : undefined, transition: "transform 0.15s ease" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`glass ${glowClass} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
