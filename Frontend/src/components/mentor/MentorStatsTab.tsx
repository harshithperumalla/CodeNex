import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Users, CheckCircle, TrendingUp, UserCheck, BarChart3 } from "lucide-react";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const skillData = [
  { name: "React / Next.js", level: 92 },
  { name: "Data Structures & Algorithms", level: 88 },
  { name: "System Design", level: 85 },
  { name: "Backend (Node.js)", level: 78 },
  { name: "Database Design", level: 74 },
  { name: "DevOps / CI-CD", level: 65 },
];

const MentorStatsTab = () => {
  const mentored = useAnimatedCounter(124);
  const placed = useAnimatedCounter(89);
  const rate = useAnimatedCounter(72);
  const active = useAnimatedCounter(36);

  const stats = [
    { icon: Users, label: "Total Mentored", counter: mentored, suffix: "", color: "text-secondary" },
    { icon: CheckCircle, label: "Students Placed", counter: placed, suffix: "", color: "text-[hsl(var(--neon-green))]" },
    { icon: TrendingUp, label: "Success Rate", counter: rate, suffix: "%", color: "text-primary" },
    { icon: UserCheck, label: "Active Students", counter: active, suffix: "", color: "text-accent" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.08 }}>
            <Card className="glass border-border/50 text-center py-5">
              <CardContent className="p-0 flex flex-col items-center gap-2">
                <div ref={s.counter.ref} className={`p-2.5 rounded-xl bg-muted/50 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {s.counter.count}{s.suffix}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Skills Visualization */}
      <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground text-base">
              <BarChart3 className="w-5 h-5 text-secondary" /> Skills Proficiency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {skillData.map((skill, i) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
              >
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-foreground font-medium">{skill.name}</span>
                  <span className="text-muted-foreground">{skill.level}%</span>
                </div>
                <div className="relative">
                  <Progress value={skill.level} className="h-2.5 bg-muted/50" />
                  <div
                    className="absolute inset-0 h-2.5 rounded-full opacity-40 blur-sm"
                    style={{
                      width: `${skill.level}%`,
                      background: `linear-gradient(90deg, hsl(var(--primary)), hsl(var(--neon-cyan)))`,
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default MentorStatsTab;
