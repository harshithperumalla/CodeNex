import { motion } from "framer-motion";
import { Code2, Brain, MessageSquare, BookOpen, Gamepad2, Video, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../shared/GlassCard";

const cards = [
  { icon: Code2, label: "Coding", desc: "Practice DSA & Languages", color: "text-neon-cyan", glow: "cyan" as const, to: "/coding" },
  { icon: Brain, label: "Aptitude", desc: "Quantitative & Logical", color: "text-neon-purple", glow: "purple" as const, to: "/aptitude" },
  { icon: MessageSquare, label: "English", desc: "Communication Skills", color: "text-neon-pink", glow: "pink" as const, to: "/english" },
  { icon: BookOpen, label: "Courses", desc: "Video Learning", color: "text-neon-green", glow: "cyan" as const, to: "/courses" },
  { icon: Gamepad2, label: "Games", desc: "Learn by Playing", color: "text-neon-orange", glow: "pink" as const, to: "/games" },
  { icon: Video, label: "Meetings", desc: "1:1 Mentor Sessions", color: "text-neon-yellow", glow: "purple" as const, to: "/meetings" },
];

const DashboardCards = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <GlassCard
          key={card.label}
          glow={card.glow}
          delay={i * 0.08}
          className="p-5 cursor-pointer hover:border-primary/30 transition-colors"
        >
          <div onClick={() => navigate(card.to)}>
            <card.icon className={`w-8 h-8 ${card.color} mb-3`} />
            <h3 className="font-semibold text-foreground">{card.label}</h3>
            <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

export default DashboardCards;
