import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, BookOpen, ArrowRight, ShieldCheck } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const txn = searchParams.get("txn") || `PAY-${Date.now().toString().slice(-6)}`;
  const title = searchParams.get("title") || "Selected Video Course";
  const amount = searchParams.get("amount") || "0";

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full space-y-6 text-center"
      >
        <GlassCard className="p-8 border-neon-green/30 bg-neon-green/5 space-y-6">
          <div className="w-20 h-20 rounded-full bg-neon-green/10 border-2 border-neon-green/40 flex items-center justify-center mx-auto animate-pulse">
            <CheckCircle2 className="w-10 h-10 text-neon-green" />
          </div>

          <div className="space-y-2">
            <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-xs px-3 py-1">
              Payment Verified & Secured
            </Badge>
            <h1 className="text-2xl font-bold text-foreground">Payment Successful!</h1>
            <p className="text-sm text-muted-foreground">
              You are officially enrolled in the course. Get ready to level up your skills!
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border/60 bg-background/50 text-left space-y-2 font-mono text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Transaction ID:</span>
              <span className="text-foreground font-semibold">{txn}</span>
            </div>
            <div className="flex justify-between">
              <span>Course Name:</span>
              <span className="text-foreground font-semibold line-clamp-1">{title}</span>
            </div>
            <div className="flex justify-between border-t border-border/40 pt-2 text-sm">
              <span>Amount Paid:</span>
              <span className="text-neon-green font-bold">₹{amount}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={() => navigate("/courses")}
              className="flex-1 gradient-primary text-primary-foreground gap-2 font-semibold"
            >
              <BookOpen className="w-4 h-4" /> Start Learning Now <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
