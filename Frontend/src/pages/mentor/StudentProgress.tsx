import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, Award, Search, ChevronRight, BookOpen, Code2, Brain } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import api from "@/services/api";

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  course: string;
  progress: number;
  coding: number;
  aptitude: number;
  streak: number;
  badge: string;
  status: string;
}

const StudentProgress = () => {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const res = await api.get("/mentor/students");
      if (res.data.success) {
        const mapped = res.data.students.map((s: any) => ({
          id: s.id || s._id,
          name: s.name,
          email: s.email,
          avatar: s.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
          course: "Placement Prep Program",
          progress: 80, // default placeholder progress
          coding: s.problemsSolved || 0,
          aptitude: s.points || 0,
          streak: s.streak || 0,
          badge: s.problemsSolved > 50 ? "Top Performer" : s.problemsSolved > 10 ? "Consistent" : "Scholar",
          status: "active",
        }));
        setStudents(mapped);
        if (mapped.length > 0) {
          setSelectedStudent(mapped[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const selected = students.find(s => s.id === selectedStudent);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Student Progress</h1>
        <p className="text-muted-foreground text-sm mt-1">Track and support your students' learning journey</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Students", value: String(students.length), icon: Users, color: "text-secondary" },
          { label: "At Risk", value: String(students.filter(s => s.coding < 5).length), icon: TrendingUp, color: "text-accent" },
          { label: "Top Performers", value: String(students.filter(s => s.coding > 20).length), icon: Award, color: "text-primary" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <GlassCard className="p-4 text-center">
              <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-muted/30 border-border/50 text-foreground" />
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading students...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No students found.</div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-3">
            {filtered.map((student, i) => (
              <motion.div key={student.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedStudent(student.id)}
                className={`cursor-pointer transition-all ${selectedStudent === student.id ? 'ring-1 ring-primary/50' : ''}`}>
                <GlassCard className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold gradient-primary text-primary-foreground">
                      {student.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground truncate">{student.name}</h3>
                        <Badge variant="outline" className="text-[10px] border-secondary/50 text-secondary">
                          {student.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-foreground">{student.progress}%</p>
                      <Progress value={student.progress} className="w-20 h-1.5 mt-1" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <GlassCard className="p-5 sticky top-6">
                  <div className="text-center mb-5">
                    <div className="w-16 h-16 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-3">
                      {selected.avatar}
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{selected.name}</h3>
                    <p className="text-sm text-muted-foreground">{selected.email}</p>
                    <Badge className="mt-2 bg-primary/20 text-primary border-primary/30">{selected.badge}</Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Overall Progress</span>
                        <span className="text-foreground font-semibold">{selected.progress}%</span>
                      </div>
                      <Progress value={selected.progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
                        <Code2 className="w-5 h-5 mx-auto mb-1 text-secondary" />
                        <p className="text-lg font-bold text-foreground">{selected.coding}</p>
                        <p className="text-[10px] text-muted-foreground">Coding Solved</p>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
                        <Brain className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <p className="text-lg font-bold text-foreground">{selected.aptitude}</p>
                        <p className="text-[10px] text-muted-foreground">Aptitude Points</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <div className="h-40 flex items-center justify-center text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                Select a student to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProgress;
