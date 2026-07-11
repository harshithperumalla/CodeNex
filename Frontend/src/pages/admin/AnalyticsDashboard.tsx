import { motion } from "framer-motion";
import { Activity, Users, Clock, Target, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import GlassCard from "@/components/shared/GlassCard";

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

const metrics = [
  { label: "Avg Session Duration", value: "24 min", icon: Clock, sub: "+3 min from last week" },
  { label: "Daily Active Users", value: "1,847", icon: Users, sub: "Peak: 2,340 on Wednesday" },
  { label: "Completion Rate", value: "68%", icon: Target, sub: "+5% improvement" },
  { label: "Retention (30d)", value: "74%", icon: TrendingUp, sub: "Above industry avg (62%)" },
];

const topContent = [
  { title: "Two Sum - Easy", type: "Problem", views: 4280, completion: 89 },
  { title: "React Hooks Deep Dive", type: "Video", views: 3100, completion: 72 },
  { title: "Binary Search Tutorial", type: "Problem", views: 2900, completion: 94 },
  { title: "System Design Basics", type: "Video", views: 2400, completion: 56 },
  { title: "Aptitude: Time & Work", type: "Quiz", views: 2100, completion: 81 },
];

const AnalyticsDashboard = () => (
  <div className="max-w-7xl mx-auto space-y-6">
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold">Platform <span className="gradient-text">Analytics</span></h1>
      <p className="text-sm text-muted-foreground">Deep insights into user behavior and engagement</p>
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
              <Tooltip contentStyle={{ background: 'hsl(230 25% 11%)', border: '1px solid hsl(230 20% 22%)', borderRadius: '8px', color: 'hsl(210 40% 96%)' }} />
              <Line type="monotone" dataKey="users" stroke="hsl(195 100% 50%)" strokeWidth={2.5} dot={{ fill: 'hsl(195 100% 50%)', r: 4 }} />
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
        <h3 className="text-sm font-semibold text-foreground mb-4">Top Performing Content</h3>
        <div className="space-y-3">
          {topContent.map((c, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <span className="text-lg font-bold text-muted-foreground w-6 text-center">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.type} • {c.views.toLocaleString()} views</p>
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

export default AnalyticsDashboard;
