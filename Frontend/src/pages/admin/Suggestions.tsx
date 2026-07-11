import { motion } from "framer-motion";
import { MessageSquare, TrendingUp, CheckCircle2, Clock, ArrowUpRight, ThumbsUp } from "lucide-react";
import { useState } from "react";
import GlassCard from "@/components/shared/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const suggestions = [
  { id: 1, user: "Rahul Sharma", title: "Add dark mode toggle on mobile", description: "The mobile app doesn't have an easy way to switch between light and dark mode. A toggle in settings would be great.", votes: 87, status: "in-progress", category: "UI/UX", date: "2025-02-20" },
  { id: 2, user: "Priya Patel", title: "Live coding collaboration feature", description: "It would be amazing to have pair programming sessions where two students can code together in real-time.", votes: 124, status: "planned", category: "Feature", date: "2025-02-18" },
  { id: 3, user: "Vikram Singh", title: "Certificate verification via QR code", description: "Add QR codes to course completion certificates so employers can verify them instantly.", votes: 65, status: "completed", category: "Feature", date: "2025-02-15" },
  { id: 4, user: "Sneha Reddy", title: "Weekly progress email digest", description: "Send a weekly summary email showing coding streak, problems solved, and areas to improve.", votes: 42, status: "review", category: "Communication", date: "2025-02-22" },
  { id: 5, user: "Amit Kumar", title: "Offline mode for video courses", description: "Allow students to download course videos for offline viewing during commute or travel.", votes: 156, status: "planned", category: "Feature", date: "2025-02-10" },
  { id: 6, user: "Ananya Gupta", title: "Mentor matching algorithm", description: "Auto-match students with mentors based on their learning goals, skill level, and preferred language.", votes: 93, status: "review", category: "AI/ML", date: "2025-02-19" },
];

const filters = ["All", "Planned", "In-Progress", "Review", "Completed"];

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  planned: { color: "bg-accent/20 text-accent border-accent/30", icon: Clock },
  "in-progress": { color: "bg-primary/20 text-primary border-primary/30", icon: TrendingUp },
  review: { color: "bg-secondary/20 text-secondary-foreground border-secondary/30", icon: ArrowUpRight },
  completed: { color: "bg-primary/20 text-primary border-primary/30", icon: CheckCircle2 },
};

const Suggestions = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = activeFilter === "All" ? suggestions : suggestions.filter((s) => s.status === activeFilter.toLowerCase());
  const totalVotes = suggestions.reduce((a, s) => a + s.votes, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">User <span className="gradient-text">Suggestions</span></h1>
        <p className="text-sm text-muted-foreground">{suggestions.length} suggestions • {totalVotes} total votes</p>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: suggestions.length, icon: MessageSquare },
          { label: "In Progress", value: suggestions.filter((s) => s.status === "in-progress").length, icon: TrendingUp },
          { label: "Under Review", value: suggestions.filter((s) => s.status === "review").length, icon: ArrowUpRight },
          { label: "Completed", value: suggestions.filter((s) => s.status === "completed").length, icon: CheckCircle2 },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <GlassCard className="p-4">
              <m.icon className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <Button key={f} size="sm" variant={activeFilter === f ? "default" : "outline"} onClick={() => setActiveFilter(f)} className="text-xs">
            {f}
          </Button>
        ))}
      </div>

      {/* Suggestion Cards */}
      <div className="space-y-3">
        {filtered.map((s, i) => {
          const config = statusConfig[s.status] || statusConfig.planned;
          const votePercent = Math.round((s.votes / 156) * 100);
          return (
            <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <GlassCard className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ThumbsUp className="w-4 h-4 text-primary" />
                    </Button>
                    <span className="text-sm font-bold text-foreground">{s.votes}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm text-foreground">{s.title}</h3>
                      <Badge variant="outline" className={config.color}>{s.status}</Badge>
                      <Badge variant="outline" className="text-xs">{s.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">by {s.user} • {s.date}</p>
                    <p className="text-sm text-foreground/80 mt-2">{s.description}</p>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Community interest</span>
                        <span className="text-primary">{votePercent}%</span>
                      </div>
                      <Progress value={votePercent} className="h-1.5" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Suggestions;
