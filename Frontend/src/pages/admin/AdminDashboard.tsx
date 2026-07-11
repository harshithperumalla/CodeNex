import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, BookOpen, TrendingUp, Activity, Shield, UserPlus, Calendar, Plus, Trash2, Award, ClipboardList
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import GlassCard from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/services/api";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const AdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Admin Hub States
  const [problems, setProblems] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [newProblem, setNewProblem] = useState({ title: "", difficulty: "Easy", category: "Arrays", points: "10", description: "" });
  const [newSession, setNewSession] = useState({ title: "", date: "", time: "", duration: "60" });

  const fetchDashboardData = async () => {
    try {
      const res = await api.get("/admin/dashboard");
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch admin dashboard:", err);
    }
  };

  const fetchHubData = async () => {
    try {
      const [probRes, sessRes] = await Promise.all([
        api.get("/coding"),
        api.get("/mentor/sessions"),
      ]);
      if (probRes.data.success) setProblems(probRes.data.problems);
      if (sessRes.data.success) setSessions(sessRes.data.sessions);
    } catch (err) {
      console.error("Failed to load admin hub data:", err);
    }
  };

  const initData = async () => {
    setLoading(true);
    await Promise.all([fetchDashboardData(), fetchHubData()]);
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, []);

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProblem.title || !newProblem.description) {
      toast.error("Please fill in the title and description");
      return;
    }
    try {
      const res = await api.post("/admin/problems", {
        title: newProblem.title,
        difficulty: newProblem.difficulty,
        category: newProblem.category,
        topicCategory: "Beginner",
        points: Number(newProblem.points),
        description: newProblem.description,
        constraints: ["Standard constraints apply"],
        examples: [{ input: "See description", output: "See description" }],
        starterCode: { javascript: "// Write code here\n" },
        testCases: [{ input: "1", expectedOutput: "1" }],
      });
      if (res.data.success) {
        toast.success("Coding problem created successfully!");
        setNewProblem({ title: "", difficulty: "Easy", category: "Arrays", points: "10", description: "" });
        fetchHubData();
      }
    } catch (err) {
      toast.error("Failed to create problem");
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSession.title || !newSession.date || !newSession.time) {
      toast.error("Please fill in meeting details");
      return;
    }
    try {
      const scheduledAt = new Date(`${newSession.date}T${newSession.time}`);
      const res = await api.post("/mentor/sessions", {
        title: newSession.title,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: Number(newSession.duration),
        meetingLink: "https://meet.google.com/abc-defg-hij",
      });
      if (res.data.success) {
        toast.success("Mentoring session scheduled successfully!");
        setNewSession({ title: "", date: "", time: "", duration: "60" });
        fetchHubData();
      }
    } catch (err) {
      toast.error("Failed to schedule session");
    }
  };

  const stats = [
    { label: "Total Users", value: data?.stats?.[0]?.value || "0", change: data?.stats?.[0]?.change || "+0%", icon: Users, color: "neon-glow-purple" },
    { label: "Active Courses", value: data?.stats?.[1]?.value || "0", change: data?.stats?.[1]?.change || "+0%", icon: BookOpen, color: "neon-glow-cyan" },
    { label: "Mentors", value: data?.stats?.[2]?.value || "0", change: data?.stats?.[2]?.change || "+0%", icon: Users, color: "neon-glow-pink" },
    { label: "Problems", value: data?.stats?.[3]?.value || "0", change: data?.stats?.[3]?.change || "+0%", icon: TrendingUp, color: "neon-glow-purple" },
  ];

  const currentRevenueData = data?.revenueData || [];
  const currentCategoryData = data?.categoryData || [];
  const currentActivity = (data?.recentActivity || []).map((act: any) => ({
    text: act.text,
    time: act.time ? new Date(act.time).toLocaleTimeString() : "",
    icon: act.type === "admin" ? Shield : UserPlus,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-foreground">
        <h2 className="text-xl font-semibold">Loading Admin Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-foreground">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl lg:text-3xl font-bold">
          Admin <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Platform overview and real-time analytics</p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={container} initial="hidden" animate="show">
        {stats.map((s) => (
          <motion.div key={s.label} variants={item}>
            <GlassCard className={`p-5 ${s.color}`}>
              <div className="flex items-center justify-between mb-3">
                <s.icon className="w-5 h-5 text-primary" />
                <span className="text-xs font-semibold text-neon-green bg-neon-green/10 px-2 py-0.5 rounded-full" style={{ color: 'hsl(145 80% 50%)' }}>{s.change}</span>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold mb-4">Revenue & User Growth</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={currentRevenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(265 90% 60%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(265 90% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 18%)" />
                <XAxis dataKey="month" stroke="hsl(220 15% 55%)" fontSize={12} />
                <YAxis stroke="hsl(220 15% 55%)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'hsl(230 25% 11%)', border: '1px solid hsl(230 20% 22%)', borderRadius: '8px', color: 'hsl(210 40% 96%)' }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(265 90% 60%)" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard className="p-5 h-full">
            <h3 className="text-sm font-semibold mb-4">Users by Category</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={currentCategoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 18%)" />
                <XAxis type="number" stroke="hsl(220 15% 55%)" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="hsl(220 15% 55%)" fontSize={11} width={60} />
                <Tooltip contentStyle={{ background: 'hsl(230 25% 11%)', border: '1px solid hsl(230 20% 22%)', borderRadius: '8px', color: 'hsl(210 40% 96%)' }} />
                <Bar dataKey="count" fill="hsl(195 100% 50%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>
      </div>

      {/* Central Admin Hub Tab Panels */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <GlassCard className="p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" /> Platform Administration Console
          </h2>
          <Tabs defaultValue="problems" className="space-y-4">
            <TabsList className="bg-muted/40 border border-border/50 grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="problems" className="text-xs">Coding Problems</TabsTrigger>
              <TabsTrigger value="meetings" className="text-xs">Schedule Sessions</TabsTrigger>
              <TabsTrigger value="aptitude" className="text-xs">Aptitude Prep</TabsTrigger>
              <TabsTrigger value="badges" className="text-xs">System Badges</TabsTrigger>
            </TabsList>

            {/* CODING PROBLEMS MANAGEMENT */}
            <TabsContent value="problems" className="space-y-4">
              <div className="grid lg:grid-cols-5 gap-6">
                <form onSubmit={handleCreateProblem} className="lg:col-span-2 space-y-4 p-4 border border-border bg-card/40 rounded-xl">
                  <h4 className="text-xs font-bold text-primary uppercase">Add Coding Question</h4>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Title</Label>
                    <Input placeholder="e.g. Reverse Linked List" value={newProblem.title} onChange={e => setNewProblem({ ...newProblem, title: e.target.value })} className="bg-muted/30 border-border/50 text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Difficulty</Label>
                      <Select value={newProblem.difficulty} onValueChange={v => setNewProblem({ ...newProblem, difficulty: v })}>
                        <SelectTrigger className="bg-muted/30 border-border/50 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                          <SelectItem value="Expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Points</Label>
                      <Input type="number" value={newProblem.points} onChange={e => setNewProblem({ ...newProblem, points: e.target.value })} className="bg-muted/30 border-border/50 text-xs" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Category (Topic)</Label>
                    <Input placeholder="e.g. Stack, DP, Array" value={newProblem.category} onChange={e => setNewProblem({ ...newProblem, category: e.target.value })} className="bg-muted/30 border-border/50 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Description</Label>
                    <Input placeholder="Problem statements and constraints" value={newProblem.description} onChange={e => setNewProblem({ ...newProblem, description: e.target.value })} className="bg-muted/30 border-border/50 text-xs" />
                  </div>
                  <Button type="submit" className="w-full text-xs font-semibold py-1.5 gradient-primary text-primary-foreground">Create Problem</Button>
                </form>

                <div className="lg:col-span-3 space-y-2 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Existing Coding Questions</h4>
                  {problems.map((p) => (
                    <div key={p.id} className="p-3 border border-border/60 bg-card/20 rounded-lg flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-semibold">{p.title}</h5>
                        <p className="text-[10px] text-muted-foreground">{p.category} · {p.points} XP</p>
                      </div>
                      <Badge className={p.difficulty === 'Easy' ? 'bg-neon-green/20 text-neon-green border-neon-green/30' : p.difficulty === 'Medium' ? 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/30' : 'bg-neon-pink/20 text-neon-pink border-neon-pink/30'}>
                        {p.difficulty}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* SESSIONS / MEETINGS MANAGEMENT */}
            <TabsContent value="meetings" className="space-y-4">
              <div className="grid lg:grid-cols-5 gap-6">
                <form onSubmit={handleCreateSession} className="lg:col-span-2 space-y-4 p-4 border border-border bg-card/40 rounded-xl">
                  <h4 className="text-xs font-bold text-primary uppercase">Schedule Meeting</h4>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Session Title</Label>
                    <Input placeholder="e.g. Mock Placement Panel" value={newSession.title} onChange={e => setNewSession({ ...newSession, title: e.target.value })} className="bg-muted/30 border-border/50 text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Date</Label>
                      <Input type="date" value={newSession.date} onChange={e => setNewSession({ ...newSession, date: e.target.value })} className="bg-muted/30 border-border/50 text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Time</Label>
                      <Input type="time" value={newSession.time} onChange={e => setNewSession({ ...newSession, time: e.target.value })} className="bg-muted/30 border-border/50 text-xs" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Duration (mins)</Label>
                    <Input type="number" value={newSession.duration} onChange={e => setNewSession({ ...newSession, duration: e.target.value })} className="bg-muted/30 border-border/50 text-xs" />
                  </div>
                  <Button type="submit" className="w-full text-xs font-semibold py-1.5 gradient-primary text-primary-foreground">Create Session</Button>
                </form>

                <div className="lg:col-span-3 space-y-2 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Live Session Schedules</h4>
                  {sessions.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4">No meetings scheduled.</p>
                  ) : (
                    sessions.map((s) => (
                      <div key={s._id} className="p-3 border border-border/60 bg-card/20 rounded-lg flex items-center justify-between">
                        <div>
                          <h5 className="text-xs font-semibold">{s.title}</h5>
                          <p className="text-[10px] text-muted-foreground">{new Date(s.scheduledAt).toLocaleString()} · {s.durationMinutes} mins</p>
                        </div>
                        <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30">
                          {s.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            {/* APTITUDE TOPICS MONITOR */}
            <TabsContent value="aptitude" className="space-y-4">
              <div className="p-4 border border-border bg-card/40 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-primary uppercase">Placement Aptitude Syllabus Configuration</h4>
                <p className="text-xs text-muted-foreground">The platform currently features 23 detailed aptitude topics. Ensure standard cheatsheets and formulas are synced.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  {["Arithmetic", "Reasoning", "Verbal Ability", "Data Interpretation"].map((category) => (
                    <div key={category} className="p-3 border border-border bg-muted/20 rounded-lg text-center">
                      <ClipboardList className="w-5 h-5 mx-auto mb-1 text-primary animate-pulse" />
                      <p className="text-xs font-semibold">{category}</p>
                      <Badge className="mt-1 bg-neon-green/20 text-neon-green border-neon-green/30">Active</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* BADGES COLLECTION MONITOR */}
            <TabsContent value="badges" className="space-y-4">
              <div className="p-4 border border-border bg-card/40 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-primary uppercase">System Placement Badges Audit</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {[
                    { emoji: "👋", name: "First Login" },
                    { emoji: "🎓", name: "First Course Completed" },
                    { emoji: "💻", name: "First Coding Problem" },
                    { emoji: "🔢", name: "10 Coding Problems" },
                    { emoji: "🏅", name: "25 Coding Problems" },
                    { emoji: "🚀", name: "50 Coding Problems" },
                    { emoji: "💯", name: "100 Coding Problems" },
                    { emoji: "🌟", name: "250 Coding Problems" },
                    { emoji: "💎", name: "500 Coding Problems" },
                    { emoji: "👑", name: "1000 Coding Problems" },
                    { emoji: "⚡", name: "First Aptitude Quiz" },
                    { emoji: "🟢", name: "Aptitude Beginner" },
                    { emoji: "🟡", name: "Aptitude Intermediate" },
                    { emoji: "🔴", name: "Aptitude Master" },
                    { emoji: "🔥", name: "7-Day Streak" },
                    { emoji: "💥", name: "15-Day Streak" },
                    { emoji: "🎯", name: "30-Day Streak" },
                    { emoji: "🏆", name: "100-Day Streak" },
                    { emoji: "🤝", name: "First Meeting" },
                    { emoji: "📜", name: "First Certificate" },
                  ].map((badge) => (
                    <div key={badge.name} className="p-2 border border-border/60 bg-muted/20 rounded-lg text-center flex flex-col items-center justify-center">
                      <span className="text-xl">{badge.emoji}</span>
                      <p className="text-[10px] text-muted-foreground mt-1 text-center font-medium line-clamp-1">{badge.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </GlassCard>
      </motion.div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Live Activity
          </h3>
          <div className="space-y-3">
            {currentActivity.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">{a.text}</p>
                  <p className="text-[10px] text-muted-foreground">{a.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
