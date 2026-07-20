import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Plus, Upload, Edit2, Trash2, Star, Users, Layers, UserCheck, Eye, Search
} from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/services/api";
import ModuleLessonManager, { Module } from "@/components/course/ModuleLessonManager";

interface Course {
  id: string;
  _id?: string;
  title: string;
  instructor: string;
  courseType?: "FREE" | "PAID";
  price?: number;
  students: number;
  rating: number;
  isPublished: boolean;
  thumbnail: string;
  category: string;
  description?: string;
  tag?: string;
  lessonsCount?: number;
  modulesCount?: number;
  modules?: Module[];
}

interface EnrolledStudent {
  enrollmentId: string;
  studentId: string;
  name: string;
  email: string;
  avatar?: string;
  progress: number;
  isCompleted: boolean;
  enrolledAt: string;
  completedLessonsCount: number;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } };

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [form, setForm] = useState({
    title: "",
    courseType: "FREE",
    price: "0",
    category: "Coding",
    thumbnail: "🧮",
    description: "",
    tag: "New",
  });

  const [moduleManagerOpen, setModuleManagerOpen] = useState(false);
  const [activeCourseForModules, setActiveCourseForModules] = useState<Course | null>(null);

  // Enrolled Students Modal State
  const [studentsDialogOpen, setStudentsDialogOpen] = useState(false);
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState<Course | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/course-management/admin");
      if (res.data.success) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      console.error("Failed to load admin courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setForm({ title: "", courseType: "FREE", price: "0", category: "Coding", thumbnail: "🧮", description: "", tag: "New" });
    setCreateDialogOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setForm({
      title: course.title,
      courseType: course.courseType || "FREE",
      price: (course.price || 0).toString(),
      category: course.category || "Coding",
      thumbnail: course.thumbnail || "🧮",
      description: course.description || "",
      tag: course.tag || "New",
    });
    setCreateDialogOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) {
      toast.error("Course title is required");
      return;
    }

    try {
      if (editingCourse) {
        const res = await api.put(`/course-management/${editingCourse.id}`, {
          title: form.title,
          courseType: form.courseType,
          price: Number(form.price),
          category: form.category,
          thumbnail: form.thumbnail,
          description: form.description,
          tag: form.tag,
        });
        if (res.data.success) {
          toast.success("Course updated successfully!");
          setCreateDialogOpen(false);
          fetchCourses();
        }
      } else {
        const res = await api.post("/course-management", {
          title: form.title,
          courseType: form.courseType,
          price: Number(form.price),
          category: form.category,
          thumbnail: form.thumbnail,
          description: form.description,
          tag: form.tag,
        });
        if (res.data.success) {
          toast.success("Course created! You can now add modules and lessons.");
          setCreateDialogOpen(false);
          fetchCourses();
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save course");
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const res = await api.patch(`/course-management/${id}/publish`);
      if (res.data.success) {
        toast.success(res.data.message);
        setCourses((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isPublished: res.data.isPublished } : c))
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to toggle publish status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course? All modules and student progress will be removed.")) return;
    try {
      const res = await api.delete(`/course-management/${id}`);
      if (res.data.success) {
        toast.success("Course deleted successfully");
        fetchCourses();
      }
    } catch (err) {
      toast.error("Failed to delete course");
    }
  };

  // Open Modules Manager
  const handleManageModules = (course: Course) => {
    setActiveCourseForModules(course);
    setModuleManagerOpen(true);
  };

  const handleSaveModules = async (updatedModules: Module[]) => {
    if (!activeCourseForModules) return;
    try {
      const res = await api.put(`/course-management/${activeCourseForModules.id}`, {
        modules: updatedModules,
      });
      if (res.data.success) {
        toast.success("Modules & lessons saved!");
        setActiveCourseForModules({ ...activeCourseForModules, modules: updatedModules });
        fetchCourses();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save modules");
    }
  };

  // View Enrolled Students
  const handleViewStudents = async (course: Course) => {
    setSelectedCourseForStudents(course);
    setStudentsDialogOpen(true);
    setLoadingStudents(true);
    try {
      const res = await api.get(`/course-management/${course.id}/students`);
      if (res.data.success) {
        setEnrolledStudents(res.data.students);
      }
    } catch (err) {
      console.error("Failed to fetch course students:", err);
      toast.error("Could not load enrolled students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const totalEnrollments = courses.reduce((a, c) => a + c.students, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold">
            Course <span className="gradient-text">Management</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {courses.length} courses total • {totalEnrollments.toLocaleString("en-IN")} total student enrollments
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gradient-primary text-primary-foreground gap-2">
          <Plus className="w-4 h-4" /> Create Course
        </Button>
      </motion.div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading courses...</div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {courses.map((course) => (
            <motion.div key={course.id} variants={item}>
              <GlassCard className="p-0 overflow-hidden group hover:border-primary/40 transition-all duration-300 flex flex-col h-full">
                {/* Thumbnail */}
                <div className="h-36 gradient-primary flex items-center justify-center text-5xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
                  <span className="relative z-10">{course.thumbnail || "💻"}</span>
                  <Badge
                    onClick={() => handleTogglePublish(course.id)}
                    className={`absolute top-3 right-3 z-10 cursor-pointer ${
                      course.isPublished
                        ? "bg-neon-green/20 text-neon-green border-neon-green/30"
                        : "bg-muted border-border text-muted-foreground"
                    }`}
                    variant="outline"
                  >
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground text-sm line-clamp-1">{course.title}</h3>
                      <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-[10px]">
                        {course.courseType || "FREE"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">by {course.instructor}</p>
                    <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2">
                      {course.description || "Interactive video course with hands-on practice & PDF resources."}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border/40 pt-3">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-neon-yellow" />
                      {course.rating || 4.5}
                    </span>
                    <span
                      onClick={() => handleViewStudents(course)}
                      className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
                      title="View enrolled students"
                    >
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span className="font-semibold text-foreground">{course.students}</span> Students
                    </span>
                    <span className="ml-auto text-[11px] text-neon-cyan flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {course.modules?.length || course.modulesCount || 0} Mods
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageModules(course)}
                        className="flex-1 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                      >
                        <Layers className="w-3.5 h-3.5" /> Modules & Lessons
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewStudents(course)}
                        className="text-xs gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Students
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(course)}
                        className="flex-1 text-xs gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePublish(course.id)}
                        className="flex-1 text-xs gap-1"
                      >
                        {course.isPublished ? "Unpublish" : "Publish"}
                      </Button>
                      <Button
                        onClick={() => handleDelete(course.id)}
                        variant="outline"
                        size="sm"
                        className="text-xs text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}

          {/* Create New Card */}
          <motion.div variants={item} onClick={handleOpenCreate}>
            <GlassCard className="h-full min-h-[320px] flex flex-col items-center justify-center gap-3 border-dashed border-2 border-border hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center group-hover:gradient-primary transition-all">
                <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
              </div>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Create New Course
              </p>
              <p className="text-xs text-muted-foreground text-center max-w-[200px]">
                Add course details, modules, Cloudinary videos, and PDFs
              </p>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}

      {/* Course Create / Edit Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="border-border/50 bg-card text-foreground max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
            <DialogDescription>
              Set up title, course type (FREE/PAID), category, and description.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCourse} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Course Title</Label>
              <Input
                placeholder="e.g. Fullstack React & Node.js Masterclass"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Course Type</Label>
                <Select value={form.courseType} onValueChange={(v) => setForm({ ...form, courseType: v as "FREE" | "PAID" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">FREE (Instant 1-Click Access)</SelectItem>
                    <SelectItem value="PAID">PAID (Future Paid Course)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Coding">Coding</SelectItem>
                    <SelectItem value="Aptitude">Aptitude</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Frontend">Frontend</SelectItem>
                    <SelectItem value="Backend">Backend</SelectItem>
                    <SelectItem value="Fullstack">Fullstack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Thumbnail Emoji</Label>
                <Input
                  placeholder="e.g. 🏗️, 🧮, 💻, 🚀"
                  value={form.thumbnail}
                  onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tag Badge</Label>
                <Select value={form.tag} onValueChange={(v) => setForm({ ...form, tag: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Popular">Popular</SelectItem>
                    <SelectItem value="Trending">Trending</SelectItem>
                    <SelectItem value="Best Seller">Best Seller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="Overview of what students will learn..."
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground">
              {editingCourse ? "Update Course" : "Create Course"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Module & Lesson Manager Modal */}
      {activeCourseForModules && (
        <ModuleLessonManager
          open={moduleManagerOpen}
          onOpenChange={setModuleManagerOpen}
          modules={activeCourseForModules.modules || []}
          onChange={handleSaveModules}
        />
      )}

      {/* View Enrolled Students Modal */}
      <Dialog open={studentsDialogOpen} onOpenChange={setStudentsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-card text-foreground border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              Enrolled Students for {selectedCourseForStudents?.title}
            </DialogTitle>
            <DialogDescription>
              Total {enrolledStudents.length} students enrolled in this course.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2">
            {loadingStudents ? (
              <div className="text-center py-10 text-xs text-muted-foreground">Loading enrolled students...</div>
            ) : enrolledStudents.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                No students enrolled in this course yet.
              </div>
            ) : (
              <div className="overflow-x-auto border border-border/50 rounded-xl">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase tracking-wider text-left">
                      <th className="p-3">Student</th>
                      <th className="p-3">Progress</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Enrolled On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledStudents.map((st) => (
                      <tr key={st.enrollmentId} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                              {st.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{st.name}</p>
                              <p className="text-[10px] text-muted-foreground">{st.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-neon-cyan font-medium">
                          {st.progress}%
                        </td>
                        <td className="p-3">
                          <Badge className={st.isCompleted ? "bg-neon-green/20 text-neon-green border-neon-green/30" : "bg-muted text-muted-foreground"} variant="outline">
                            {st.isCompleted ? "Completed 🎓" : "In Progress"}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(st.enrolledAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseManagement;
