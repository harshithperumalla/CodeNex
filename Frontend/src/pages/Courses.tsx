import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Video, FileText, CheckSquare, Award, Play, CheckCircle2, ChevronRight, Lock, Download, FileCode, Users, Star, IndianRupee
} from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { useUser } from "@/contexts/UserContext";

interface Course {
  id: string;
  title: string;
  instructor: string;
  price: string;
  rating: number;
  students: number;
  progress: number | null;
  tag: string;
  description?: string;
  category?: string;
  lessons?: number;
  duration?: string;
}

const tagColors: Record<string, string> = {
  Popular: "bg-neon-purple/20 text-neon-purple border-neon-purple/30",
  New: "bg-neon-green/20 text-neon-green border-neon-green/30",
  Enrolled: "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30",
  Trending: "bg-neon-orange/20 text-neon-orange border-neon-orange/30",
  "Best Seller": "bg-neon-yellow/20 text-neon-yellow border-neon-yellow/30",
};

const getLecturesForCourse = (title: string) => {
  if (title.includes("React")) {
    return [
      { id: 1, title: "1. Welcome & React Core Concepts", duration: "15:20" },
      { id: 2, title: "2. State, Props & Unidirectional Data Flow", duration: "24:10" },
      { id: 3, title: "3. Mastering useEffect and Lifecycle Hooks", duration: "22:45" },
      { id: 4, title: "4. Custom Hook Development Patterns", duration: "18:30" },
      { id: 5, title: "5. State Management: Context API & Redux", duration: "32:15" },
      { id: 6, title: "6. Performance: React.memo & useMemo", duration: "20:05" },
    ];
  }
  if (title.includes("Node") || title.includes("Backend")) {
    return [
      { id: 1, title: "1. Node.js Event Loop Explained", duration: "18:40" },
      { id: 2, title: "2. HTTP Module & Express Routing Basics", duration: "21:15" },
      { id: 3, title: "3. Custom Middleware Creation Patterns", duration: "19:50" },
      { id: 4, title: "4. Database Integration with Mongoose", duration: "28:30" },
      { id: 5, title: "5. Designing Secure JWT Authentication", duration: "25:40" },
      { id: 6, title: "6. Deploying backend to Render/AWS", duration: "22:10" },
    ];
  }
  if (title.includes("DSA") || title.includes("Java")) {
    return [
      { id: 1, title: "1. Time & Space Complexity Analysis", duration: "20:30" },
      { id: 2, title: "2. Linked List Operations (Singly & Doubly)", duration: "25:40" },
      { id: 3, title: "3. Stacks & Queues Standard Implementation", duration: "18:15" },
      { id: 4, title: "4. Binary Trees Traversal Techniques", duration: "29:50" },
      { id: 5, title: "5. Graphs representation: DFS & BFS", duration: "34:20" },
      { id: 6, title: "6. Dynamic Programming Tabulation Secrets", duration: "42:15" },
    ];
  }
  return [
    { id: 1, title: "1. Introduction & Development Setup", duration: "12:10" },
    { id: 2, title: "2. Core Language Basics & Syntax", duration: "18:45" },
    { id: 3, title: "3. Intermediate Logic & Operators", duration: "22:30" },
    { id: 4, title: "4. Building Your First Console Project", duration: "25:15" },
    { id: 5, title: "5. Production Deployment Patterns", duration: "20:00" },
  ];
};

