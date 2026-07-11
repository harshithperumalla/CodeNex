import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/shared/GlassCard";
import { useUser } from "@/contexts/UserContext";
import { Flame, Trophy, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const WEEKS = 24;
const DAYS_PER_WEEK = 7;
const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

interface DayData {
  date: Date;
  dateKey: string;
  count: number;
}

const getIntensityClass = (count: number) => {
  if (count === 0) return "bg-white/5 border-white/10 hover:bg-white/10";
  if (count === 1) return "bg-neon-green/20 border-neon-green/30 shadow-[0_0_4px_rgba(34,197,94,0.15)]";
  if (count <= 3) return "bg-neon-green/50 border-neon-green/40 shadow-[0_0_8px_rgba(34,197,94,0.3)]";
  return "bg-gradient-to-br from-neon-green to-emerald-400 border-emerald-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]";
};

const formatDate = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const getMonthLabels = (data: DayData[]) => {
  const labels: { text: string; index: number }[] = [];
  let prevMonth = -1;
  
  for (let i = 0; i < data.length; i += 7) {
    const d = data[i].date;
    const m = d.getMonth();
    if (m !== prevMonth) {
      labels.push({
        text: d.toLocaleDateString("en-US", { month: "short" }),
        index: Math.floor(i / 7),
      });
      prevMonth = m;
    }
  }
  return labels;
};

const MonthlyStreakCalendar = () => {
  const { user } = useUser();
  const completedDates = user?.completedDates || [];

  const activityMap = useMemo(() => {
    const map: Record<string, number> = {};
    completedDates.forEach((dStr) => {
      map[dStr] = (map[dStr] || 0) + 1;
    });
    return map;
  }, [completedDates]);

  // Compute stats dynamically from the actual completedDates
  const { currentStreak, longestStreak, totalActive } = useMemo(() => {
    if (completedDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalActive: 0 };
    }

    const dateSet = new Set(completedDates);
    
    // Sort unique dates in descending order (newest first)
    const sortedDates = Array.from(dateSet)
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    let currentStreak = 0;
    
    // Current streak validation relative to today / yesterday
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let hasToday = dateSet.has(todayStr);
    let hasYesterday = dateSet.has(yesterdayStr);

    if (hasToday || hasYesterday) {
      let checkDate = hasToday ? today : yesterday;
      while (true) {
        const checkStr = checkDate.toISOString().split("T")[0];
        if (dateSet.has(checkStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Longest streak calculation (chronological)
    const chronoDates = Array.from(dateSet)
      .map(d => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime());
    
    let longestStreak = 0;
    let tempStreak = 0;

    if (chronoDates.length > 0) {
      tempStreak = 1;
      longestStreak = 1;
      for (let i = 1; i < chronoDates.length; i++) {
        const diffTime = chronoDates[i].getTime() - chronoDates[i - 1].getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    return {
      currentStreak,
      longestStreak,
      totalActive: dateSet.size
    };
  }, [completedDates]);

  // Construct 24 weeks of calendar data ending with the current week
  const data = useMemo(() => {
    const list: DayData[] = [];
    const today = new Date();
    
    // Find current day of week (Monday index = 0, Sunday index = 6)
    const dayOfWeek = (today.getDay() + 6) % 7; 
    
    // Get Monday of the current week
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() - dayOfWeek);
    
    // Start date is exactly 23 weeks prior to currentMonday
    const startDate = new Date(currentMonday);
    startDate.setDate(currentMonday.getDate() - (WEEKS - 1) * 7);

    const temp = new Date(startDate);
    for (let i = 0; i < WEEKS * DAYS_PER_WEEK; i++) {
      const dateKey = temp.toISOString().split("T")[0];
      const count = activityMap[dateKey] || 0;
      list.push({
        date: new Date(temp),
        dateKey,
        count
      });
      temp.setDate(temp.getDate() + 1);
    }
    return list;
  }, [activityMap]);

  // Group days into columns (weeks)
  const weeks = useMemo(() => {
    const w: DayData[][] = [];
    for (let i = 0; i < WEEKS; i++) {
      w.push(data.slice(i * 7, (i + 1) * 7));
    }
    return w;
  }, [data]);

  const monthLabels = useMemo(() => getMonthLabels(data), [data]);

  const stats = [
    { icon: Flame, label: "Current Streak", value: `${currentStreak} days`, color: "text-neon-orange" },
    { icon: Trophy, label: "Longest Streak", value: `${longestStreak} days`, color: "text-neon-yellow" },
    { icon: CalendarDays, label: "Active Days", value: `${totalActive}`, color: "text-neon-cyan" },
  ];

  return (
    <GlassCard className="p-6 w-full" tilt={false}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Flame className="w-5 h-5 text-neon-orange animate-pulse" /> Activity Streak
        </h3>
        
        {/* Streak Stats Grid */}
        <div className="flex gap-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10"
            >
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <div className="text-left">
                <span className="block text-xs font-bold text-foreground leading-none">{s.value}</span>
                <span className="text-[9px] text-muted-foreground">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable grid container for small devices */}
      <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="min-w-[560px] pl-2">
          {/* Month labels */}
          <div className="relative h-4 mb-1 text-[10px] text-muted-foreground font-mono">
            {monthLabels.map((lbl, idx) => (
              <span
                key={idx}
                className="absolute"
                style={{ left: `${lbl.index * 16.5 + 28}px` }}
              >
                {lbl.text}
              </span>
            ))}
          </div>

          <TooltipProvider delayDuration={50}>
            <div className="flex gap-0.5">
              {/* Day Labels */}
              <div className="flex flex-col gap-0.5 mr-1.5">
                {DAY_LABELS.map((label, i) => (
                  <div
                    key={i}
                    className="h-[12px] w-6 text-[9px] text-muted-foreground flex items-center justify-end pr-1 font-mono"
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Weeks columns */}
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((day, di) => (
                    <Tooltip key={di}>
                      <TooltipTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.35, zIndex: 10 }}
                          className={`w-[12px] h-[12px] rounded-[2.5px] border cursor-pointer transition-all duration-150 ${getIntensityClass(
                            day.count
                          )}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-[10px] py-1 px-2 border-border bg-card/90 backdrop-blur-md">
                        <p className="font-semibold text-foreground">
                          {day.count > 0
                            ? `Solved ${day.count} task${day.count > 1 ? "s" : ""} on ${formatDate(day.date)}`
                            : `No activity on ${formatDate(day.date)}`}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </TooltipProvider>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground justify-end pr-2 font-mono">
            <span>Less</span>
            {[0, 1, 3, 4].map((c) => (
              <div
                key={c}
                className={`w-[10px] h-[10px] rounded-[2px] border ${getIntensityClass(c)}`}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default MonthlyStreakCalendar;
