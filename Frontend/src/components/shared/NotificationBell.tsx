import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/contexts/UserContext";

type Notif = {
  id: number;
  from: "Admin" | "Mentor" | "System";
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

const fromColor: Record<Notif["from"], string> = {
  Admin: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Mentor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  System: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

const NotificationBell = () => {
  const { user } = useUser();
  const [readIds, setReadIds] = useState<number[]>([]);

  // Construct dynamic notifications list from User details
  const notifications: Notif[] = [];
  let index = 1;

  if (user) {
    // 1. Badge Notifications
    if (user.badgesEarned && user.badgesEarned.length > 0) {
      user.badgesEarned.forEach((badgeName: string) => {
        notifications.push({
          id: index++,
          from: "System",
          title: `🏆 Badge Earned!`,
          body: `Congratulations, you have unlocked the '${badgeName}' placement badge!`,
          time: "Just now",
          unread: !readIds.includes(index - 1),
        });
      });
    }

    // 2. Course Completed & Certifications
    if (user.coursesWatched > 0) {
      notifications.push({
        id: index++,
        from: "Admin",
        title: `🎓 Course Started`,
        body: `You are enrolled in ${user.coursesWatched} courses. Finish tasks to unlock certificates.`,
        time: "1h ago",
        unread: !readIds.includes(index - 1),
      });
    }

    if (user.certificatesEarned > 0) {
      notifications.push({
        id: index++,
        from: "Admin",
        title: `📜 Certificate Generated`,
        body: `A completion certificate CNX-CERT is ready! Download it under the Courses panel.`,
        time: "Just now",
        unread: !readIds.includes(index - 1),
      });
    }

    // 3. Coding Milestone
    if (user.codingSolved > 0) {
      notifications.push({
        id: index++,
        from: "System",
        title: `💻 Coding Milestone`,
        body: `You solved ${user.codingSolved} code questions! Keep checking the weekly dashboard activity.`,
        time: "2h ago",
        unread: !readIds.includes(index - 1),
      });
    }

    // 4. Aptitude Milestone
    if (user.aptitudeCompleted > 0) {
      notifications.push({
        id: index++,
        from: "System",
        title: `⚡ Aptitude Milestone`,
        body: `Successfully cleared ${user.aptitudeCompleted} concept test categories.`,
        time: "3h ago",
        unread: !readIds.includes(index - 1),
      });
    }

    // 5. Meetings & Reminders
    if (user.meetingsAttended > 0) {
      notifications.push({
        id: index++,
        from: "Mentor",
        title: `🤝 Meeting Attended`,
        body: `Mock interview session finished. Attendance and scores recorded successfully.`,
        time: "1d ago",
        unread: !readIds.includes(index - 1),
      });
    }
  }

  // Add default welcome notification
  if (notifications.length === 0) {
    notifications.push({
      id: index++,
      from: "System",
      title: "Welcome to CodeNex! 👋",
      body: "Start practicing coding, aptitude, or watch video lectures to prep for placement tests.",
      time: "Now",
      unread: !readIds.includes(index - 1),
    });
  }

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
  };

  const markOneRead = (id: number) => {
    if (!readIds.includes(id)) {
      setReadIds([...readIds, id]);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative h-10 w-10 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-primary/40 transition-colors flex items-center justify-center"
        >
          <Bell className="h-4 w-4 text-foreground/80" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-[10px] font-bold text-white flex items-center justify-center px-1 shadow-[0_0_10px_rgba(244,63,94,0.7)]"
            >
              {unreadCount}
            </motion.span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[340px] p-0 bg-background/90 backdrop-blur-xl border-white/10 text-foreground"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div>
            <div className="text-sm font-semibold">Notifications</div>
            <div className="text-[11px] text-muted-foreground">{unreadCount} unread</div>
          </div>
          <button
            onClick={markAllRead}
            className="text-[11px] text-primary hover:underline flex items-center gap-1"
          >
            <Check className="h-3 w-3" /> Mark all read
          </button>
        </div>
        <div className="max-h-[380px] overflow-y-auto">
          <AnimatePresence>
            {notifications.map((n, i) => (
              <motion.button
                key={n.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => markOneRead(n.id)}
                className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                  n.unread ? "bg-primary/[0.04]" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${fromColor[n.from]}`}
                  >
                    {n.from}
                  </span>
                  {n.unread && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />}
                  <span className="ml-auto text-[10px] text-muted-foreground">{n.time}</span>
                </div>
                <div className="text-sm font-medium text-foreground mt-1">{n.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
