import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Video, Calendar, Users, TrendingUp, Clock, Star } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import api from "@/services/api";

const recentActivityPlaceholder = [
  { type: "video", text: "Uploaded 'Advanced React Patterns'", time: "2h ago" },
  { type: "session", text: "Completed session with Priya S.", time: "4h ago" },
  { type: "student", text: "New student enrolled: Rahul K.", time: "6h ago" },
  { type: "video", text: "Uploaded 'DSA: Graph Algorithms'", time: "1d ago" },
  { type: "session", text: "Scheduled group session for March 5", time: "1d ago" },
];

const MentorDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Chat states
  const [partners, setPartners] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");

  const fetchMentorDashboard = async () => {
    try {
      const res = await api.get("/mentor/dashboard");
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch mentor dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const res = await api.get("/communication/partners");
      if (res.data.success) {
        setPartners(res.data.partners);
        if (res.data.partners.length > 0 && !selectedPartner) {
          setSelectedPartner(res.data.partners[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load chat partners:", err);
    }
  };

  const fetchMessages = async () => {
    if (!selectedPartner) return;
    try {
      const res = await api.get(`/communication/messages/${selectedPartner._id}`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  useEffect(() => {
    fetchMentorDashboard();
    fetchPartners();
  }, []);

  useEffect(() => {
    if (selectedPartner) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedPartner]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedPartner) return;
    try {
      const res = await api.post("/communication/messages", {
        receiverId: selectedPartner._id,
        content: chatInput.trim(),
      });
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.message]);
        setChatInput("");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const stats = [
    { label: "Total Courses", value: String(data?.stats?.courses || 0), icon: Video, color: "text-secondary" },
    { label: "Upcoming Sessions", value: String(data?.stats?.upcomingSessions || 0), icon: Calendar, color: "text-primary" },
    { label: "Active Students", value: String(data?.stats?.totalStudents || 0), icon: Users, color: "text-accent" },
    { label: "Avg Rating", value: "4.8", icon: Star, color: "neon-text-cyan" },
  ];

  const currentActivity = (data?.upcomingSessions || []).map((s: any) => ({
    type: "session",
    text: `Upcoming session: "${s.title}"`,
    time: new Date(s.scheduledAt).toLocaleString(),
  }));

  const finalActivity = currentActivity.length > 0 ? currentActivity : recentActivityPlaceholder;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <h2 className="text-xl font-semibold text-foreground">Loading Mentor Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Mentor Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back! Here's your overview.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-secondary" /> Recent Activity
          </h2>
          <div className="space-y-3">
            {finalActivity.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${item.type === 'video' ? 'bg-secondary' : item.type === 'session' ? 'bg-primary' : 'bg-accent'}`} />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{item.text}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Quick Stats
          </h2>
          <div className="space-y-4">
            {[
              { label: "Session Completion Rate", value: 94, color: "bg-primary" },
              { label: "Student Satisfaction", value: 96, color: "bg-secondary" },
              { label: "Video Engagement", value: 78, color: "bg-accent" },
              { label: "Response Rate", value: 88, color: "bg-primary" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{stat.label}</span>
                  <span className="text-foreground font-medium">{stat.value}%</span>
                </div>
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${stat.value}%` }} transition={{ delay: 0.5, duration: 0.8 }} className={`h-full rounded-full ${stat.color}`} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Messaging Hub */}
      <GlassCard className="p-5" tilt={false}>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-accent animate-pulse" /> Assigned Students Messaging Hub
        </h2>
        {partners.length === 0 ? (
          <p className="text-sm text-muted-foreground">You currently have no students assigned to you.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[400px]">
            {/* Sidebar list of students */}
            <div className="md:col-span-4 border-r border-white/5 pr-4 overflow-y-auto space-y-2">
              {partners.map((p) => (
                <button
                  key={p._id}
                  onClick={() => setSelectedPartner(p)}
                  className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors text-left ${
                    selectedPartner?._id === p._id
                      ? "bg-primary/20 border border-primary/30"
                      : "bg-white/5 border border-transparent hover:bg-white/10"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center font-bold text-xs text-primary-foreground">
                    {p.avatar || p.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{p.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Chat conversation area */}
            <div className="md:col-span-8 flex flex-col h-full bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
              {selectedPartner ? (
                <>
                  {/* Chat header */}
                  <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center font-bold text-[10px] text-primary-foreground">
                        {selectedPartner.avatar || selectedPartner.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-foreground">{selectedPartner.fullName}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Active conversation</span>
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-white/10 flex flex-col">
                    {messages.length === 0 ? (
                      <div className="my-auto text-center space-y-1">
                        <p className="text-xs text-muted-foreground">No message history yet. Say hello to {selectedPartner.fullName}!</p>
                      </div>
                    ) : (
                      messages.map((msg, mIdx) => {
                        const isMe = msg.sender !== selectedPartner._id;
                        return (
                          <div key={mIdx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs shadow-md ${
                              isMe 
                                ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-tr-none" 
                                : "bg-white/10 border border-white/5 text-foreground rounded-tl-none"
                            }`}>
                              <p className="leading-relaxed break-words">{msg.content}</p>
                              <span className="block text-[8px] text-white/50 text-right mt-1">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Chat input */}
                  <form onSubmit={handleSendMessage} className="p-3 bg-white/5 border-t border-white/5 flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Send message to ${selectedPartner.fullName}...`}
                      className="flex-1 px-3 py-2 bg-black/40 text-xs border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button type="submit" className="gradient-primary text-primary-foreground font-semibold text-xs px-4 h-9 rounded-lg">
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div className="m-auto text-center">
                  <p className="text-sm text-muted-foreground">Select a student from the sidebar to chat.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default MentorDashboard;
