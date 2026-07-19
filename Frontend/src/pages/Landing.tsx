import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code2, LogIn, UserPlus, ArrowRight, Sparkles, Terminal, Cpu, ShieldCheck } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col justify-between selection:bg-primary/30 selection:text-primary">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full opacity-[0.06] animate-float blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(265 90% 60%), transparent 70%)" }}
        />
        <div
          className="absolute top-[40%] right-[15%] w-[600px] h-[600px] rounded-full opacity-[0.05] animate-float blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(195 100% 50%), transparent 70%)", animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-[10%] left-[35%] w-[450px] h-[450px] rounded-full opacity-[0.06] animate-float blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(330 90% 60%), transparent 70%)", animationDelay: "4s" }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Navigation Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
            <Code2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight gradient-text">
            CodeNex
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/login")}
            className="gap-2 text-muted-foreground hover:text-foreground font-medium"
          >
            <LogIn className="w-4 h-4" />
            Login
          </Button>
          <Button
            onClick={() => navigate("/signup")}
            className="gradient-primary text-primary-foreground gap-2 font-semibold shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:opacity-90 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Sign Up
          </Button>
        </motion.div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 lg:py-20 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-8 backdrop-blur-md shadow-[0_0_15px_hsl(var(--primary)/0.15)]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          The Next-Gen Developer Learning Platform
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] max-w-4xl mb-6"
        >
          Master Competitive Coding & Career Skills with{" "}
          <span className="gradient-text">CodeNex</span>
        </motion.h1>

        {/* 2-3 Line Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl font-normal leading-relaxed mb-10"
        >
          CodeNex is an all-in-one interactive platform empowering developers to master competitive programming,
          sharpen aptitude skills, practice real-world challenges, and accelerate their career growth with top industry guidance.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16"
        >
          <Button
            size="lg"
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto px-8 py-6 text-lg font-bold gradient-primary text-primary-foreground gap-3 rounded-xl shadow-[0_0_30px_hsl(var(--primary)/0.4)] hover:scale-105 transition-all duration-300"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto px-6 py-6 text-base font-semibold border-border/80 bg-card/50 hover:bg-card hover:border-primary/50 gap-2 rounded-xl backdrop-blur-sm transition-all"
          >
            <LogIn className="w-4 h-4 text-primary" />
            Login
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/signup")}
            className="w-full sm:w-auto px-6 py-6 text-base font-semibold border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary gap-2 rounded-xl backdrop-blur-sm transition-all text-primary"
          >
            <UserPlus className="w-4 h-4" />
            Sign Up
          </Button>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl text-left"
        >
          <div className="p-6 rounded-2xl glass border border-border/50 hover:border-primary/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Coding Workspace</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Interactive arena with real-time code execution, problem sets, and instant test case validation.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass border border-border/50 hover:border-secondary/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Aptitude & Reasoning</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Targeted practice modules, timed quizzes, and category-wise skill tracking for campus placements.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass border border-border/50 hover:border-accent/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Role-Based Portals</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dedicated dashboards for Students, Mentors, and Administrators to monitor growth and manage sessions.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 py-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">CodeNex</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <p>Empowering the next generation of engineers.</p>
      </footer>
    </div>
  );
};

export default Landing;
