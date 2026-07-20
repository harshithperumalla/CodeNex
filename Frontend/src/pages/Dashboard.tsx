import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/shared/GlassCard";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Code2, Brain, BookOpen, Trophy, Target, Zap, Keyboard, Loader2, PlayCircle } from "lucide-react";
import MonthlyStreakCalendar from "@/components/dashboard/MonthlyStreakCalendar";
import api from "@/services/api";

const getBestWpm = () => {
  try {
    const results = JSON.parse(localStorage.getItem("typingResults") || "[]");
    if (results.length === 0) return "0 WPM";
    return Math.max(...results.map((r: any) => r.wpm)) + " WPM";
  } catch { return "0 WPM"; }
};

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

  const currentWeeklyData = dashboardData?.weeklyActivity || [];
  const currentRankData = dashboardData?.rankHistory || [];
  const currentRecentCourses = dashboardData?.recentCourses || [];

  const stats = [
    { icon: Code2, label: "Problems Solved", value: String(dashboardData?.profile?.codingSolved ?? 0), color: "text-neon-cyan" },
    { icon: Brain, label: "Aptitude Score", value: dashboardData?.profile?.aptitudeCompleted !== undefined ? `${Math.min(100, dashboardData.profile.aptitudeCompleted * 2)}%` : "0%", color: "text-neon-purple" },
    { icon: BookOpen, label: "Courses Done", value: String(dashboardData?.profile?.coursesWatched ?? 0), color: "text-neon-green" },
    { icon: Trophy, label: "Current Rank", value: dashboardData?.profile?.rank ? `#${dashboardData.profile.rank}` : "—", color: "text-neon-orange" },
    { icon: Target, label: "Total Points", value: (dashboardData?.profile?.points ?? 0).toLocaleString(), color: "text-neon-pink" },
    { icon: Zap, label: "Streak Days", value: String(dashboardData?.profile?.streak ?? 0), color: "text-neon-yellow" },
    { icon: Keyboard, label: "Best Typing Speed", value: getBestWpm(), color: "text-neon-orange" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
          {currentWeeklyData.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentWeeklyData}>
                  <XAxis dataKey="day" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8 }} />
                  <Bar dataKey="coding" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Coding Solves" />
                  <Bar dataKey="aptitude" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Aptitude Solves" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-xs text-muted-foreground">
              No activity recorded this week yet. Start solving problems to track progress!
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5" tilt={false}>
          <h3 className="font-semibold mb-4 text-foreground">Rank Progression</h3>
          {currentRankData.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentRankData}>
                  <XAxis dataKey="week" stroke="#666" fontSize={12} />
                  <YAxis reversed stroke="#666" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="rank" stroke="#f97316" strokeWidth={2} dot={{ fill: "#f97316" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-xs text-muted-foreground">
              No rank history available yet.
            </div>
          )}
        </GlassCard>
      </div>

      {/* Monthly Streak Calendar */}
      <MonthlyStreakCalendar completedDates={dashboardData?.profile?.completedDates || []} />

      {/* Recent Enrolled Courses */}
      <GlassCard className="p-5" tilt={false}>
        <h3 className="font-semibold mb-4 text-foreground">Recent Enrolled Courses</h3>
        {currentRecentCourses.length > 0 ? (
          <div className="space-y-3">
            {currentRecentCourses.map((c: any) => (
              <div key={c.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <PlayCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.progress || 0}% completed</p>
                  </div>
                </div>
                <div className="w-24 bg-muted/40 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${c.progress || 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
            <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="font-medium text-foreground">No enrolled courses yet</p>
            <p>Explore the Courses page to start learning and track your progress here!</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default Dashboard;
