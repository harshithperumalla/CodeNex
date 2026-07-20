import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, RefreshCw, ArrowLeft, HelpCircle } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const reason = searchParams.get("reason") || "Payment processing was not completed.";
  const title = searchParams.get("title") || "Course Enrollment";

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full space-y-6 text-center"
      >
        <GlassCard className="p-8 border-destructive/40 bg-destructive/5 space-y-6">
          <div className="w-20 h-20 rounded-full bg-destructive/10 border-2 border-destructive/40 flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Payment Failed</h1>
            <p className="text-sm text-muted-foreground">
              We couldn't process your transaction for <span className="font-semibold text-foreground">{title}</span>.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-destructive/30 bg-background/50 text-left text-xs space-y-1">
            <span className="font-bold text-destructive">Reason / Diagnostic:</span>
            <p className="text-muted-foreground">{reason}</p>
          </div>

          <p className="text-xs text-muted-foreground/80">
            No money was deducted from your account. If amount was debited, it will be automatically refunded by your bank within 3-5 business days.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={() => navigate("/courses")}
              className="flex-1 gradient-primary text-primary-foreground gap-2 font-semibold"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/suggestions")}
              className="gap-2 text-xs"
            >
              <HelpCircle className="w-4 h-4" /> Support
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default PaymentFailed;
