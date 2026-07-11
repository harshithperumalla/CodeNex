import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Plus, Upload, Eye, Edit2, Trash2, Star, Users, IndianRupee } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/services/api";

interface Course {
  id: string;
  title: string;
  instructor: string;
  price: number;
  enrolled: number;
  rating: number;
  status: string;
  progress: number;
  thumbnail: string;
  category: string;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } };

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", price: "", category: "Coding", thumbnail: "🧮" });

  const fetchCourses = async () => {
    try {
      const res = await api.get("/course");
      if (res.data.success) {
        const mapped = res.data.courses.map((c: any) => ({
          id: c.id || c._id,
          title: c.title,
          instructor: c.instructor,
          price: c.price || 0,
          enrolled: c.students || 0,
          rating: c.rating || 4.5,
          status: c.isPublished !== false ? "published" : "draft",
          progress: 100,
          thumbnail: c.thumbnail || "🧮",
          category: c.category || "Coding",
        }));
        setCourses(mapped);
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.price) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      const res = await api.post("/course", {
        title: newCourse.title,
        price: Number(newCourse.price),
        category: newCourse.category,
        thumbnail: newCourse.thumbnail,
        instructor: "Admin",
      });
      if (res.data.success) {
        toast.success("Course created successfully!");
        setDialogOpen(false);
        setNewCourse({ title: "", price: "", category: "Coding", thumbnail: "🧮" });
        fetchCourses();
      }
    } catch (err) {
      toast.error("Failed to create course");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await api.delete(`/course/${id}`);
      if (res.data.success) {
        toast.success("Course deleted successfully");
        fetchCourses();
      }
    } catch (err) {
      toast.error("Failed to delete course");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Course <span className="gradient-text">Management</span></h1>
          <p className="text-sm text-muted-foreground">{courses.length} courses • ₹{courses.reduce((a, c) => a + c.price * c.enrolled, 0).toLocaleString('en-IN')} total revenue</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gradient-primary text-primary-foreground gap-2">
          <Plus className="w-4 h-4" /> New Course
        </Button>
      </motion.div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading courses...</div>
      ) : (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" variants={container} initial="hidden" animate="show">
          {courses.map((course) => (
            <motion.div key={course.id} variants={item}>
              <GlassCard className="p-0 overflow-hidden group hover:neon-glow-cyan transition-shadow duration-300">
                {/* Thumbnail */}
                <div className="h-36 gradient-primary flex items-center justify-center text-5xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                  <span className="relative z-10">{course.thumbnail}</span>
                  <Badge className={`absolute top-3 right-3 z-10 ${course.status === 'published' ? 'bg-neon-green/20 text-neon-green border-neon-green/30' : 'bg-muted border-border text-muted-foreground'}`} variant="outline" style={course.status === 'published' ? { color: 'hsl(145 80% 50%)' } : {}}>
                    {course.status}
                  </Badge>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">by {course.instructor}</p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-neon-yellow" style={{ color: 'hsl(45 100% 55%)' }} />{course.rating}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{course.enrolled}</span>
                    <span className="flex items-center gap-1 font-semibold text-foreground"><IndianRupee className="w-3.5 h-3.5" />{course.price}</span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" className="flex-1 text-xs gap-1"><Eye className="w-3.5 h-3.5" />View</Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs gap-1"><Edit2 className="w-3.5 h-3.5" />Edit</Button>
                    <Button onClick={() => handleDelete(course.id)} variant="outline" size="sm" className="text-xs text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}

          {/* Upload Card */}
          <motion.div variants={item} onClick={() => setDialogOpen(true)}>
            <GlassCard className="h-full min-h-[300px] flex flex-col items-center justify-center gap-3 border-dashed border-2 border-border hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center group-hover:gradient-primary transition-all">
                <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
              </div>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Upload New Course</p>
              <p className="text-xs text-muted-foreground">Drag & drop or click to browse</p>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-border/50 bg-card text-foreground">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Course Title</Label>
              <Input placeholder="e.g. Advanced System Design" value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input type="number" placeholder="e.g. 1999" value={newCourse.price} onChange={e => setNewCourse({ ...newCourse, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newCourse.category} onValueChange={v => setNewCourse({ ...newCourse, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Coding">Coding</SelectItem>
                    <SelectItem value="Aptitude">Aptitude</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Frontend">Frontend</SelectItem>
                    <SelectItem value="Backend">Backend</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Thumbnail Emoji</Label>
              <Input placeholder="e.g. 🏗️, 🧮, 💻" value={newCourse.thumbnail} onChange={e => setNewCourse({ ...newCourse, thumbnail: e.target.value })} />
            </div>
            <Button type="submit" className="w-full">Create Course</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseManagement;
