import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Zap } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_SLOTS = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM",
];

type SlotState = "available" | "booked" | "none";
type AvailabilityMap = Record<string, SlotState>;

const MentorAvailabilityCalendar = () => {
  const [availability, setAvailability] = useState<AvailabilityMap>(() => {
    const init: AvailabilityMap = {};
    DAYS.forEach(day => TIME_SLOTS.forEach(slot => { init[`${day}-${slot}`] = "none"; }));
    // Some defaults
    init["Mon-10:00 AM"] = "available";
    init["Mon-11:00 AM"] = "available";
    init["Wed-2:00 PM"] = "booked";
    init["Wed-3:00 PM"] = "available";
    init["Fri-9:00 AM"] = "available";
    init["Fri-10:00 AM"] = "booked";
    return init;
  });

  const [availableToday, setAvailableToday] = useState(true);

  const toggleSlot = (key: string) => {
    setAvailability(prev => {
      const current = prev[key];
      if (current === "booked") return prev;
      return { ...prev, [key]: current === "available" ? "none" : "available" };
    });
  };

  const availableCount = Object.values(availability).filter(v => v === "available").length;
  const bookedCount = Object.values(availability).filter(v => v === "booked").length;

  const nextAvailable = (() => {
    for (const day of DAYS) {
      for (const slot of TIME_SLOTS) {
        if (availability[`${day}-${slot}`] === "available") return `${day} ${slot}`;
      }
    }
    return "None";
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2 text-foreground text-base">
              <Calendar className="w-5 h-5 text-primary" /> Weekly Availability
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Available Today</span>
                <Switch checked={availableToday} onCheckedChange={setAvailableToday} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            <Badge variant="secondary" className="bg-primary/15 text-primary border-primary/25 gap-1">
              <Clock className="w-3 h-3" /> {availableCount} slots open
            </Badge>
            <Badge variant="secondary" className="bg-accent/15 text-accent border-accent/25 gap-1">
              <Zap className="w-3 h-3" /> {bookedCount} booked
            </Badge>
            <Badge variant="outline" className="text-muted-foreground gap-1 text-xs">
              Next: {nextAvailable}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Header row */}
              <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-1 mb-1">
                <div />
                {DAYS.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              {/* Time rows */}
              {TIME_SLOTS.map(slot => (
                <div key={slot} className="grid grid-cols-[80px_repeat(7,1fr)] gap-1 mb-1">
                  <div className="text-xs text-muted-foreground flex items-center justify-end pr-2 whitespace-nowrap">
                    {slot}
                  </div>
                  {DAYS.map(day => {
                    const key = `${day}-${slot}`;
                    const state = availability[key];
                    return (
                      <motion.button
                        key={key}
                        onClick={() => toggleSlot(key)}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        className={`h-8 rounded-md text-[10px] font-medium transition-all duration-300 border ${
                          state === "available"
                            ? "bg-gradient-to-br from-primary/30 to-secondary/20 border-primary/40 text-primary shadow-[0_0_8px_hsl(var(--primary)/0.2)]"
                            : state === "booked"
                            ? "bg-accent/15 border-accent/30 text-accent cursor-not-allowed opacity-70"
                            : "bg-muted/30 border-border/30 text-muted-foreground/40 hover:bg-muted/50 hover:border-border/50"
                        }`}
                      >
                        {state === "available" ? "Open" : state === "booked" ? "Booked" : ""}
                      </motion.button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          {/* Legend */}
          <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-gradient-to-br from-primary/40 to-secondary/30 border border-primary/40" /> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-accent/20 border border-accent/30" /> Booked
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-muted/30 border border-border/30" /> Empty
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MentorAvailabilityCalendar;
