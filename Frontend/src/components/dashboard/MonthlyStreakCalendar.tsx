import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import GlassCard from "@/components/shared/GlassCard";
import { useUser } from "@/contexts/UserContext";
import { Flame, Trophy, CalendarDays, Calendar } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { problems as ALL_PROBLEMS } from "@/data/problems";

const MonthlyStreakCalendar = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const completedDates = user?.completedDates || [];

  // Load solvedIds from localStorage to be consistent with CodingArena
  const solvedIds = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("arena.solvedIds") ?? "[]");
    } catch {
      return [];
    }
  }, []);

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

  // Calendar setup
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed
  const todayDate = currentDate.getDate();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const getProblemForDay = (day: number) => {
    if (!ALL_PROBLEMS || ALL_PROBLEMS.length === 0) return null;
    return ALL_PROBLEMS[(day + 2) % ALL_PROBLEMS.length];
  };

  const handleDayClick = (day: number) => {
    const prob = getProblemForDay(day);
    if (prob) {
      localStorage.setItem("arena.currentProblemId", String(prob.id));
      navigate("/arena");
    }
  };

  const stats = [
    { icon: Flame, label: "Current Streak", value: `${currentStreak} days`, color: "text-neon-orange" },
    { icon: Trophy, label: "Longest Streak", value: `${longestStreak} days`, color: "text-neon-yellow" },
    { icon: CalendarDays, label: "Active Days", value: `${totalActive}`, color: "text-neon-cyan" },
  ];

  return (
    <GlassCard className="p-6 w-full" tilt={false}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.4), 0 0 8px rgba(168, 85, 247, 0.3); border-color: rgba(168, 85, 247, 0.6); }
          50% { box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.8), 0 0 16px rgba(168, 85, 247, 0.6); border-color: rgba(168, 85, 247, 1); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s infinite ease-in-out;
        }
        @keyframes check-scale {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-check-scale {
          animation: check-scale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      ` }} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" /> Daily Challenge Calendar
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

      <div className="max-w-md mx-auto rounded-xl border border-white/5 bg-white/[0.01] p-4">
        <div className="text-center text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
          {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
        </div>
        
        <TooltipProvider delayDuration={50}>
          <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-[10px]">
            {/* Weekday headers */}
            {["S", "M", "T", "W", "T", "F", "S"].map((dayName, idx) => (
              <div key={idx} className="text-muted-foreground font-semibold py-1">{dayName}</div>
            ))}

            {/* Blank prepends */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="aspect-square opacity-0" />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const d = idx + 1;
              const prob = getProblemForDay(d);
              const isToday = d === todayDate;
              
              // solved dateStr key formatted stably
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const solved = completedDates.includes(dateStr) || (prob && solvedIds.includes(prob.id));
              const isFuture = d > todayDate;
              const isMissed = d < todayDate && !solved;

              return (
                <Tooltip key={`day-${d}`}>
                  <TooltipTrigger asChild>
                    <button
                      disabled={isFuture}
                      onClick={() => handleDayClick(d)}
                      className={`relative aspect-square rounded-lg flex items-center justify-center font-bold text-xs border transition-all duration-200 ${
                        solved
                          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)] hover:scale-110"
                          : isToday
                          ? "bg-purple-500/10 border-purple-500 text-purple-200 animate-pulse-glow hover:scale-110"
                          : isFuture
                          ? "border-transparent text-muted-foreground/30 cursor-not-allowed"
                          : isMissed
                          ? "bg-rose-500/15 border-rose-500/35 text-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.15)] hover:scale-110"
                          : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20 hover:bg-white/10 hover:scale-110"
                      }`}
                    >
                      {solved ? (
                        <span className="animate-check-scale text-emerald-400 font-extrabold">✓</span>
                      ) : (
                        <span>{d}</span>
                      )}
                      
                      {isToday && !solved && (
                        <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-purple-400" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs py-1.5 px-3 border-border bg-card/95 backdrop-blur-md">
                    <div>
                      {solved ? (
                        <p className="font-semibold text-emerald-300">
                          Completed: {prob ? prob.title : `Challenge ${d}`}
                        </p>
                      ) : isToday ? (
                        <p className="font-semibold text-purple-300">
                          Today's Challenge: {prob ? prob.title : `Challenge ${d}`}
                        </p>
                      ) : isMissed ? (
                        <p className="font-semibold text-rose-400">
                          Missed: {prob ? prob.title : `Challenge ${d}`}
                        </p>
                      ) : (
                        <p className="font-semibold text-muted-foreground">
                          Future Challenge: {prob ? prob.title : `Challenge ${d}`}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </div>
    </GlassCard>
  );
};

export default MonthlyStreakCalendar;
