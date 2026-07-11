import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, Video, Plus, MapPin } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/services/api";

interface Session {
  id: string;
  title: string;
  type: string;
  student: string;
  date: string;
  time: string;
  duration: string;
  status: string;
  mode: string;
}

const SessionScheduling = () => {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", studentId: "", date: "", time: "", duration: "45" });

  const fetchData = async () => {
    try {
      const [sessRes, studRes] = await Promise.all([
        api.get("/mentor/sessions"),
        api.get("/mentor/students")
      ]);

      if (sessRes.data.success) {
        const mapped = sessRes.data.sessions.map((s: any) => {
          const dateObj = new Date(s.scheduledAt);
          return {
            id: s._id,
            title: s.title,
            type: s.student ? "1-on-1" : "group",
            student: s.student ? s.student.fullName : "All Students",
            date: dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
            time: dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
            duration: `${s.durationMinutes} min`,
            status: s.status === "scheduled" ? "upcoming" : s.status,
            mode: "video"
          };
        });
        setSessions(mapped);
      }

      if (studRes.data.success) {
        setStudents(studRes.data.students);
      }
    } catch (err) {
      console.error("Failed to load mentor data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const create = async () => {
    if (!form.title || !form.date || !form.time) {
      toast.error("Title, date, and time are required");
      return;
    }
    try {
      const scheduledAt = new Date(`${form.date}T${form.time}`);
      const res = await api.post("/mentor/sessions", {
        title: form.title,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: Number(form.duration),
        studentId: form.studentId || undefined,
        meetingLink: "https://meet.google.com/abc-defg-hij"
      });

      if (res.data.success) {
        toast.success("Session created successfully — students notified! 🔔");
        setForm({ title: "", studentId: "", date: "", time: "", duration: "45" });
        setShowForm(false);
        fetchData();
      }
    } catch (err) {
      toast.error("Failed to schedule session");
    }
  };

  const filtered = sessions.filter(s => filter === "all" || s.status === filter);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Session Scheduling</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your mentoring sessions</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gradient-primary text-primary-foreground border-0 gap-2">
          <Plus className="w-4 h-4" /> Schedule Session
        </Button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <GlassCard className="p-6">
            <h3 className="font-semibold text-foreground mb-4">New Session</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input placeholder="Session title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-muted/30 border-border/50 text-foreground" />
              
              <Select value={form.studentId} onValueChange={v => setForm({ ...form, studentId: v })}>
                <SelectTrigger className="bg-muted/30 border-border/50 text-foreground"><SelectValue placeholder="Select Student" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="group">Group (All Students)</SelectItem>
                  {students.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="bg-muted/30 border-border/50 text-foreground" />
              <Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="bg-muted/30 border-border/50 text-foreground" />
              <Input placeholder="Duration (e.g. 45 min)" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="bg-muted/30 border-border/50 text-foreground" />
              <Button onClick={create} className="gradient-primary text-primary-foreground border-0">Create & Notify</Button>
            </div>
          </GlassCard>
        </motion.div>
      )}

      <div className="flex gap-2">
        {(["all", "upcoming", "completed"] as const).map(f => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}
            className={filter === f ? "gradient-primary text-primary-foreground border-0" : "border-border/50 text-foreground"}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading sessions...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No sessions scheduled.</div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((session, i) => (
            <motion.div key={session.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${session.type === 'group' ? 'bg-accent/20' : 'bg-primary/20'}`}>
                    {session.type === 'group' ? <Users className="w-6 h-6 text-accent" /> : <Video className="w-6 h-6 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{session.title}</h3>
                    <p className="text-sm text-muted-foreground">{session.student}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {session.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {session.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {session.duration}</span>
                  </div>
                  <Badge className={session.status === 'upcoming' ? 'bg-secondary/20 text-secondary border-secondary/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}>
                    {session.status}
                  </Badge>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionScheduling;
