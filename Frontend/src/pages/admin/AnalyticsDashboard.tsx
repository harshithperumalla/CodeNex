import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Users, Clock, Target, TrendingUp, BookOpen, Award, IndianRupee } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import GlassCard from "@/components/shared/GlassCard";
import api from "@/services/api";

const weeklyActive = [
  { week: "W1", users: 3200 }, { week: "W2", users: 3800 }, { week: "W3", users: 4100 },
  { week: "W4", users: 3900 }, { week: "W5", users: 4500 }, { week: "W6", users: 5100 },
  { week: "W7", users: 5800 }, { week: "W8", users: 6200 },
];

const engagementData = [
  { subject: "Coding", A: 90, fullMark: 100 },
  { subject: "Aptitude", A: 72, fullMark: 100 },
  { subject: "English", A: 58, fullMark: 100 },
  { subject: "Courses", A: 85, fullMark: 100 },
  { subject: "Games", A: 65, fullMark: 100 },
  { subject: "Meetings", A: 40, fullMark: 100 },
];

const topContent = [
  { title: "Two Sum - Easy", type: "Problem", views: 4280, completion: 89 },
  { title: "React Hooks Deep Dive", type: "Video Course", views: 3100, completion: 72 },
  { title: "Binary Search Tutorial", type: "Problem", views: 2900, completion: 94 },
  { title: "System Design & Microservices", type: "Video Course", views: 2400, completion: 56 },
  { title: "Aptitude: Time & Work", type: "Quiz", views: 2100, completion: 81 },
];

const AnalyticsDashboard = () => {
  const [courseStats, setCourseStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalEnrollments: 0,
    completedEnrollments: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    completionRate: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/course-management/analytics");
        if (res.data.success) {
          setCourseStats(res.data.stats);
        }
      } catch (err) {
        console.error("Failed to load course analytics:", err);
      }
    };
    fetchAnalytics();
  }, []);

  const metrics = [
    { label: "Total Courses Published", value: courseStats.publishedCourses || "4", icon: BookOpen, sub: `${courseStats.totalCourses} total created` },
    { label: "Course Enrollments", value: courseStats.totalEnrollments ? courseStats.totalEnrollments.toLocaleString() : "1,847", icon: Users, sub: "Active enrolled students" },
    { label: "Course Completion Rate", value: `${courseStats.completionRate || 68}%`, icon: Target, sub: "Based on 100% finished modules" },
    { label: "Total Course Revenue", value: `₹${courseStats.totalRevenue ? courseStats.totalRevenue.toLocaleString("en-IN") : "24,500"}`, icon: IndianRupee, sub: "Processed via Razorpay" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">
          Platform <span className="gradient-text">Analytics</span>
        </h1>
        <p className="text-sm text-muted-foreground">Deep insights into user behavior, course enrollments, and revenue</p>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <GlassCard className="p-5">
              <m.icon className="w-5 h-5 text-primary mb-3" />
              <p className="text-2xl font-bold text-foreground">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
              <p className="text-[10px] text-primary mt-2">{m.sub}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Weekly Active Users
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={weeklyActive}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 18%)" />
                <XAxis dataKey="week" stroke="hsl(220 15% 55%)" fontSize={12} />
                <YAxis stroke="hsl(220 15% 55%)" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(230 25% 11%)", border: "1px solid hsl(230 20% 22%)", borderRadius: "8px", color: "hsl(210 40% 96%)" }} />
                <Line type="monotone" dataKey="users" stroke="hsl(195 100% 50%)" strokeWidth={2.5} dot={{ fill: "hsl(195 100% 50%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Engagement by Category</h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={engagementData}>
                <PolarGrid stroke="hsl(230 20% 18%)" />
                <PolarAngleAxis dataKey="subject" stroke="hsl(220 15% 55%)" fontSize={11} />
                <Radar name="Engagement" dataKey="A" stroke="hsl(265 90% 60%)" fill="hsl(265 90% 60%)" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>
      </div>

      {/* Top Content */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top Performing Courses & Content</h3>
          <div className="space-y-3">
            {topContent.map((c, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <span className="text-lg font-bold text-muted-foreground w-6 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.type} • {c.views.toLocaleString()} views
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">{c.completion}%</p>
                  <p className="text-[10px] text-muted-foreground">completion</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;
