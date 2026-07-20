import React, { useState } from "react";
import { Plus, Trash2, Edit2, Upload, Video, FileText, CheckCircle, Eye, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/services/api";

export interface PDFResource {
  title: string;
  fileUrl: string;
  publicId?: string;
}

export interface Lesson {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  duration: string;
  videoType: "cloudinary" | "youtube";
  videoUrl: string;
  publicId?: string;
  pdfs: PDFResource[];
  notes?: string;
  isFreePreview: boolean;
  order: number;
}

export interface Module {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

interface ModuleLessonManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modules: Module[];
  onChange: (updatedModules: Module[]) => void;
}

export const ModuleLessonManager: React.FC<ModuleLessonManagerProps> = ({
  open,
  onOpenChange,
  modules,
  onChange,
}) => {
  const [activeModuleIndex, setActiveModuleIndex] = useState<number | null>(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDesc, setModuleDesc] = useState("");

  const [lessonForm, setLessonForm] = useState<Lesson>({
    title: "",
    description: "",
    duration: "15:00",
    videoType: "youtube",
    videoUrl: "",
    pdfs: [],
    notes: "",
    isFreePreview: false,
    order: 1,
  });

  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  // Add Module
  const handleAddModule = () => {
    if (!moduleTitle.trim()) {
      toast.error("Module title is required");
      return;
    }
    const newModule: Module = {
      title: moduleTitle,
      description: moduleDesc,
      order: modules.length + 1,
      lessons: [],
    };
    onChange([...modules, newModule]);
    setModuleTitle("");
    setModuleDesc("");
    toast.success("Module added!");
  };

  // Delete Module
  const handleDeleteModule = (modIdx: number) => {
    const updated = modules.filter((_, idx) => idx !== modIdx);
    onChange(updated);
    toast.success("Module deleted");
  };

  // Open Lesson Dialog
  const handleOpenAddLesson = (modIdx: number) => {
    setActiveModuleIndex(modIdx);
    setActiveLessonIndex(null);
    setLessonForm({
      title: "",
      description: "",
      duration: "10:00",
      videoType: "youtube",
      videoUrl: "",
      pdfs: [],
      notes: "",
      isFreePreview: false,
      order: (modules[modIdx]?.lessons?.length || 0) + 1,
    });
    setLessonDialogOpen(true);
  };

  const handleOpenEditLesson = (modIdx: number, lesIdx: number) => {
    setActiveModuleIndex(modIdx);
    setActiveLessonIndex(lesIdx);
    const lesson = modules[modIdx].lessons[lesIdx];
    setLessonForm({ ...lesson });
    setLessonDialogOpen(true);
  };

  // Delete Lesson
  const handleDeleteLesson = (modIdx: number, lesIdx: number) => {
    const updated = [...modules];
    updated[modIdx].lessons = updated[modIdx].lessons.filter((_, i) => i !== lesIdx);
    onChange(updated);
    toast.success("Lesson deleted");
  };

  // Cloudinary Video Upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setLessonForm((prev) => ({
          ...prev,
          videoType: "cloudinary",
          videoUrl: res.data.url,
          publicId: res.data.publicId,
        }));
        toast.success("Video uploaded to Cloudinary successfully!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload video");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Cloudinary PDF Upload
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPdf(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        const newPdf: PDFResource = {
          title: file.name,
          fileUrl: res.data.url,
          publicId: res.data.publicId,
        };
        setLessonForm((prev) => ({
          ...prev,
          pdfs: [...prev.pdfs, newPdf],
        }));
        toast.success("PDF uploaded successfully!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload PDF");
    } finally {
      setIsUploadingPdf(false);
    }
  };

  // Save Lesson
  const handleSaveLesson = () => {
    if (!lessonForm.title.trim()) {
      toast.error("Lesson title is required");
      return;
    }
    if (activeModuleIndex === null) return;

    const updatedModules = [...modules];
    const targetModule = { ...updatedModules[activeModuleIndex] };
    const lessons = [...(targetModule.lessons || [])];

    if (activeLessonIndex !== null) {
      lessons[activeLessonIndex] = lessonForm;
    } else {
      lessons.push(lessonForm);
    }

    targetModule.lessons = lessons;
    updatedModules[activeModuleIndex] = targetModule;
    onChange(updatedModules);

    setLessonDialogOpen(false);
    toast.success(activeLessonIndex !== null ? "Lesson updated!" : "Lesson added!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-card text-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold gradient-text">
            Manage Course Modules & Lessons
          </DialogTitle>
          <DialogDescription>
            Organize modules, upload videos (Cloudinary) or add YouTube links, add PDF notes and resources.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 my-4">
          {/* Add Module Form */}
          <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add New Module</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Module Title (e.g. Module 1: Foundations)"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                className="md:col-span-2"
              />
              <Button onClick={handleAddModule} className="gradient-primary text-primary-foreground gap-2">
                <Plus className="w-4 h-4" /> Add Module
              </Button>
            </div>
          </div>

          {/* List of Modules */}
          <div className="space-y-4">
            {modules.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border rounded-xl text-muted-foreground text-sm">
                No modules added yet. Add your first module above.
              </div>
            ) : (
              modules.map((mod, modIdx) => (
                <div key={modIdx} className="border border-border/70 rounded-xl p-4 bg-card/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          Module {modIdx + 1}
                        </Badge>
                        {mod.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {mod.lessons?.length || 0} Lessons
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenAddLesson(modIdx)}
                        className="text-xs gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Lesson
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteModule(modIdx)}
                        className="text-destructive hover:text-destructive text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Lessons list inside Module */}
                  <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                    {mod.lessons?.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2 italic">
                        No lessons in this module yet.
                      </p>
                    ) : (
                      mod.lessons.map((les, lesIdx) => (
                        <div
                          key={lesIdx}
                          className="p-3 rounded-lg border border-border/50 bg-background/50 flex items-center justify-between hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {les.videoType === "cloudinary" ? (
                              <Video className="w-4 h-4 text-neon-cyan" />
                            ) : (
                              <Video className="w-4 h-4 text-neon-purple" />
                            )}
                            <div>
                              <p className="text-xs font-medium text-foreground flex items-center gap-2">
                                {les.title}
                                {les.isFreePreview && (
                                  <Badge className="bg-neon-green/20 text-neon-green text-[10px] py-0">
                                    Free Preview
                                  </Badge>
                                )}
                              </p>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                                <span>{les.duration}</span>
                                <span>•</span>
                                <span>{les.videoType === "cloudinary" ? "Cloudinary Video" : "YouTube"}</span>
                                {les.pdfs?.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{les.pdfs.length} PDFs</span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenEditLesson(modIdx, lesIdx)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteLesson(modIdx, lesIdx)}
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lesson Editor Sub-Dialog */}
        <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-background text-foreground border-border">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {activeLessonIndex !== null ? "Edit Lesson" : "Add New Lesson"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="space-y-1.5">
                <Label>Lesson Title</Label>
                <Input
                  placeholder="e.g. 1. Introduction to React State"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Duration (e.g. 15:30)</Label>
                  <Input
                    placeholder="15:30"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Video Source Type</Label>
                  <Select
                    value={lessonForm.videoType}
                    onValueChange={(val: "cloudinary" | "youtube") =>
                      setLessonForm({ ...lessonForm, videoType: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube Link</SelectItem>
                      <SelectItem value="cloudinary">Cloudinary Video Upload</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {lessonForm.videoType === "youtube" ? (
                <div className="space-y-1.5">
                  <Label>YouTube Video URL or Embed ID</Label>
                  <Input
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label>Cloudinary Video File</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={isUploadingVideo}
                      className="cursor-pointer"
                    />
                    {isUploadingVideo && <span className="text-xs text-primary animate-pulse">Uploading...</span>}
                  </div>
                  {lessonForm.videoUrl && (
                    <p className="text-xs text-neon-green truncate mt-1">✓ Video uploaded: {lessonForm.videoUrl}</p>
                  )}
                </div>
              )}

              {/* PDF Attachments */}
              <div className="space-y-2 border-t border-border pt-3">
                <Label>PDF Notes & Resources</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    disabled={isUploadingPdf}
                    className="cursor-pointer"
                  />
                  {isUploadingPdf && <span className="text-xs text-primary animate-pulse">Uploading PDF...</span>}
                </div>
                {lessonForm.pdfs?.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    {lessonForm.pdfs.map((pdf, pIdx) => (
                      <div key={pIdx} className="p-2 rounded bg-muted/30 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 truncate">
                          <FileText className="w-3.5 h-3.5 text-primary" /> {pdf.title}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setLessonForm({
                              ...lessonForm,
                              pdfs: lessonForm.pdfs.filter((_, i) => i !== pIdx),
                            })
                          }
                          className="h-6 w-6 p-0 text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5 border-t border-border pt-3">
                <Label>Lesson Text Notes / Markdown</Label>
                <Textarea
                  placeholder="Enter study notes, formulas, code snippets, or instructions..."
                  rows={3}
                  value={lessonForm.notes}
                  onChange={(e) => setLessonForm({ ...lessonForm, notes: e.target.value })}
                />
              </div>

              {/* Free Preview Toggle */}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <div>
                  <Label>Free Preview Lesson</Label>
                  <p className="text-[11px] text-muted-foreground">Allow non-enrolled students to sample this lesson.</p>
                </div>
                <Switch
                  checked={lessonForm.isFreePreview}
                  onCheckedChange={(checked) => setLessonForm({ ...lessonForm, isFreePreview: checked })}
                />
              </div>

              <Button onClick={handleSaveLesson} className="w-full gradient-primary text-primary-foreground mt-4">
                Save Lesson
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleLessonManager;
