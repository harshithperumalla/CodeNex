import React, { useState, useRef, useEffect, useMemo, Component, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Loader2,
  Code2,
  Brain,
  Lightbulb,
  Maximize2,
  Minimize2,
  Plus,
  Trash2,
  Search,
  Copy,
  Check,
  Download,
  Paperclip,
  Mic,
  MicOff,
  FileText,
  FileCode,
  Bot,
  History,
  Briefcase,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

interface Attachment {
  fileName: string;
  fileType: string;
  fileSize: number;
  snippet: string;
}

interface Message {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: Attachment[];
  timestamp?: string;
  isStreaming?: boolean;
}

interface Session {
  id: string;
  _id?: string;
  title: string;
  provider?: string;
  lastMessage?: string;
  messagesCount?: number;
  createdAt?: string;
}

// React Error Boundary for the AI Chat Assistant
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}

class ChatErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("CodeNex AI Chat Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center text-xs text-foreground space-y-3 bg-black/80 rounded-2xl border border-rose-500/30">
          <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
          <h4 className="font-semibold text-sm">CodeNex AI Assistant Recovered</h4>
          <p className="text-muted-foreground text-[11px]">
            A temporary display error occurred. Click below to reset the interface.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground font-semibold text-xs"
          >
            Reset Chat Window
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Helper for formatting inline markdown
const parseInlineStyles = (text: string) => {
  if (!text || typeof text !== "string") return "";
  let html = text;
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-black/50 font-mono text-[11px] text-cyan-300 border border-white/10">$1</code>');
  return html;
};

// Isolated CodeBlock component adhering strictly to React Rules of Hooks
const CodeBlock = ({ code, lang }: { code: string; lang: string }) => {
  const [copied, setCopied] = useState(false);
  const safeCode = code || "";
  const safeLang = lang || "code";

  return (
    <div className="relative rounded-lg bg-black/80 border border-white/10 my-2 overflow-hidden font-mono text-xs shadow-lg">
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 text-[10px] text-muted-foreground border-b border-white/10">
        <span className="font-semibold text-neon-cyan uppercase">{safeLang}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(safeCode);
            setCopied(true);
            toast.success("Code copied!");
            setTimeout(() => setCopied(false), 2000);
          }}
          className="flex items-center gap-1 hover:text-foreground transition-colors px-1.5 py-0.5 rounded bg-white/10 text-[10px]"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy Code"}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-cyan-300 leading-relaxed font-mono">
        <code>{safeCode}</code>
      </pre>
    </div>
  );
};

