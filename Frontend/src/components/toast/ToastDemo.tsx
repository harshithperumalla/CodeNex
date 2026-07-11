import { motion } from "framer-motion";
import { useToastHelpers } from "@/components/toast";
import { CheckCircle2, XCircle, AlertTriangle, Info, Sparkles } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const toastButtons = [
  {
    type: "success" as const,
    label: "Trigger Success",
    title: "Code submitted successfully",
    message: "Your solution passed all test cases.",
    icon: CheckCircle2,
    gradient: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    glow: "hover:shadow-[0_0_30px_hsl(145_80%_50%_/0.3)]",
  },
  {
    type: "error" as const,
    label: "Trigger Error",
    title: "Compilation failed",
    message: "Syntax error on line 42: unexpected token.",
    icon: XCircle,
    gradient: "from-red-500/20 to-red-500/5",
    border: "border-red-500/30",
    text: "text-red-400",
    glow: "hover:shadow-[0_0_30px_hsl(0_84%_60%_/0.3)]",
  },
  {
    type: "warning" as const,
    label: "Trigger Warning",
    title: "Unsaved changes detected",
    message: "You have unsaved changes in the editor.",
    icon: AlertTriangle,
    gradient: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/30",
    text: "text-amber-400",
    glow: "hover:shadow-[0_0_30px_hsl(45_100%_55%_/0.3)]",
  },
  {
    type: "info" as const,
    label: "Trigger Info",
    title: "Problem bookmarked",
    message: "Added to your bookmarks list.",
    icon: Info,
    gradient: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    glow: "hover:shadow-[0_0_30px_hsl(195_100%_50%_/0.3)]",
  },
];

export default function ToastDemo() {
  const { success, error, warning, info } = useToastHelpers();

  const triggerToast = (type: string, title: string, message: string) => {
    switch (type) {
      case "success":
        success(title, message);
        break;
      case "error":
        error(title, message);
        break;
      case "warning":
        warning(title, message);
        break;
      case "info":
        info(title, message);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background animated-bg flex flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Notification System</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
          Toast Notifications
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          A modern, glassmorphic toast system with smooth animations,
          progress timers, and neon accents.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl"
      >
        {toastButtons.map((btn) => (
          <motion.button
            key={btn.type}
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => triggerToast(btn.type, btn.title, btn.message)}
            className={`relative overflow-hidden rounded-xl border ${btn.border} bg-gradient-to-br ${btn.gradient} p-6 text-left transition-all ${btn.glow}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg bg-white/5 ${btn.text}`}>
                <btn.icon size={22} />
              </div>
              <span className={`text-lg font-semibold ${btn.text}`}>
                {btn.label}
              </span>
            </div>
            <p className="text-sm text-white/60">
              {btn.title}
            </p>
            <div className="absolute top-2 right-2 opacity-10">
              <btn.icon size={64} />
            </div>
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 text-center"
      >
        <p className="text-sm text-muted-foreground">
          Click any card above to trigger a toast notification.
        </p>
        <p className="text-xs text-muted-foreground/60 mt-2">
          Toasts auto-hide after 3 seconds. Hover to pause.
        </p>
      </motion.div>
    </div>
  );
}
