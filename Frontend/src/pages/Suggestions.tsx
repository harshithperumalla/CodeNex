import { motion } from "framer-motion";
import { MessageSquare, ThumbsUp, Send, Lightbulb, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import api from "@/services/api";

interface Suggestion {
  id: string;
  _id?: string;
  user: string;
  title: string;
  description: string;
  votes: number;
  status: string;
  category: string;
  date: string;
  voted: boolean;
}

const statusConfig: Record<string, string> = {
  planned: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "in-progress": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  review: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const filters = ["All", "Planned", "In-Progress", "Review", "Completed"];

const Suggestions = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchSuggestions = async () => {
    try {
      const res = await api.get("/suggestions");
      if (res.data.success && Array.isArray(res.data.suggestions)) {
        setSuggestions(res.data.suggestions);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Error loading suggestions:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const filtered = activeFilter === "All"
    ? suggestions
    : suggestions.filter((s) => s.status.toLowerCase() === activeFilter.toLowerCase());

  const maxVotes = Math.max(...suggestions.map((s) => s.votes), 1);

  const handleVote = async (id: string) => {
    try {
      const res = await api.post(`/suggestions/${id}/vote`);
      if (res.data.success) {
        setSuggestions((prev) =>
          prev.map((s) =>
            s.id === id
              ? { ...s, votes: res.data.votes, voted: res.data.voted }
              : s
          )
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Please log in to vote.");
    }
  };

  const handleSubmit = async () => {
    if (!newTitle.trim() || !newDesc.trim() || !newCategory) return;
    setSubmitting(true);
    try {
      const res = await api.post("/suggestions", {
        title: newTitle.trim(),
        description: newDesc.trim(),
        category: newCategory,
      });

      if (res.data.success && res.data.suggestion) {
        setSuggestions((prev) => [res.data.suggestion, ...prev]);
        setNewTitle("");
        setNewDesc("");
        setNewCategory("");
        setDialogOpen(false);
        toast.success("Suggestion submitted successfully!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit suggestion.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            <span className="gradient-text">Community Suggestions</span>
          </h1>
          <p className="text-sm text-muted-foreground">Vote on real feature requests or submit your own idea</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary text-primary-foreground">
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
              <Textarea placeholder="Describe your idea in detail..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} />
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Feature">Feature Request</SelectItem>
                  <SelectItem value="UI/UX">UI / UX Improvement</SelectItem>
                  <SelectItem value="DSA/Coding">DSA & Coding</SelectItem>
                  <SelectItem value="English">English Module</SelectItem>
                  <SelectItem value="AI/ML">AI Assistance</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSubmit} className="w-full gap-2 gradient-primary" disabled={submitting || !newTitle.trim() || !newDesc.trim() || !newCategory}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? "Submitting..." : "Submit Suggestion"}
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
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s, i) => {
            const votePercent = Math.round((s.votes / maxVotes) * 100);
            return (
              <motion.div key={s.id || s._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GlassCard className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 ${s.voted ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-white/5"}`}
                        onClick={() => handleVote(s.id || s._id || "")}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-bold text-foreground">{s.votes}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm text-foreground">{s.title}</h3>
                        <Badge variant="outline" className={statusConfig[s.status] || statusConfig.review}>{s.status}</Badge>
                        <Badge variant="outline" className="text-xs">{s.category}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">by {s.user} {s.date ? `• ${s.date}` : ""}</p>
                      <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{s.description}</p>
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
            <GlassCard className="p-10 text-center space-y-2">
              <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto" />
              <h3 className="font-semibold text-foreground text-sm">No suggestions found</h3>
              <p className="text-muted-foreground text-xs max-w-sm mx-auto">
                No user suggestions submitted yet. Click "Submit Idea" above to share your feedback or feature request with the community!
              </p>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
};

export default Suggestions;
