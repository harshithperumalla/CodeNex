import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code2, CheckCircle2, RefreshCw, Unlink, Link2, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

const LeetCodeConnectCard: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { user, setUser } = useUser();
  const [handleInput, setHandleInput] = useState("");
  const [loading, setLoading] = useState(false);

  const isConnected = user?.isLeetCodeConnected && Boolean(user?.leetcodeUsername);

  const handleConnect = async () => {
    if (!handleInput.trim()) {
      toast.error("Please enter your LeetCode username.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/user/leetcode-connect", { username: handleInput.trim() });
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success(res.data.message || `Connected to LeetCode as @${handleInput.trim()}`);
        setHandleInput("");
      } else {
        toast.error(res.data.message || "Could not connect to LeetCode.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to connect LeetCode account.");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      const res = await api.post("/user/leetcode-sync");
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success(res.data.message || "LeetCode progress synced!");
      } else {
        toast.error(res.data.message || "Sync failed.");
      }
    } catch (err: any) {
      toast.error("Failed to sync LeetCode progress.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const res = await api.post("/user/leetcode-disconnect");
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success("LeetCode account disconnected.");
      }
    } catch (err: any) {
      toast.error("Failed to disconnect LeetCode account.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisplay = user?.leetcodeUsername ? `@${user.leetcodeUsername.replace(/^@/, '')}` : "";
  const profileUrl = user?.leetcodeUsername ? `https://leetcode.com/u/${user.leetcodeUsername.replace(/^@/, '')}/` : "#";

  return (
    <Card className={`border-border/50 bg-card/80 backdrop-blur-sm shadow-xl ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Code2 className="w-4 h-4" />
            </div>
            LeetCode Account
          </CardTitle>

          {isConnected ? (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1 text-[11px] px-2.5 py-0.5 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground text-[11px] px-2.5 py-0.5">
              Not Connected
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Link your LeetCode account to automatically sync solved problems, XP, streak, and badges across CodeNex.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {isConnected ? (
          <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-sm text-white truncate">{handleDisplay}</span>
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open LeetCode Profile"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-300 transition-colors border border-white/10 inline-flex items-center gap-1 text-xs shrink-0 font-medium"
                >
                  <span>Open Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {user.leetcodeLastSyncedAt && (
                <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                  Last synced: {new Date(user.leetcodeLastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
              <Button
                size="sm"
                onClick={handleSync}
                disabled={loading}
                className="gradient-primary text-primary-foreground text-xs gap-1.5 h-8 font-semibold shadow-md"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Syncing..." : "Sync Now"}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleDisconnect}
                disabled={loading}
                className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 h-8 gap-1.5 ml-auto"
              >
                <Unlink className="w-3.5 h-3.5" /> Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter LeetCode username (e.g. harshithperumalla)"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                className="text-xs bg-muted/40 border-border/50"
              />
              <Button
                onClick={handleConnect}
                disabled={loading || !handleInput.trim()}
                className="gradient-primary text-primary-foreground text-xs flex-shrink-0 gap-1.5 h-9 font-semibold"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                {loading ? "Connecting..." : "Connect LeetCode"}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-neon-yellow flex-shrink-0" />
              Tip: Ensure your LeetCode profile is set to public so solved problems can be verified.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeetCodeConnectCard;
