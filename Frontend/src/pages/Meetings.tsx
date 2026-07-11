import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Video, Users, Calendar, Clock, Mic, MicOff, VideoOff, PhoneOff, Maximize2 } from "lucide-react";
import api from "@/services/api";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

interface Session {
  id: string;
  type: string;
  mentor: string;
  time: string;
  duration: string;
  price: string;
  topic?: string;
  meetingLink?: string;
  isCompleted?: boolean;
}

const Meetings = () => {
  const { setUser } = useUser();
  const [active, setActive] = useState<Session | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [seconds, setSeconds] = useState(0);

  const [upcoming, setUpcoming] = useState<Session[]>([]);
  const [past, setPast] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = async () => {
    try {
      const res = await api.get("/user/sessions");
      if (res.data.success) {
        const upcomingList: Session[] = [];
        const pastList: Session[] = [];
        res.data.sessions.forEach((s: any) => {
          const dateObj = new Date(s.scheduledAt);
          const mapped: Session = {
            id: s._id,
            type: s.student ? "1:1 Mentor" : "Group Class",
            mentor: s.mentor?.fullName || "Priya Sharma",
            time: dateObj.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            duration: `${s.durationMinutes} min`,
            price: "Free",
            topic: s.description || s.title,
            meetingLink: s.meetingLink,
            isCompleted: s.status === "completed"
          };
          if (s.status === "completed") {
            pastList.push(mapped);
          } else {
            upcomingList.push(mapped);
          }
        });
        setUpcoming(upcomingList);
        setPast(pastList);
      }
    } catch (err) {
      console.error("Failed to load meetings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    if (!active) return;
    setSeconds(0);
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [active]);

  const handleLeaveCall = async () => {
    if (!active) return;
    try {
      const res = await api.post(`/user/sessions/${active.id}/attend`);
      if (res.data.success) {
        toast.success("Attendance marked! +50 Points awarded.");
        if (res.data.user) {
          setUser(res.data.user);
        }
        fetchMeetings();
      }
    } catch (err) {
      console.error("Failed to mark attendance:", err);
      setActive(null);
    } finally {
      setActive(null);
    }
  };

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-foreground">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold gradient-text">
        Meetings & Sessions
      </motion.h1>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading sessions...</div>
      ) : (
        <>
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4">No upcoming sessions scheduled.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((s, i) => (
                  <GlassCard key={s.id} delay={i * 0.08} className="p-5">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        {s.type === "1:1 Mentor" ? <Video className="w-6 h-6 text-neon-cyan" /> : <Users className="w-6 h-6 text-neon-purple" />}
                        <div>
                          <h3 className="font-semibold text-foreground text-sm">{s.topic}</h3>
                          <p className="text-[11px] text-muted-foreground">{s.type} with {s.mentor}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-muted-foreground flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {s.time}</span>
                        <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {s.duration}</span>
                        <span className="font-bold text-foreground">{s.price}</span>
                        <Button size="sm" onClick={() => setActive(s)} className="gradient-primary text-primary-foreground gap-1 text-xs">
                          <Video className="h-3.5 w-3.5" /> Join
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Past Sessions</h2>
            {past.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4">No past sessions.</p>
            ) : (
              <div className="space-y-3">
                {past.map((s, i) => (
                  <GlassCard key={s.id} delay={i * 0.08} className="p-4 opacity-70">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-foreground">{s.topic}</p>
                        <p className="text-[11px] text-muted-foreground">{s.type} with {s.mentor} • Completed at {s.time}</p>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Video Call Modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
              <div>
                <div className="text-sm font-semibold text-white">{active.type} · {active.mentor}</div>
                <div className="text-xs text-rose-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" /> LIVE · {mmss}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-white"><Maximize2 className="h-4 w-4" /></Button>
            </div>

            {/* Video grid */}
            <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto w-full">
              {/* Mentor video placeholder */}
              <div className="relative rounded-2xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-white/10 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, rgba(139,92,246,0.5), transparent), radial-gradient(circle at 70% 70%, rgba(6,182,212,0.5), transparent)" }} />
                <div className="relative text-center">
                  <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white shadow-[0_0_40px_rgba(139,92,246,0.6)]">
                    {active.mentor.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="mt-3 text-white font-medium">{active.mentor}</div>
                  <div className="text-xs text-white/60">Mentor</div>
                </div>
              </div>

              {/* Self video */}
              <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                {camOn ? (
                  <>
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(34,211,238,0.4), transparent)" }} />
                    <div className="relative text-center">
                      <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-3xl font-bold text-white">
                        YOU
                      </div>
                      <div className="mt-3 text-white font-medium">You</div>
                      <div className="text-xs text-white/60">{micOn ? "🎤 Unmuted" : "🔇 Muted"}</div>
                    </div>
                  </>
                ) : (
                  <div className="text-white/60 flex flex-col items-center gap-2">
                    <VideoOff className="h-12 w-12" />
                    <span className="text-sm">Camera off</span>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 py-6 border-t border-white/5">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                  micOn ? "bg-white/10 text-white hover:bg-white/20" : "bg-rose-500 text-white"
                }`}
              >
                {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setCamOn(!camOn)}
                className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                  camOn ? "bg-white/10 text-white hover:bg-white/20" : "bg-rose-500 text-white"
                }`}
              >
                {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </button>
              <button
                onClick={handleLeaveCall}
                className="h-12 px-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-2 font-medium"
              >
                <PhoneOff className="h-5 w-5" /> End call
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Meetings;
