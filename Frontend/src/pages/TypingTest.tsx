import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import TypingGame from "@/components/games/TypingGame";

const TypingTest = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold gradient-text"
      >
        ⚡ Speed Typing Test
      </motion.h1>
      <TypingGame onClose={() => navigate("/games")} />
    </div>
  );
};

export default TypingTest;
