import React, { useState, useEffect } from "react";
import {
  Video, FileText, CheckSquare, Award, Play, CheckCircle2, ChevronRight,
  Lock, Download, FileCode, ExternalLink, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/services/api";
import { useUser } from "@/contexts/UserContext";

export interface PDFResource {
  title: string;
  fileUrl: string;
}

export interface WorkspaceLesson {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  duration: string;
  videoType: "cloudinary" | "youtube";
  videoUrl: string;
  pdfs: PDFResource[];
  notes?: string;
  isFreePreview: boolean;
  isCompleted?: boolean;
}

export interface WorkspaceModule {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  lessons: WorkspaceLesson[];
}

export interface WorkspaceCourse {
  id: string;
  title: string;
  instructor: string;
  progress: number | null;
  isEnrolled: boolean;
  modules: WorkspaceModule[];
  completedLessons?: string[];
  isCompleted?: boolean;
  certificateId?: string;
}

interface CourseLearningWorkspaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: WorkspaceCourse | null;
  onProgressUpdated?: (newProgress: number, completedLessons: string[]) => void;
}

export const CourseLearningWorkspace: React.FC<CourseLearningWorkspaceProps> = ({
  open,
  onOpenChange,
  course,
  onProgressUpdated,
}) => {
  const { user, setUser } = useUser();
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>(
    course?.completedLessons || []
  );
  const [currentProgress, setCurrentProgress] = useState<number>(
    course?.progress || 0
  );
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  useEffect(() => {
    if (course) {
      setCompletedLessons(course.completedLessons || []);
      const prog = typeof course.progress === "number" && !isNaN(course.progress) ? course.progress : 0;
      setCurrentProgress(prog);
    }
  }, [course]);

  if (!course) return null;

  // Flatten modules to get current active lesson
  const currentModule = course.modules[activeModuleIndex] || course.modules[0];
  const currentLesson = currentModule?.lessons[activeLessonIndex] || currentModule?.lessons[0];

  // Helper to check YouTube URL or ID
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("youtube.com/embed/")) return url;
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (url.includes("v=")) {
      const id = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    return `https://www.youtube.com/embed/${url}?autoplay=1`;
  };

  const handleToggleLesson = async (lessonId: string) => {
    if (!course.isEnrolled && user?.role !== "admin") {
      toast.error("Please enroll in this course to track your progress");
      return;
    }

    const isAlreadyCompleted = completedLessons.includes(lessonId);
    const nextCompleted = isAlreadyCompleted
      ? completedLessons.filter((id) => id !== lessonId)
      : [...completedLessons, lessonId];

    setCompletedLessons(nextCompleted);
    setIsUpdatingProgress(true);

    try {
      const res = await api.put(`/course-management/${course.id}/lesson-progress`, {
        lessonId,
        isCompleted: !isAlreadyCompleted,
      });

      if (res.data.success) {
        const newProg = res.data.progress;
        setCurrentProgress(newProg);
        if (res.data.user) setUser(res.data.user);
        if (onProgressUpdated) onProgressUpdated(newProg, nextCompleted);

        if (res.data.certUnlocked || newProg === 100) {
          toast.success("🎓 Congratulations! Course 100% completed! Certificate unlocked!");
        } else if (!isAlreadyCompleted) {
          toast.success("Lesson completed! Progress updated.");
        }
      }
    } catch (err: any) {
      console.error("Failed to update lesson progress:", err);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[88vh] p-0 bg-background/95 border-border overflow-hidden flex flex-col text-foreground">
        {/* Header Bar */}
        <div className="p-4 border-b border-border/60 flex items-center justify-between bg-card/50">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              {course.title}
              {!course.isEnrolled && (
                <Badge className="bg-neon-yellow/20 text-neon-yellow border-neon-yellow/30 text-[10px]">
                  Preview Mode
                </Badge>
              )}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Instructor: {course.instructor} · {currentProgress}% Completed
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 hidden sm:block">
              <Progress value={currentProgress} className="h-2" />
            </div>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content (Left) */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-border/50">
            <Tabs defaultValue="video" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="bg-card border-b border-border/50 rounded-none justify-start px-4 h-11">
                <TabsTrigger value="video" className="text-xs gap-1.5">
                  <Video className="w-3.5 h-3.5" /> Video Lesson
                </TabsTrigger>
                <TabsTrigger value="notes" className="text-xs gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Notes & Resources ({currentLesson?.pdfs?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="assignments" className="text-xs gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5" /> Assignment
                </TabsTrigger>
                <TabsTrigger value="certificate" className="text-xs gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Certificate
                </TabsTrigger>
              </TabsList>

              {/* VIDEO TAB */}
              <TabsContent value="video" className="flex-1 flex flex-col overflow-hidden p-4 space-y-4">
                {currentLesson ? (
                  <>
                    <div className="aspect-video w-full rounded-xl bg-black border border-border flex items-center justify-center relative overflow-hidden shadow-xl">
                      {currentLesson.videoType === "cloudinary" && currentLesson.videoUrl ? (
                        <video
                          src={currentLesson.videoUrl}
                          controls
                          autoPlay
                          className="w-full h-full object-contain"
                        />
                      ) : currentLesson.videoUrl ? (
                        <iframe
                          src={getYouTubeEmbedUrl(currentLesson.videoUrl)}
                          title={currentLesson.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground p-6 text-center space-y-2">
                          <Play className="w-12 h-12 text-muted-foreground/50" />
                          <p className="text-sm font-medium">Video Content Preview</p>
                          <p className="text-xs text-muted-foreground max-w-sm">
                            {course.isEnrolled
                              ? "No video URL set for this lesson yet."
                              : "This lesson requires course enrollment."}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Lesson Action Footer */}
                    <div className="p-3 bg-muted/20 border border-border/50 rounded-lg flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-foreground">{currentLesson.title}</h4>
                        <p className="text-[11px] text-muted-foreground">{currentLesson.duration} · {currentLesson.description || "Master key concepts in this lesson"}</p>
                      </div>
                      <Button
                        size="sm"
                        disabled={isUpdatingProgress}
                        onClick={() => handleToggleLesson(currentLesson.id || currentLesson._id || "")}
                        className={
                          completedLessons.includes(currentLesson.id || currentLesson._id || "")
                            ? "bg-neon-green/10 text-neon-green border border-neon-green/30 hover:bg-neon-green/20"
                            : "gradient-primary text-primary-foreground"
                        }
                      >
                        {completedLessons.includes(currentLesson.id || currentLesson._id || "")
                          ? "✓ Completed"
                          : "Mark Complete"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Select a lesson from the module sidebar to start learning.
                  </div>
                )}
              </TabsContent>

              {/* NOTES & RESOURCES TAB */}
              <TabsContent value="notes" className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentLesson?.notes && (
                  <div className="p-4 rounded-xl border border-border/60 bg-card/40 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Lesson Notes</h4>
                    <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                      {currentLesson.notes}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Attached Learning PDFs & Resources</h4>
                  {currentLesson?.pdfs && currentLesson.pdfs.length > 0 ? (
                    <div className="grid gap-3">
                      {currentLesson.pdfs.map((pdf, idx) => (
                        <div key={idx} className="p-3 rounded-lg border border-border bg-card/30 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-xs font-medium text-foreground">{pdf.title}</p>
                              <p className="text-[10px] text-muted-foreground">PDF Document</p>
                            </div>
                          </div>
                          <a href={pdf.fileUrl} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="outline" className="text-xs gap-1.5">
                              <Download className="w-3.5 h-3.5" /> Open / Download
                            </Button>
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No downloadable PDFs for this lesson.</p>
                  )}
                </div>
              </TabsContent>

              {/* ASSIGNMENT TAB */}
              <TabsContent value="assignments" className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="p-4 rounded-xl border border-border bg-card/30 space-y-3">
                  <Badge className="bg-neon-orange/20 text-neon-orange border-neon-orange/30">Practice Task</Badge>
                  <h4 className="text-xs font-semibold">Hands-on Code & Knowledge Test</h4>
                  <p className="text-xs text-muted-foreground">
                    Apply the concepts covered in {currentLesson?.title || "this chapter"}. Implement the solution and mark the lesson as finished.
                  </p>
                </div>
              </TabsContent>

              {/* CERTIFICATE TAB */}
              <TabsContent value="certificate" className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center space-y-4">
                {currentProgress === 100 ? (
                  <div className="text-center p-6 border border-neon-green/30 bg-neon-green/5 rounded-2xl max-w-md space-y-4">
                    <Award className="w-16 h-16 text-neon-green mx-auto animate-bounce" />
                    <h3 className="text-base font-bold text-foreground">Course Completion Certificate 🎓</h3>
                    <p className="text-xs text-muted-foreground">
                      Congratulations! You have completed 100% of the lessons in {course.title}.
                    </p>
                    <div className="p-4 border border-dashed border-border rounded-lg font-mono text-[11px] text-muted-foreground">
                      Certificate ID: {course.certificateId || `CNX-${course.id.substring(0, 6).toUpperCase()}`}
                      <br />
                      Issued to: {user?.name || user?.fullName || "Student"}
                    </div>
                    <Button onClick={() => toast.success("Downloading Certificate PDF...")} className="w-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-1.5">
                      <Download className="w-4 h-4" /> Download Official Certificate
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-6 border border-border bg-card/20 rounded-2xl max-w-sm space-y-4">
                    <Lock className="w-12 h-12 text-muted-foreground mx-auto" />
                    <h3 className="text-xs font-bold">Certification Locked</h3>
                    <p className="text-xs text-muted-foreground">
                      Complete all lessons in the course playlist to unlock your verified certificate.
                    </p>
                    <Progress value={currentProgress} className="h-1.5" />
                    <span className="text-xs text-neon-cyan font-mono">{currentProgress}% Completed</span>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Module & Playlist Sidebar (Right) */}
          <div className="w-80 bg-card/30 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-border/50 flex items-center justify-between">
              <p className="text-xs font-bold text-foreground">Course Playlist</p>
              <span className="text-[10px] text-muted-foreground">{course.modules?.length || 0} Modules</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <Accordion type="single" collapsible defaultValue="module-0" className="space-y-2">
                {(course.modules || []).map((mod, modIdx) => (
                  <AccordionItem key={modIdx} value={`module-${modIdx}`} className="border border-border/50 rounded-lg px-2 bg-background/40">
                    <AccordionTrigger className="text-xs font-semibold py-2.5 hover:no-underline">
                      <span className="text-left line-clamp-1">{mod.title}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-2 space-y-1">
                      {mod.lessons.map((les, lesIdx) => {
                        const isActive = activeModuleIndex === modIdx && activeLessonIndex === lesIdx;
                        const isDone = completedLessons.includes(les.id || les._id || "");
                        return (
                          <div
                            key={lesIdx}
                            onClick={() => {
                              setActiveModuleIndex(modIdx);
                              setActiveLessonIndex(lesIdx);
                            }}
                            className={`p-2 rounded-lg flex items-center justify-between cursor-pointer text-left transition-colors ${
                              isActive
                                ? "bg-primary/15 border border-primary/40 text-foreground"
                                : "hover:bg-muted/20 text-muted-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-neon-green flex-shrink-0" />
                              ) : (
                                <Play className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                              )}
                              <span className="text-[11px] font-medium truncate">{les.title}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono ml-2 flex-shrink-0">
                              {les.duration}
                            </span>
                          </div>
                        );
                      })}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseLearningWorkspace;
