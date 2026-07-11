import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import type { Toast } from "./ToastContext";

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle2,
    borderColor: "hsl(145 80% 50% / 0.5)",
    bgColor: "hsl(145 80% 50% / 0.08)",
    iconColor: "hsl(145 80% 50%)",
    progressColor: "hsl(145 80% 50%)",
    shadow: "0 0 20px hsl(145 80% 50% / 0.15)",
  },
  error: {
    icon: XCircle,
    borderColor: "hsl(0 84% 60% / 0.5)",
    bgColor: "hsl(0 84% 60% / 0.08)",
    iconColor: "hsl(0 84% 60%)",
    progressColor: "hsl(0 84% 60%)",
    shadow: "0 0 20px hsl(0 84% 60% / 0.15)",
  },
  warning: {
    icon: AlertTriangle,
    borderColor: "hsl(45 100% 55% / 0.5)",
    bgColor: "hsl(45 100% 55% / 0.08)",
    iconColor: "hsl(45 100% 55%)",
    progressColor: "hsl(45 100% 55%)",
    shadow: "0 0 20px hsl(45 100% 55% / 0.15)",
  },
  info: {
    icon: Info,
    borderColor: "hsl(195 100% 50% / 0.5)",
    bgColor: "hsl(195 100% 50% / 0.08)",
    iconColor: "hsl(195 100% 50%)",
    progressColor: "hsl(195 100% 50%)",
    shadow: "0 0 20px hsl(195 100% 50% / 0.15)",
  },
};

export default function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const duration = toast.duration ?? 3000;
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev - 100 / (duration / 50);
        if (next <= 0) {
          clearInterval(interval);
          onRemove(toast.id);
          return 0;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPaused, duration, toast.id, onRemove]);

  return (
    <motion.div
      layout
      initial={{ x: 120, opacity: 0, scale: 0.9 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 120, opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden rounded-xl backdrop-blur-xl"
      style={{
        background: `linear-gradient(135deg, hsl(230 25% 12% / 0.9), ${config.bgColor})`,
        border: `1px solid ${config.borderColor}`,
        boxShadow: `${config.shadow}, 0 8px 32px rgba(0, 0, 0, 0.3)`,
        minWidth: "320px",
        maxWidth: "420px",
      }}
    >
      <div className="flex items-start gap-3 p-4 pr-10">
        <div
          className="mt-0.5 shrink-0 rounded-full p-1.5"
          style={{ background: config.bgColor }}
        >
          <Icon size={18} style={{ color: config.iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold leading-5"
            style={{ color: config.iconColor }}
          >
            {toast.title}
          </p>
          {toast.message && (
            <p className="mt-1 text-sm text-white/70 leading-4 truncate">
              {toast.message}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="absolute top-3 right-3 rounded-md p-1 text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
      >
        <X size={14} />
      </button>

      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-white/5">
        <motion.div
          className="h-full origin-left"
          style={{ background: config.progressColor, width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}
