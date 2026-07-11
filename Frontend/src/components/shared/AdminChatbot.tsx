import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

const quickReplies = [
  "Show today's revenue",
  "How many new users this week?",
  "Top performing course",
  "Show pending payments",
];

const mockResponses: Record<string, string> = {
  "revenue": "📊 **Today's Revenue:** ₹89,400\n\n- UPI: ₹42,300 (47%)\n- Card: ₹28,100 (31%)\n- Net Banking: ₹12,800 (14%)\n- Wallet: ₹6,200 (7%)\n\n📈 This is **18% higher** than yesterday!",
  "users": "👥 **New Users This Week:** 342\n\n- Monday: 52\n- Tuesday: 48\n- Wednesday: 67 ⭐ Peak\n- Thursday: 55\n- Friday: 61\n- Saturday: 38\n- Sunday: 21\n\n🔥 **Retention rate:** 74% (30-day)",
  "course": "🏆 **Top Performing Course:**\n\n**Advanced DSA with Java** by Vikram Singh\n- Enrolled: 342 students\n- Rating: ⭐ 4.8/5\n- Revenue: ₹6,83,658\n- Completion: 68%\n\n📚 Runner-up: React Masterclass (218 enrolled)",
  "payment": "⏳ **Pending Payments:** 3\n\n1. Karthik Nair — ₹1,499 (Net Banking timeout)\n2. Ravi Shankar — ₹2,499 (Bank processing)\n3. Divya Mehta — ₹999 (Verification pending)\n\n**Total Pending:** ₹4,997\n💡 Auto-retry scheduled in 30 minutes.",
  "default": "🤖 I can help you with:\n\n• **Revenue analytics** — Ask about daily/weekly/monthly revenue\n• **User insights** — New signups, retention, active users\n• **Course performance** — Top courses, ratings, enrollments\n• **Payment status** — Pending, failed, or refund transactions\n• **Platform health** — Server status, error rates, load\n\nWhat would you like to know?"
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("revenue") || lower.includes("earning") || lower.includes("money")) return mockResponses.revenue;
  if (lower.includes("user") || lower.includes("signup") || lower.includes("new")) return mockResponses.users;
  if (lower.includes("course") || lower.includes("top") || lower.includes("perform")) return mockResponses.course;
  if (lower.includes("payment") || lower.includes("pending") || lower.includes("transaction")) return mockResponses.payment;
  return mockResponses.default;
}

const AdminChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "👋 Hi Admin! I'm your AI assistant. Ask me about revenue, users, courses, or payments." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Simulate AI thinking delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));
    const response = getResponse(text);
    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-accent flex items-center justify-center neon-glow-pink cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ y: { repeat: Infinity, duration: 2 } }}
      >
        {open ? <X className="w-6 h-6 text-accent-foreground" /> : <Bot className="w-6 h-6 text-accent-foreground" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] h-[500px] glass-strong rounded-2xl flex flex-col overflow-hidden neon-glow-pink"
          >
            {/* Header */}
            <div className="p-4 border-b border-border gradient-accent">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-foreground" />
                <div>
                  <h3 className="font-semibold text-accent-foreground text-sm">AI Admin Assistant</h3>
                  <p className="text-[10px] text-accent-foreground/70">Powered by CodeNex Intelligence</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "gradient-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted/60 text-foreground rounded-bl-sm"
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-center text-muted-foreground text-xs p-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...
                </motion.div>
              )}
              <div ref={endRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {quickReplies.map(qr => (
                  <button
                    key={qr}
                    onClick={() => send(qr)}
                    className="text-[11px] px-2.5 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-border flex gap-2">
              <input
                type="text"
                placeholder="Ask about analytics..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send(input)}
                className="flex-1 bg-muted rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center disabled:opacity-40"
              >
                <Send className="w-4 h-4 text-accent-foreground" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminChatbot;
