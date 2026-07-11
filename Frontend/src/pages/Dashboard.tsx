import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/shared/GlassCard";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from "recharts";
import { Code2, Brain, BookOpen, Trophy, Target, Zap, Award, Keyboard } from "lucide-react";
import MonthlyStreakCalendar from "@/components/dashboard/MonthlyStreakCalendar";
import api from "@/services/api";

const weeklyData = [
  { day: "Mon", coding: 8, aptitude: 5 },
  { day: "Tue", coding: 12, aptitude: 8 },
  { day: "Wed", coding: 6, aptitude: 10 },
  { day: "Thu", coding: 15, aptitude: 7 },
  { day: "Fri", coding: 10, aptitude: 12 },
  { day: "Sat", coding: 18, aptitude: 9 },
  { day: "Sun", coding: 14, aptitude: 11 },
];

const rankData = [
  { week: "W1", rank: 25 },
  { week: "W2", rank: 18 },
  { week: "W3", rank: 12 },
  { week: "W4", rank: 7 },
];

const getBestWpm = () => {
  try {
    const results = JSON.parse(localStorage.getItem("typingResults") || "[]");
    if (results.length === 0) return "—";
    return Math.max(...results.map((r: any) => r.wpm)) + " WPM";
  } catch { return "—"; }
};


const recentCourses = [
  { name: "React Advanced Patterns", progress: 78 },
  { name: "System Design Basics", progress: 45 },
  { name: "Node.js Masterclass", progress: 92 },
];

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/user/dashboard");
        if (res.data.success) {
          setDashboardData(res.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const currentWeeklyData = dashboardData?.weeklyActivity ?? weeklyData;
  const currentRankData = dashboardData?.rankHistory ?? rankData;
  const currentRecentCourses = dashboardData?.recentCourses ?? recentCourses;

  const stats = [
    { icon: Code2, label: "Problems Solved", value: String(dashboardData?.profile?.codingSolved ?? 0), color: "text-neon-cyan" },
    { icon: Brain, label: "Aptitude Score", value: dashboardData?.profile?.aptitudeCompleted !== undefined ? `${Math.min(100, dashboardData.profile.aptitudeCompleted * 2)}%` : "0%", color: "text-neon-purple" },
    { icon: BookOpen, label: "Courses Done", value: String(dashboardData?.profile?.coursesWatched ?? 0), color: "text-neon-green" },
    { icon: Trophy, label: "Current Rank", value: dashboardData?.profile?.rank ? `#${dashboardData.profile.rank}` : "—", color: "text-neon-orange" },
    { icon: Target, label: "Total Points", value: dashboardData?.profile?.points?.toLocaleString() ?? "0", color: "text-neon-pink" },
    { icon: Zap, label: "Streak Days", value: String(dashboardData?.profile?.streak ?? 0), color: "text-neon-yellow" },
    { icon: Keyboard, label: "Best Typing Speed", value: getBestWpm(), color: "text-neon-orange" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold gradient-text"
      >
        Dashboard
      </motion.h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <GlassCard key={s.label} delay={i * 0.06} className="p-4">
            <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-5" tilt={false}>
          <h3 className="font-semibold mb-4 text-foreground">Weekly Activity</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentWeeklyData}>
                <XAxis dataKey="day" tick={{ fill: "hsl(220 15% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: "hsl(230 25% 11% / 0.9)", border: "1px solid hsl(230 20% 22%)", borderRadius: "8px", color: "hsl(210 40% 96%)" }} />
                <Bar dataKey="coding" fill="hsl(195 100% 50%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="aptitude" fill="hsl(265 90% 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5" tilt={false}>
          <h3 className="font-semibold mb-4 text-foreground">Rank Progress</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentRankData}>
                <defs>
                  <linearGradient id="rankGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(265 90% 60%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(265 90% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" tick={{ fill: "hsl(220 15% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis reversed hide />
                <Tooltip contentStyle={{ background: "hsl(230 25% 11% / 0.9)", border: "1px solid hsl(230 20% 22%)", borderRadius: "8px", color: "hsl(210 40% 96%)" }} />
                <Area type="monotone" dataKey="rank" stroke="hsl(265 90% 60%)" fill="url(#rankGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Streak Calendar */}
      <MonthlyStreakCalendar />

      {/* Recent Courses */}
      <GlassCard className="p-5" tilt={false}>
        <h3 className="font-semibold mb-4 text-foreground">Recently Watched</h3>
        <div className="space-y-3">
          {currentRecentCourses.map((c, i) => (
            <div key={c.name} className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-foreground">{c.name}</p>
                <div className="w-full h-2 bg-muted rounded-full mt-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.progress}%` }}
                    transition={{ delay: 0.5 + i * 0.2, duration: 0.8 }}
                    className="h-full rounded-full gradient-primary"
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-muted-foreground">{c.progress}%</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default Dashboard;