const Courses = () => {
  const { user, setUser } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollIn, setEnrollIn] = useState<Course | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const [workspaceCourse, setWorkspaceCourse] = useState<Course | null>(null);
  const [activeLecture, setActiveLecture] = useState<number>(0);
  const [completedLectures, setCompletedLectures] = useState<number[]>([]);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/course");
      if (res.data.success) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      console.error("Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollIn) return;
    try {
      const res = await api.post(`/course/${enrollIn.id}/enroll`);
      if (res.data.success) {
        toast.success(`🎉 Enrolled in ${enrollIn.title}!`);
        setEnrollIn(null);
        setForm({ name: "", email: "", phone: "" });
        fetchCourses();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to enroll in course");
    }
  };

  const openLearningWorkspace = (course: Course) => {
    setWorkspaceCourse(course);
    const lectures = getLecturesForCourse(course.title);
    const progressPercent = course.progress ?? 0;
    const itemsCount = Math.round((progressPercent / 100) * lectures.length);
    const list: number[] = [];
    for (let i = 1; i <= itemsCount; i++) list.push(i);
    setCompletedLectures(list);
    setActiveLecture(0);
  };

  const toggleLectureCompletion = async (lectureId: number) => {
    if (!workspaceCourse) return;
    let next: number[];
    if (completedLectures.includes(lectureId)) {
      next = completedLectures.filter(id => id !== lectureId);
    } else {
      next = [...completedLectures, lectureId];
    }
    setCompletedLectures(next);

    const totalLectures = getLecturesForCourse(workspaceCourse.title).length;
    const progress = Math.round((next.length / totalLectures) * 100);

    try {
      const res = await api.put(`/course/${workspaceCourse.id}/progress`, { progress });
      if (res.data.success) {
        if (res.data.user) {
          setUser(res.data.user);
        }
        setCourses(prev => prev.map(c => c.id === workspaceCourse.id ? { ...c, progress } : c));
        setWorkspaceCourse(prev => prev ? { ...prev, progress } : null);

        if (progress === 100) {
          toast.success("🏆 Course completed! Certificate unlocked!");
        }
      }
    } catch (err) {
      console.error("Failed to update course progress:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Video Courses</h1>
          <p className="text-sm text-muted-foreground">Master key technologies and clear placements</p>
        </div>
      </motion.div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading courses...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c, i) => (
            <GlassCard key={c.id} delay={i * 0.08} className="p-5 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${tagColors[c.tag] || 'bg-muted border border-border text-muted-foreground'}`}>{c.tag}</span>
                <span className="text-xs text-neon-yellow flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-neon-yellow text-neon-yellow" /> {c.rating}</span>
              </div>
              <h3 className="font-semibold text-foreground line-clamp-1">{c.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">by {c.instructor} · {c.students.toLocaleString()} students</p>
              
              {c.progress !== null ? (
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground">Progress</span>
                      <span className="text-xs text-neon-cyan font-medium">{c.progress}%</span>
                    </div>
                    <Progress value={c.progress} className="h-1.5" />
                  </div>
                  <Button onClick={() => openLearningWorkspace(c)} className="w-full text-xs py-1.5 gradient-primary text-primary-foreground gap-1.5">
                    <Play className="w-3.5 h-3.5" /> Resume Course
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg font-bold text-foreground">{c.price}</span>
                  <button
                    onClick={() => setEnrollIn(c)}
                    className="px-4 py-1.5 text-xs rounded-lg gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                  >
                    Enroll Now
                  </button>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      {/* Enroll Form Dialog */}
      <Dialog open={!!enrollIn} onOpenChange={(o) => !o && setEnrollIn(null)}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10 max-w-md text-foreground">
          <DialogHeader>
            <DialogTitle className="gradient-text">Enroll in {enrollIn?.title}</DialogTitle>
            <DialogDescription>Confirm your info to enroll instantly.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEnroll} className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Aarav Sharma" className="mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="mt-1" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" className="mt-1" />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground">
              Confirm Enrollment
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Main Course Learning Workspace */}
      <Dialog open={!!workspaceCourse} onOpenChange={(o) => !o && setWorkspaceCourse(null)}>
        <DialogContent className="max-w-5xl h-[85vh] p-0 bg-background/95 border-border overflow-hidden flex flex-col text-foreground">
          {workspaceCourse && (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border/60 flex items-center justify-between bg-card/40">
                <div>
                  <h2 className="text-base font-bold text-foreground">{workspaceCourse.title}</h2>
                  <p className="text-[11px] text-muted-foreground">Taught by {workspaceCourse.instructor} · {workspaceCourse.progress}% Completed</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setWorkspaceCourse(null)}>Close</Button>
              </div>

              {/* Workspace Content split */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left side tabs and video player */}
                <div className="flex-1 flex flex-col overflow-hidden border-r border-border/50">
                  <Tabs defaultValue="video" className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="bg-card border-b border-border/50 rounded-none justify-start px-4 h-10">
                      <TabsTrigger value="video" className="text-xs gap-1.5"><Video className="w-3.5 h-3.5" /> Video Lectures</TabsTrigger>
                      <TabsTrigger value="notes" className="text-xs gap-1.5"><FileText className="w-3.5 h-3.5" /> PDF Notes</TabsTrigger>
                      <TabsTrigger value="assignments" className="text-xs gap-1.5"><CheckSquare className="w-3.5 h-3.5" /> Assignments</TabsTrigger>
                      <TabsTrigger value="placement" className="text-xs gap-1.5"><FileCode className="w-3.5 h-3.5" /> Interview Hub</TabsTrigger>
                      <TabsTrigger value="certificate" className="text-xs gap-1.5"><Award className="w-3.5 h-3.5" /> Certification</TabsTrigger>
                    </TabsList>

                    {/* VIDEO PLAYER TAB */}
                    <TabsContent value="video" className="flex-1 flex flex-col overflow-hidden p-4 space-y-4">
                      <div className="aspect-video w-full rounded-xl bg-black border border-border flex flex-col items-center justify-center relative overflow-hidden group shadow-lg shadow-black/40">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-75" />
                        <div className="w-14 h-14 rounded-full bg-primary/20 hover:bg-primary/30 border border-primary/50 flex items-center justify-center cursor-pointer transition-all duration-300 relative z-10 animate-pulse">
                          <Play className="w-6 h-6 text-foreground fill-foreground" />
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white z-10">
                          <span>Playing: {getLecturesForCourse(workspaceCourse.title)[activeLecture]?.title}</span>
                          <span className="font-mono text-neon-cyan">{getLecturesForCourse(workspaceCourse.title)[activeLecture]?.duration}</span>
                        </div>
                      </div>
                      <div className="p-3 bg-muted/20 border border-border/50 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold">Mark this lesson as completed</p>
                          <p className="text-[10px] text-muted-foreground">Increments your total progress percentage</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => toggleLectureCompletion(getLecturesForCourse(workspaceCourse.title)[activeLecture].id)}
                          className={completedLectures.includes(getLecturesForCourse(workspaceCourse.title)[activeLecture].id) ? "bg-neon-green/10 text-neon-green border-neon-green/30 hover:bg-neon-green/20" : "gradient-primary text-primary-foreground"}
                        >
                          {completedLectures.includes(getLecturesForCourse(workspaceCourse.title)[activeLecture].id) ? "✓ Done" : "Mark Done"}
                        </Button>
                      </div>
                    </TabsContent>

                    {/* PDF NOTES TAB */}
                    <TabsContent value="notes" className="flex-1 overflow-y-auto p-4 space-y-3">
                      <div className="grid gap-3">
                        {[
                          { name: "Full Lecture Notes.pdf", size: "4.5 MB" },
                          { name: "Interview Formula Cheat Sheet.pdf", size: "1.2 MB" },
                          { name: "Source Code Templates.zip", size: "12.8 MB" }
                        ].map((m) => (
                          <div key={m.name} className="p-3 rounded-lg border border-border bg-card/30 flex items-center justify-between hover:bg-muted/10 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded bg-primary/10 flex items-center justify-center text-primary"><FileText className="w-5 h-5" /></div>
                              <div>
                                <p className="text-xs font-medium text-foreground">{m.name}</p>
                                <p className="text-[10px] text-muted-foreground">{m.size}</p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="text-xs gap-1.5"><Download className="w-3.5 h-3.5" /> Download</Button>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    {/* ASSIGNMENTS TAB */}
                    <TabsContent value="assignments" className="flex-1 overflow-y-auto p-4 space-y-3">
                      <div className="p-4 rounded-xl border border-border bg-card/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-neon-orange/20 text-neon-orange border-neon-orange/30">Assignment 1</Badge>
                          <span className="text-[10px] text-muted-foreground">Due: In 3 days</span>
                        </div>
                        <h4 className="text-xs font-semibold">Practical Application Task</h4>
                        <p className="text-xs text-muted-foreground">Implement a secure authentication middleware using JSON Web Tokens (JWT). Make sure you parse headers correctly and handle expiry errors.</p>
                        <Button className="w-full text-xs font-semibold py-1 gradient-primary text-primary-foreground">Submit Assignment</Button>
                      </div>
                    </TabsContent>

                    {/* INTERVIEW HUB TAB */}
                    <TabsContent value="placement" className="flex-1 overflow-y-auto p-4 space-y-3">
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg border border-border/50 bg-card/20">
                          <h4 className="text-xs font-semibold text-primary">Resume Headline Tip</h4>
                          <p className="text-[11px] text-muted-foreground mt-1">"Developed robust web services using the concepts mastered in {workspaceCourse.title}, improving load speeds by 20%."</p>
                        </div>
                        <div className="p-3 rounded-lg border border-border/50 bg-card/20 space-y-2">
                          <h4 className="text-xs font-semibold text-neon-cyan">Top Interview Question</h4>
                          <p className="text-xs text-foreground font-mono">Q: Explain standard lifecycle methods and state management optimization.</p>
                          <p className="text-xs text-muted-foreground">A: Always explain re-rendering triggers, reconciliation algorithms, and component caching strategies.</p>
                        </div>
                      </div>
                    </TabsContent>

                    {/* CERTIFICATION TAB */}
                    <TabsContent value="certificate" className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center space-y-4">
                      {workspaceCourse.progress === 100 ? (
                        <div className="text-center p-6 border border-neon-green/30 bg-neon-green/5 rounded-2xl max-w-md space-y-4">
                          <Award className="w-16 h-16 text-neon-green mx-auto animate-bounce" />
                          <h3 className="text-base font-bold text-foreground">Congratulations! 🎓</h3>
                          <p className="text-xs text-muted-foreground">You have finished all chapters of this course. Your certificate of completion is generated!</p>
                          <div className="p-4 border border-dashed border-border rounded-lg font-mono text-[10px] text-muted-foreground">
                            Certificate ID: CNX-{workspaceCourse.id.substring(0,8).toUpperCase()}
                            <br />
                            Issued to: {user.name || user.fullName}
                          </div>
                          <Button className="w-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-1.5">
                            <Download className="w-4 h-4" /> Download Certificate
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center p-6 border border-border bg-card/20 rounded-2xl max-w-sm space-y-4">
                          <Lock className="w-12 h-12 text-muted-foreground mx-auto" />
                          <h3 className="text-xs font-bold">Certification Locked</h3>
                          <p className="text-xs text-muted-foreground">Complete 100% of the lessons in the playlist to generate your printable completion certificate.</p>
                          <Progress value={workspaceCourse.progress ?? 0} className="h-1.5" />
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Right side Playlist sidebar */}
                <div className="w-[30%] bg-card/20 flex flex-col overflow-hidden">
                  <div className="p-3 border-b border-border/50">
                    <p className="text-xs font-bold text-foreground">Course Syllabus</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {getLecturesForCourse(workspaceCourse.title).map((l, idx) => {
                      const isActive = idx === activeLecture;
                      const isDone = completedLectures.includes(l.id);
                      return (
                        <div
                          key={l.id}
                          onClick={() => setActiveLecture(idx)}
                          className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors text-left ${isActive ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/10'}`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-neon-green flex-shrink-0" />
                            ) : (
                              <Play className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className="text-[11px] text-foreground font-medium truncate">{l.title}</span>
                          </div>
                          <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Courses;