const MarkdownViewer = ({ content }: { content: string }) => {
  if (!content || typeof content !== "string") return null;

  const parts = content.split("```");

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        const isCode = index % 2 === 1;
        if (isCode) {
          const lines = (part || "").split("\n");
          const lang = lines[0].trim() || "code";
          const code = lines.slice(1).join("\n").trim();
          return <CodeBlock key={index} code={code} lang={lang} />;
        }

        return (
          <div key={index} className="space-y-1.5">
            {(part || "").split("\n").map((line, lIdx) => {
              const trimmed = (line || "").trim();
              if (!trimmed) return <div key={lIdx} className="h-1.5" />;

              if (trimmed.startsWith("### ")) {
                return <h4 key={lIdx} className="text-xs font-bold text-foreground mt-2 mb-1">{trimmed.slice(4)}</h4>;
              }
              if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
                return <h3 key={lIdx} className="text-sm font-bold gradient-text mt-3 mb-1">{trimmed.slice(trimmed.startsWith("## ") ? 3 : 2)}</h3>;
              }

              if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
                const listText = trimmed.slice(2);
                return (
                  <div key={lIdx} className="flex gap-1.5 pl-2 text-xs text-muted-foreground leading-relaxed">
                    <span className="text-neon-cyan">•</span>
                    <span dangerouslySetInnerHTML={{ __html: parseInlineStyles(listText) }} />
                  </div>
                );
              }

              return (
                <p
                  key={lIdx}
                  className="text-xs text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: parseInlineStyles(line) }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// Quick action categories
const quickPrompts = [
  { label: "Debug Code", icon: Code2, prompt: "Help me debug this issue in my code" },
  { label: "DSA Strategy", icon: Brain, prompt: "Explain the Sliding Window pattern with an example" },
  { label: "Aptitude Trick", icon: Lightbulb, prompt: "Shortcut for Time & Work aptitude problems" },
  { label: "Interview Prep", icon: Briefcase, prompt: "Top HR interview questions & STAR method answers" },
];

const getCurrentProblemContext = () => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem("arena.currentProblem");
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

const DEFAULT_WELCOME_MESSAGE: Message = {
  id: "msg-welcome",
  role: "assistant",
  content: "👋 Hi! I am **CodeNex AI**, your dedicated AI Coding & Career Mentor.\n\nAsk me about **Coding, DSA, Debugging, Aptitude, English Communication, Resume Review, or HR & Technical Interviews**! 🚀",
};

const AIChatContent = () => {
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);

  // Sessions & Messages State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([DEFAULT_WELCOME_MESSAGE]);

  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [recording, setRecording] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingText, loading]);

  // Fetch Sessions
  const fetchSessions = async () => {
    try {
      const res = await api.get("/codenex-ai/sessions");
      if (res.data && res.data.success && Array.isArray(res.data.sessions)) {
        setSessions(res.data.sessions);
      }
    } catch (err) {
      console.log("Session fetch fallback");
    }
  };

  useEffect(() => {
    if (open) {
      fetchSessions();
    }
  }, [open]);

  // Load Session History
  const loadSession = async (sId: string) => {
    if (!sId) return;
    setCurrentSessionId(sId);
    try {
      const res = await api.get(`/codenex-ai/session/${sId}`);
      if (res.data && res.data.success && res.data.session) {
        setMessages(res.data.session.messages || [DEFAULT_WELCOME_MESSAGE]);
      }
    } catch (err) {
      console.log("Could not load session details");
    }
  };

  // Start New Chat Session
  const handleNewChat = async () => {
    try {
      const res = await api.post("/codenex-ai/session", { title: "New Conversation" });
      if (res.data && res.data.success && res.data.session) {
        const newS = res.data.session;
        setSessions((prev) => [{ id: newS._id, title: newS.title }, ...(prev || [])]);
        setCurrentSessionId(newS._id);
        setMessages(newS.messages || [DEFAULT_WELCOME_MESSAGE]);
      } else {
        setCurrentSessionId(null);
        setMessages([DEFAULT_WELCOME_MESSAGE]);
      }
    } catch (err) {
      setCurrentSessionId(null);
      setMessages([DEFAULT_WELCOME_MESSAGE]);
    }
  };

  // Delete Session
  const handleDeleteSession = async (sId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!sId) return;
    try {
      await api.delete(`/codenex-ai/session/${sId}`);
      const updated = (sessions || []).filter((s) => (s.id || s._id) !== sId);
      setSessions(updated);
      if (currentSessionId === sId) {
        handleNewChat();
      }
      toast.success("Conversation deleted");
    } catch (err) {
      toast.error("Failed to delete conversation");
    }
  };

  // File Upload Handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      const newAttachment: Attachment = {
        fileName: file.name,
        fileType: file.type || "text/plain",
        fileSize: file.size,
        snippet: text ? text.slice(0, 3000) : "",
      };
      setAttachments((prev) => [...(prev || []), newAttachment]);
      toast.success(`Attached ${file.name}`);
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Speech-to-Text Voice Dictation
  const toggleSpeechInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported in browser.");
      return;
    }

    if (recording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => setRecording(true);
      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };
      recognition.onerror = () => setRecording(false);
      recognition.onend = () => setRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setRecording(false);
    }
  };

  // Typing stream animation effect
  const simulateTypingStream = (fullText: string, msgId: string) => {
    if (!fullText) return;
    let currentLength = 0;
    const speed = 12;
    setTypingText("");

    const interval = setInterval(() => {
      currentLength += Math.floor(Math.random() * 4) + 2;
      if (currentLength >= fullText.length) {
        currentLength = fullText.length;
        clearInterval(interval);
        setMessages((prev) =>
          (prev || []).map((m) => (m.id === msgId ? { ...m, content: fullText, isStreaming: false } : m))
        );
        setTypingText("");
      } else {
        const chunk = fullText.slice(0, currentLength);
        setTypingText(chunk);
      }
    }, speed);
  };

  // Send Message
  const send = async (textPromptToSend?: string) => {
    const textPrompt = (textPromptToSend || input).trim();
    if ((!textPrompt && attachments.length === 0) || loading) return;

    const userMsgId = `msg-${Date.now()}-u`;
    const userMsg: Message = {
      id: userMsgId,
      role: "user",
      content: textPrompt || "Analyze attached file",
      attachments: [...(attachments || [])],
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...(prev || []), userMsg]);
    setInput("");
    const currentAttachments = [...(attachments || [])];
    setAttachments([]);
    setLoading(true);

    try {
      const activeProblem = getCurrentProblemContext();
      const res = await api.post("/codenex-ai/chat", {
        sessionId: currentSessionId,
        prompt: textPrompt,
        attachments: currentAttachments,
        activeProblemContext: activeProblem ? activeProblem.title : undefined,
      });

      if (res.data && res.data.success) {
        if (res.data.sessionId && res.data.sessionId !== currentSessionId) {
          setCurrentSessionId(res.data.sessionId);
          fetchSessions();
        }

        const replyContent = res.data.reply || "CodeNex AI Response Ready.";
        const assistantMsgId = res.data.message?.id || `msg-${Date.now()}-a`;

        const assistantMsg: Message = {
          id: assistantMsgId,
          role: "assistant",
          content: "",
          isStreaming: true,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...(prev || []), assistantMsg]);
        simulateTypingStream(replyContent, assistantMsgId);
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      console.error("CodeNex AI Chat error:", err);
      const fallbackReply = "👋 **CodeNex AI**: I can assist with Coding, DSA, Debugging, Aptitude, English Communication, and Resume Review. Please try asking your specific question!";
      const assistantMsgId = `msg-${Date.now()}-a`;

      setMessages((prev) => [
        ...(prev || []),
        {
          id: assistantMsgId,
          role: "assistant",
          content: fallbackReply,
          isStreaming: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Event listener for opening AI mentor with custom prompts
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent;
      setOpen(true);
      if (custom.detail?.prompt) {
        send(custom.detail.prompt);
      }
    };
    window.addEventListener("open-ai-mentor", handler);
    return () => window.removeEventListener("open-ai-mentor", handler);
  }, [messages, loading]);

  // Export Chat to Markdown
  const handleExportChat = () => {
    if (!messages || messages.length === 0) return;
    const text = messages
      .map((m) => `### ${m.role === "user" ? "User" : "CodeNex AI"}\n${m.content}\n`)
      .join("\n---\n\n");
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `codenex-ai-chat-${Date.now()}.md`;
    a.click();
    toast.success("Chat exported as Markdown!");
  };

  const filteredSessions = useMemo(() => {
    if (!Array.isArray(sessions)) return [];
    if (!searchQuery.trim()) return sessions;
    return sessions.filter((s) => s && s.title && typeof s.title === "string" && s.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [sessions, searchQuery]);

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full gradient-primary flex items-center justify-center neon-glow-purple cursor-pointer shadow-2xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ y: { repeat: Infinity, duration: 2.5 } }}
        title="Open CodeNex AI Assistant"
      >
        {open ? <X className="w-6 h-6 text-primary-foreground" /> : <MessageCircle className="w-6 h-6 text-primary-foreground" />}
      </motion.button>

      {/* CHATGPT-STYLE ASSISTANT POPUP MODAL */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            className={`fixed z-[100] bg-background/95 backdrop-blur-2xl border border-border/80 text-foreground rounded-2xl flex flex-col overflow-hidden neon-glow-purple shadow-2xl transition-all duration-300 ${
              isExpanded
                ? "bottom-6 right-6 left-6 top-6 sm:bottom-8 sm:right-8 sm:left-8 sm:top-8 w-auto h-auto max-w-none max-h-none"
                : "bottom-24 right-6 w-[92vw] sm:w-[460px] h-[620px] max-h-[85vh]"
            }`}
          >
            {/* HEADER BAR */}
            <div className="p-3.5 border-b border-border/60 gradient-primary flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowHistorySidebar(!showHistorySidebar)}
                  className="p-1 rounded hover:bg-white/10 text-primary-foreground transition-colors"
                  title="Toggle Chat History Sidebar"
                >
                  <History className="w-4 h-4" />
                </button>

                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shadow-md">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-primary-foreground text-sm flex items-center gap-1.5">
                    CodeNex AI Assistant
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-primary-foreground/80">Coding • DSA • Aptitude • Interview Prep</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-primary-foreground">
                <button
                  onClick={handleExportChat}
                  className="p-1.5 rounded hover:bg-white/10 transition-colors"
                  title="Export Chat (.md)"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded hover:bg-white/10 transition-colors"
                  title={isExpanded ? "Minimize Window" : "Maximize Window"}
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded hover:bg-white/10 transition-colors"
                  title="Close Assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* BODY CONTAINER: SIDEBAR + CHAT VIEW */}
            <div className="flex-1 flex overflow-hidden relative">
              {/* CHAT HISTORY DRAWER / SIDEBAR */}
              <AnimatePresence>
                {showHistorySidebar && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 240, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="border-r border-border/50 bg-black/60 flex flex-col justify-between overflow-hidden flex-shrink-0 z-10"
                  >
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">Conversations</span>
                        <button
                          onClick={handleNewChat}
                          className="text-[11px] px-2.5 py-1 rounded-lg gradient-primary text-primary-foreground gap-1 flex items-center"
                        >
                          <Plus className="w-3 h-3" /> New
                        </button>
                      </div>

                      {/* Search */}
                      <div className="relative">
                        <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-muted-foreground" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search history..."
                          className="w-full bg-muted/40 rounded-lg pl-7 pr-2 py-1.5 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-2 space-y-1">
                      {filteredSessions.length === 0 ? (
                        <div className="text-center py-6 text-[11px] text-muted-foreground">
                          No history found.
                        </div>
                      ) : (
                        filteredSessions.map((s) => {
                          const isActive = (s.id || s._id) === currentSessionId;
                          return (
                            <div
                              key={s.id || s._id}
                              onClick={() => loadSession(s.id || s._id)}
                              className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-all ${
                                isActive
                                  ? "bg-primary/20 text-foreground border border-primary/30 font-semibold"
                                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                              }`}
                            >
                              <span className="truncate text-[11px]">{s.title || "Conversation"}</span>
                              <button
                                onClick={(e) => handleDeleteSession(s.id || s._id, e)}
                                className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-opacity p-0.5"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="p-2 border-t border-border/40 text-[10px] text-muted-foreground text-center">
                      CodeNex AI History
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* MESSAGES & CHAT FEED */}
              <div className="flex-1 flex flex-col overflow-hidden bg-card/10">
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
                  {(messages || []).map((msg, idx) => {
                    if (!msg) return null;
                    return (
                      <motion.div
                        key={msg.id || idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.role === "assistant" && (
                          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 shadow-md">
                            <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                          </div>
                        )}

                        <div
                          className={`max-w-[86%] rounded-xl p-3 text-xs leading-relaxed space-y-1.5 relative group ${
                            msg.role === "user"
                              ? "gradient-primary text-primary-foreground rounded-br-none shadow-md"
                              : "bg-black/60 border border-white/10 text-foreground rounded-bl-none shadow-sm"
                          }`}
                        >
                          {/* Attachments list */}
                          {msg.attachments && Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1.5 border-b border-white/10 pb-1.5">
                              {msg.attachments.map((att, aIdx) => (
                                <span key={aIdx} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-black/40 border border-white/10 text-neon-cyan">
                                  <FileCode className="w-3 h-3" /> {att.fileName}
                                </span>
                              ))}
                            </div>
                          )}

                          {msg.role === "user" ? (
                            <div className="whitespace-pre-wrap font-sans text-xs">{msg.content}</div>
                          ) : msg.isStreaming ? (
                            <div>
                              <MarkdownViewer content={typingText} />
                              <span className="inline-block w-1.5 h-3.5 bg-neon-cyan animate-pulse ml-1" />
                            </div>
                          ) : (
                            <div>
                              <MarkdownViewer content={msg.content} />
                              <div className="mt-2 pt-1.5 border-t border-white/10 flex justify-end">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(msg.content);
                                    setCopiedMsgId(msg.id || `${idx}`);
                                    toast.success("Response copied!");
                                    setTimeout(() => setCopiedMsgId(null), 2000);
                                  }}
                                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded bg-white/5"
                                >
                                  {copiedMsgId === (msg.id || `${idx}`) ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                  {copiedMsgId === (msg.id || `${idx}`) ? "Copied" : "Copy Response"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Thinking Indicator */}
                  {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs text-muted-foreground p-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> CodeNex AI is thinking...
                    </motion.div>
                  )}

                  <div ref={endRef} />
                </div>

                {/* SUGGESTED PROMPTS */}
                {(!messages || messages.length <= 2) && (
                  <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                    {getCurrentProblemContext() ? (
                      <>
                        <button
                          onClick={() => send("Give me a hint for this problem")}
                          className="text-[10px] px-2.5 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20 transition-colors"
                        >
                          💡 Get a Hint
                        </button>
                        <button
                          onClick={() => send("Explain the dry run walkthrough")}
                          className="text-[10px] px-2.5 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors"
                        >
                          🔄 Dry Run
                        </button>
                        <button
                          onClick={() => send("What is the optimal complexity?")}
                          className="text-[10px] px-2.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                        >
                          ⏱️ Complexity
                        </button>
                      </>
                    ) : (
                      quickPrompts.map((qp, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => send(qp.prompt)}
                          className="text-[10px] px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                        >
                          {qp.label}
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* ATTACHMENTS PREVIEW BAR */}
                {attachments && attachments.length > 0 && (
                  <div className="px-3 py-1.5 border-t border-border/40 bg-black/40 flex flex-wrap gap-1.5">
                    {attachments.map((att, idx) => (
                      <span key={idx} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
                        <FileText className="w-3 h-3" />
                        {att.fileName}
                        <X onClick={() => setAttachments((prev) => (prev || []).filter((_, i) => i !== idx))} className="w-3 h-3 cursor-pointer hover:text-rose-400" />
                      </span>
                    ))}
                  </div>
                )}

                {/* INPUT BAR */}
                <div className="p-3 border-t border-border/50 bg-black/40 flex items-center gap-2 flex-shrink-0">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.json,.md,.html,.css" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-muted-foreground hover:text-foreground flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors"
                    title="Attach file for analysis"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={toggleSpeechInput}
                    className={`flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors ${recording ? "text-rose-400 animate-pulse" : "text-muted-foreground hover:text-foreground"}`}
                    title="Voice input"
                  >
                    {recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Ask CodeNex AI any doubt or attach files..."
                    className="flex-1 bg-muted/40 rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary border border-border/40"
                  />

                  <button
                    onClick={() => send()}
                    disabled={loading || (!input.trim() && (!attachments || attachments.length === 0))}
                    className="gradient-primary text-primary-foreground rounded-xl px-3.5 h-8 flex-shrink-0 gap-1 flex items-center disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const AIChatButton = () => {
  return (
    <ChatErrorBoundary>
      <AIChatContent />
    </ChatErrorBoundary>
  );
};

export default AIChatButton;
