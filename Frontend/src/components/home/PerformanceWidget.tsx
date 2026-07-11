import GlassCard from "../shared/GlassCard";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { day: "Mon", problems: 8 },
  { day: "Tue", problems: 12 },
  { day: "Wed", problems: 6 },
  { day: "Thu", problems: 15 },
  { day: "Fri", problems: 10 },
  { day: "Sat", problems: 18 },
  { day: "Sun", problems: 14 },
];

const PerformanceWidget = () => {
  return (
    <GlassCard className="p-5" tilt={false}>
      <h3 className="font-semibold mb-4 text-foreground">Weekly Performance</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="day" tick={{ fill: "hsl(220 15% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: "hsl(230 25% 11% / 0.9)",
                border: "1px solid hsl(230 20% 22%)",
                borderRadius: "8px",
                color: "hsl(210 40% 96%)",
              }}
            />
            <Bar dataKey="problems" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(265 90% 60%)" />
                <stop offset="100%" stopColor="hsl(195 100% 50%)" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

export default PerformanceWidget;
