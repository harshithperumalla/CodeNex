import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, Clock, BookOpen, Star, Mail, CheckCircle2, Video, Users } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

interface Mentor {
  _id: string;
  fullName: string;
  email: string;
  skills: string[];
  badgesEarned: string[];
  about: string;
  avatar: string;
  college: string;
  degree: string;
  yearOfStudy: string;
}

const Mentors = () => {
  const { user } = useUser();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [loading, setLoading] = useState(true);
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDesc, setSessionDesc] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState(45);
  const [bookingLoading, setBookingLoading] = useState(false);
  const navigate = useNavigate();

  const [assignedMentor, setAssignedMentor] = useState<Mentor | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  
  const tags = ["All", "DSA", "React", "Node.js", "System Design", "Python"];

  useEffect(() => {
    if (user?.assignedMentor && mentors.length > 0) {
      const found = mentors.find((m) => m._id === user.assignedMentor);
      if (found) setAssignedMentor(found);
    }
  }, [user, mentors]);

  const fetchMessages = async () => {
    if (!user?.assignedMentor) return;
    try {
      const res = await api.get(`/communication/messages/${user.assignedMentor}`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  useEffect(() => {
    if (user?.assignedMentor) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user?.assignedMentor) return;
    try {
      const res = await api.post("/communication/messages", {
        receiverId: user.assignedMentor,
        content: chatInput.trim(),
      });
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.message]);
        setChatInput("");
      }
    } catch (err) {
      toast.error("Failed to send message.");
    }
  };

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await api.get("/user/mentors");
        if (res.data.success) {
          setMentors(res.data.mentors);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load mentors list.");
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingMentor) return;

    if (!sessionTitle || !scheduledAt) {
      toast.error("Please enter a title and select a date/time.");
      return;
    }

    setBookingLoading(true);
    try {
      const res = await api.post("/user/sessions/book", {
        mentorId: bookingMentor._id,
        title: sessionTitle,
        description: sessionDesc,
        scheduledAt,
        durationMinutes: duration,
      });

      if (res.data.success) {
        toast.success(`Successfully booked 1:1 session with ${bookingMentor.fullName}!`);
        setBookingMentor(null);
        setSessionTitle("");
        setSessionDesc("");
        setScheduledAt("");
        navigate("/meetings");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredMentors = mentors.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.about.toLowerCase().includes(search.toLowerCase());
    const matchesTag =
      selectedTag === "All" || m.skills.some((s) => s.toLowerCase() === selectedTag.toLowerCase());
    return matchesSearch && matchesTag;
  });

  return (
    <div className="relative min-h-screen py-10 px-4 md:px-8 bg-background overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        {/* Header Hero */}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary"
          >
            <Star className="w-3.5 h-3.5 fill-primary" /> Personalized Mentorship
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold tracking-tight text-foreground"
          >
            Find Your Personal <span className="gradient-text">Tech Mentor</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-muted-foreground leading-relaxed"
          >
            Schedule 1:1 sessions for live code assistance, mock interviews, system design reviews, and customized career guidance.
          </motion.p>
        </div>

        {/* Your Assigned Mentor Section */}
        {assignedMentor && (
          <GlassCard className="p-6 overflow-hidden relative border-secondary/40 shadow-[0_0_20px_rgba(236,72,153,0.15)] animate-fade-in" tilt={false}>
            {/* VIP badge or title */}
            <div className="absolute top-0 right-0 px-4 py-1.5 gradient-secondary rounded-bl-xl text-[10px] uppercase font-bold tracking-widest text-secondary-foreground shadow-sm">
              Your Assigned Mentor
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
              {/* Mentor profile */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex gap-4 mt-2">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted border border-secondary flex-shrink-0">
                      <img src={assignedMentor.avatar} alt={assignedMentor.fullName} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-base font-bold text-foreground">{assignedMentor.fullName}</h2>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-secondary" /> {assignedMentor.degree} · {assignedMentor.college}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-secondary" /> {assignedMentor.email}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    "{assignedMentor.about}"
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {assignedMentor.skills.map((skill) => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300 font-mono">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                  <span className="text-xs text-neon-green font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Direct Contact Active
                  </span>
                  <Button onClick={() => setBookingMentor(assignedMentor)} className="gradient-secondary text-secondary-foreground text-xs h-9 px-4 rounded-lg">
                    Book 1:1 Session
                  </Button>
                </div>
              </div>

              {/* Chat section */}
              <div className="lg:col-span-7 flex flex-col h-[300px] bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
                {/* Chat header */}
                <div className="px-4 py-2.5 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-foreground">Direct Message Support</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Online</span>
                </div>

                {/* Messages list */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-white/10 flex flex-col">
                  {messages.length === 0 ? (
                    <div className="my-auto text-center space-y-1">
                      <p className="text-xs text-muted-foreground">Send a message to introduce yourself and start conversing!</p>
                    </div>
                  ) : (
                    messages.map((msg, mIdx) => {
                      const isMe = msg.sender === user?.userId;
                      return (
                        <div key={mIdx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs shadow-md ${
                            isMe 
                              ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-tr-none' 
                              : 'bg-white/10 border border-white/5 text-foreground rounded-tl-none'
                          }`}>
                            <p className="leading-relaxed break-words">{msg.content}</p>
                            <span className="block text-[8px] text-white/50 text-right mt-1">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Chat input */}
                <form onSubmit={handleSendMessage} className="p-3 bg-white/5 border-t border-white/5 flex gap-2">
                  <Input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message to your mentor..."
                    className="flex-1 bg-black/40 text-xs border-white/10"
                  />
                  <Button type="submit" size="sm" className="gradient-primary text-primary-foreground font-semibold text-xs px-4 h-9">
                    Send
                  </Button>
                </form>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Filters and Search Bar */}
        <GlassCard className="p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search mentors by name or expertise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-background/50 border-border/80 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 justify-center">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  selectedTag === t
                    ? "bg-primary/20 text-primary border-primary/40 shadow-sm"
                    : "bg-muted/30 text-muted-foreground border-border/60 hover:bg-muted/60"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Mentors Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-muted/20 animate-pulse border border-border/40" />
            ))}
          </div>
        ) : filteredMentors.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-foreground">No mentors match your search</h3>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search keywords.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMentors.map((mentor, index) => (
              <motion.div
                key={mentor._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <GlassCard className="p-6 h-full flex flex-col justify-between hover:border-primary/30 transition-all group duration-300">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex gap-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                        <img
                          src={mentor.avatar}
                          alt={mentor.fullName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-1.5">
                          {mentor.fullName}
                          {mentor.badgesEarned.includes("Mentor Pro") && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 font-semibold font-mono">PRO</span>
                          )}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" /> {mentor.degree} · {mentor.college}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" /> {mentor.email}
                        </p>
                      </div>
                    </div>

                    {/* About */}
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {mentor.about}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1">
                      {mentor.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300 font-mono"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border/40 mt-6 flex items-center justify-between gap-4">
                    <span className="text-xs text-neon-green font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active Today
                    </span>
                    <Button
                      onClick={() => setBookingMentor(mentor)}
                      className="gradient-primary text-primary-foreground font-semibold text-xs h-9 px-4 rounded-lg cursor-pointer"
                    >
                      Book 1:1 Session
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingMentor(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md glass-strong rounded-2xl overflow-hidden border border-border/80 shadow-2xl relative z-10"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-border gradient-primary text-primary-foreground">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 overflow-hidden flex-shrink-0">
                    <img src={bookingMentor.avatar} alt={bookingMentor.fullName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Book 1:1 Mentorship</h3>
                    <p className="text-xs text-primary-foreground/80">With {bookingMentor.fullName}</p>
                  </div>
                </div>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={handleBookSession} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Session Topic / Title</label>
                  <Input
                    required
                    type="text"
                    placeholder="e.g. Graph Algorithms / Resume Strategy Review"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    className="bg-background/50 text-sm h-10 border-border/80"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Details / Questions</label>
                  <textarea
                    placeholder="What specific questions or bugs do you want to address in this call?"
                    value={sessionDesc}
                    onChange={(e) => setSessionDesc(e.target.value)}
                    className="w-full min-h-[80px] p-3 rounded-lg bg-background/50 text-sm border border-border/80 focus:border-primary/50 outline-none text-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Date & Time</label>
                    <div className="relative">
                      <Input
                        required
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="bg-background/50 text-xs h-10 border-border/80"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Duration (mins)</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-lg bg-background/50 text-sm border border-border/80 focus:border-primary/50 outline-none text-foreground"
                    >
                      <option value={30} className="bg-card">30 Minutes</option>
                      <option value={45} className="bg-card">45 Minutes</option>
                      <option value={60} className="bg-card">60 Minutes</option>
                    </select>
                  </div>
                </div>

                {/* Info Alert */}
                <div className="rounded-lg bg-muted/40 border border-border/60 p-3 flex gap-2.5 items-start">
                  <Video className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Upon booking, a secure virtual classroom link will be generated. You can access the meeting details inside the **Meetings** page.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setBookingMentor(null)}
                    className="flex-1 text-xs h-10 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={bookingLoading}
                    className="flex-1 gradient-primary text-primary-foreground font-semibold text-xs h-10 rounded-lg cursor-pointer"
                  >
                    {bookingLoading ? "Booking slot..." : "Confirm Booking"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Mentors;
