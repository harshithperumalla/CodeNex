import { motion } from "framer-motion";
import { MessageSquare, ThumbsUp, Send, Lightbulb } from "lucide-react";
import { useState } from "react";
import GlassCard from "@/components/shared/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Suggestion {
  id: number;
  user: string;
  title: string;
  description: string;
  votes: number;
  status: string;
  category: string;
  date: string;
  voted: boolean;
}

const initialSuggestions: Suggestion[] = [
  { id: 1, user: "Rahul Sharma", title: "Add dark mode toggle on mobile", description: "The mobile app doesn't have an easy way to switch between light and dark mode.", votes: 87, status: "in-progress", category: "UI/UX", date: "2025-02-20", voted: false },
  { id: 2, user: "Priya Patel", title: "Live coding collaboration feature", description: "Pair programming sessions where two students can code together in real-time.", votes: 124, status: "planned", category: "Feature", date: "2025-02-18", voted: false },
  { id: 3, user: "Vikram Singh", title: "Certificate verification via QR code", description: "Add QR codes to course completion certificates so employers can verify them.", votes: 65, status: "completed", category: "Feature", date: "2025-02-15", voted: false },
  { id: 4, user: "Sneha Reddy", title: "Weekly progress email digest", description: "Send a weekly summary email showing coding streak, problems solved, and areas to improve.", votes: 42, status: "review", category: "Communication", date: "2025-02-22", voted: false },
  { id: 5, user: "Amit Kumar", title: "Offline mode for video courses", description: "Allow students to download course videos for offline viewing.", votes: 156, status: "planned", category: "Feature", date: "2025-02-10", voted: false },
  { id: 6, user: "Ananya Gupta", title: "Mentor matching algorithm", description: "Auto-match students with mentors based on learning goals and skill level.", votes: 93, status: "review", category: "AI/ML", date: "2025-02-19", voted: false },
];

const statusConfig: Record<string, string> = {
  planned: "bg-accent/20 text-accent border-accent/30",
  "in-progress": "bg-primary/20 text-primary border-primary/30",
  review: "bg-secondary/20 text-secondary-foreground border-secondary/30",
  completed: "bg-primary/20 text-primary border-primary/30",
};

const filters = ["All", "Planned", "In-Progress", "Review", "Completed"];

const Suggestions = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions);
  const [activeFilter, setActiveFilter] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const { toast } = useToast();

  const filtered = activeFilter === "All" ? suggestions : suggestions.filter((s) => s.status === activeFilter.toLowerCase());
  const maxVotes = Math.max(...suggestions.map((s) => s.votes));

  const handleVote = (id: number) => {
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, votes: s.voted ? s.votes - 1 : s.votes + 1, voted: !s.voted }
          : s
      )
    );
  };

  const handleSubmit = () => {
    if (!newTitle.trim() || !newDesc.trim() || !newCategory) return;
    const newSuggestion: Suggestion = {
      id: Date.now(),
      user: "You",
      title: newTitle,
      description: newDesc,
      votes: 1,
      status: "review",
      category: newCategory,
      date: new Date().toISOString().split("T")[0],
      voted: true,
    };
    setSuggestions((prev) => [newSuggestion, ...prev]);
    setNewTitle("");
    setNewDesc("");
    setNewCategory("");
    setDialogOpen(false);
    toast({ title: "Suggestion submitted!", description: "Your idea is now under review." });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            <span className="gradient-text">Suggestions</span>
          </h1>
          <p className="text-sm text-muted-foreground">Vote on ideas or submit your own</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Submit Idea
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong border-border">
            <DialogHeader>
              <DialogTitle>Submit a Suggestion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input placeholder="Suggestion title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              <Textarea placeholder="Describe your idea..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} />
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Feature">Feature</SelectItem>
                  <SelectItem value="UI/UX">UI/UX</SelectItem>
                  <SelectItem value="Communication">Communication</SelectItem>
                  <SelectItem value="AI/ML">AI/ML</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSubmit} className="w-full gap-2" disabled={!newTitle.trim() || !newDesc.trim() || !newCategory}>
                <Send className="w-4 h-4" /> Submit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <Button key={f} size="sm" variant={activeFilter === f ? "default" : "outline"} onClick={() => setActiveFilter(f)} className="text-xs">
            {f}
          </Button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((s, i) => {
          const votePercent = Math.round((s.votes / maxVotes) * 100);
          return (
            <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${s.voted ? "text-primary" : "text-muted-foreground"}`} onClick={() => handleVote(s.id)}>
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-bold text-foreground">{s.votes}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm text-foreground">{s.title}</h3>
                      <Badge variant="outline" className={statusConfig[s.status] || statusConfig.planned}>{s.status}</Badge>
                      <Badge variant="outline" className="text-xs">{s.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">by {s.user} • {s.date}</p>
                    <p className="text-sm text-foreground/80 mt-2">{s.description}</p>
                    <div className="mt-3">
                      <Progress value={votePercent} className="h-1.5" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <GlassCard className="p-8 text-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No suggestions in this category yet.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default Suggestions;
