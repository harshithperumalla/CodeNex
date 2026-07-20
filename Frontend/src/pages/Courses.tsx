import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen, Play, Star, Sparkles, CheckCircle2, UserCheck, Layers, Award
} from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { useUser } from "@/contexts/UserContext";
import CourseLearningWorkspace, { WorkspaceCourse } from "@/components/course/CourseLearningWorkspace";

interface PublicCourse {
  id: string;
  _id?: string;
  title: string;
  instructor: string;
  description?: string;
  courseType?: "FREE" | "PAID";
  price?: number;
  rating: number;
  students: number;
  tag: string;
  category: string;
  thumbnail?: string;
  duration?: string;
  lessonsCount?: number;
  modulesCount?: number;
  isEnrolled: boolean;
  progress: number | null;
  completedLessons?: string[];
}

const tagColors: Record<string, string> = {
  Popular: "bg-neon-purple/20 text-neon-purple border-neon-purple/30",
  New: "bg-neon-green/20 text-neon-green border-neon-green/30",
  Enrolled: "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30",
  Trending: "bg-neon-orange/20 text-neon-orange border-neon-orange/30",
  "Best Seller": "bg-neon-yellow/20 text-neon-yellow border-neon-yellow/30",
};

const Courses = () => {
  const { user, setUser } = useUser();
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [workspaceCourse, setWorkspaceCourse] = useState<WorkspaceCourse | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/course-management/public");
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

  // 1-Click Free Enrollment Handler
  const handleEnrollNow = async (course: PublicCourse) => {
    setEnrollingCourseId(course.id);
    try {
      const res = await api.post(`/course-management/${course.id}/enroll`);
      if (res.data.success) {
        toast.success(res.data.message || `🎉 Successfully enrolled in ${course.title}!`);
        await fetchCourses();
        openCourseWorkspace(course.id);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to enroll in course");
    } finally {
      setEnrollingCourseId(null);
    }
  };

  // Open Course Learning Workspace
  const openCourseWorkspace = async (courseId: string) => {
    try {
      const res = await api.get(`/course-management/details/${courseId}`);
      if (res.data.success) {
        const fullCourse = res.data.course;
        setWorkspaceCourse({
          id: fullCourse.id,
          title: fullCourse.title,
          instructor: fullCourse.instructor,
          progress: fullCourse.progress || 0,
          isEnrolled: fullCourse.isEnrolled,
          modules: fullCourse.modules || [],
          completedLessons: fullCourse.completedLessons || [],
          isCompleted: fullCourse.isCompleted,
          certificateId: fullCourse.certificateId,
        });
        setWorkspaceOpen(true);
      }
    } catch (err) {
      console.error("Failed to load course details:", err);
      toast.error("Could not load course lessons");
    }
  };

  const filteredCourses = courses.filter((c) => {
    if (selectedCategory === "All") return true;
    if (selectedCategory === "My Learning") return c.isEnrolled;
    return c.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold gradient-text">Video Courses</h1>
          <p className="text-sm text-muted-foreground">
            Free high-quality learning, placement modules, and verified certificates
          </p>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-auto">
          <TabsList className="bg-card border border-border/50 text-xs flex-wrap">
            {["All", "My Learning", "Coding", "Aptitude", "English", "Frontend", "Backend"].map((cat) => (
              <TabsTrigger key={cat} value={cat} className="text-xs px-3 py-1">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading video courses...</div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl text-muted-foreground text-sm">
          {selectedCategory === "My Learning"
            ? "You haven't enrolled in any courses yet. Browse all courses and click 'Enroll Now' to start learning!"
            : "No courses available in this category yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((c, i) => (
            <GlassCard key={c.id} delay={i * 0.08} className="p-5 hover:border-primary/40 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${tagColors[c.tag] || "bg-muted border border-border text-muted-foreground"}`}>
                    {c.isEnrolled ? "Enrolled" : c.tag}
                  </span>
                  <span className="text-xs text-neon-yellow flex items-center gap-1 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-neon-yellow text-neon-yellow" /> {c.rating || 4.5}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-2xl flex-shrink-0 shadow-md">
                    {c.thumbnail || "💻"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm line-clamp-1">{c.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      by {c.instructor} · {c.students.toLocaleString()} students
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground/80 mt-3 line-clamp-2">
                  {c.description || "Interactive video course with hands-on practice, PDF notes, and certificate."}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40">
                {c.isEnrolled ? (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs text-neon-cyan font-medium font-mono">
                          {typeof c.progress === "number" && !isNaN(c.progress) ? Math.min(100, Math.max(0, Math.round(c.progress))) : 0}%
                        </span>
                      </div>
                      <Progress value={c.progress ?? 0} className="h-1.5" />
                    </div>
                    <Button
                      onClick={() => openCourseWorkspace(c.id)}
                      className="w-full text-xs py-1.5 gradient-primary text-primary-foreground gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" /> Resume Learning
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-xs px-2.5 py-0.5 font-bold">
                        FREE
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">100% Free Access</span>
                    </div>
                    <Button
                      disabled={enrollingCourseId === c.id}
                      onClick={() => handleEnrollNow(c)}
                      className="text-xs px-4 py-1.5 gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {enrollingCourseId === c.id ? "Enrolling..." : "Enroll Now"}
                    </Button>
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Learning Workspace Modal */}
      <CourseLearningWorkspace
        open={workspaceOpen}
        onOpenChange={setWorkspaceOpen}
        course={workspaceCourse}
        onProgressUpdated={(newProg) => {
          if (workspaceCourse) {
            setWorkspaceCourse({ ...workspaceCourse, progress: newProg });
            setCourses((prev) =>
              prev.map((c) => (c.id === workspaceCourse.id ? { ...c, progress: newProg } : c))
            );
          }
        }}
      />
    </div>
  );
};

export default Courses;
