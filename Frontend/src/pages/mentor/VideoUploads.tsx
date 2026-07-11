import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Video, Upload, Play, Eye, Clock, Trash2, Search, Filter } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const mockVideos = [
  { id: 1, title: "React Hooks Deep Dive", course: "React Masterclass", duration: "42:15", views: 1240, status: "published", uploadedAt: "2 days ago", thumbnail: "🎬" },
  { id: 2, title: "Binary Search Trees Explained", course: "DSA Fundamentals", duration: "35:08", views: 890, status: "published", uploadedAt: "5 days ago", thumbnail: "🌳" },
  { id: 3, title: "System Design: Load Balancers", course: "System Design", duration: "51:30", views: 456, status: "processing", uploadedAt: "1 day ago", thumbnail: "⚙️" },
  { id: 4, title: "SQL Joins Masterclass", course: "Database Pro", duration: "28:45", views: 2100, status: "published", uploadedAt: "1 week ago", thumbnail: "🗄️" },
  { id: 5, title: "Dynamic Programming Patterns", course: "DSA Fundamentals", duration: "1:02:20", views: 0, status: "draft", uploadedAt: "Just now", thumbnail: "📐" },
];

const VideoUploads = () => {
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [videos, setVideos] = useState(mockVideos);
  const [uploadingFile, setUploadingFile] = useState<{ name: string; progress: number } | null>(null);
  const [meta, setMeta] = useState({ title: "", course: "" });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setUploadingFile({ name: file.name, progress: 0 });
    const interval = setInterval(() => {
      setUploadingFile(uf => {
        if (!uf) return null;
        if (uf.progress >= 100) {
          clearInterval(interval);
          const id = Math.max(...videos.map(v => v.id)) + 1;
          setVideos(vs => [{
            id,
            title: meta.title || file.name.replace(/\.[^.]+$/, ""),
            course: meta.course || "Uncategorized",
            duration: "—",
            views: 0, status: "processing", uploadedAt: "Just now", thumbnail: "🎬",
          }, ...vs]);
          toast.success(`Uploaded: ${file.name}`);
          setMeta({ title: "", course: "" });
          return null;
        }
        return { ...uf, progress: Math.min(100, uf.progress + 10 + Math.random() * 15) };
      });
    }, 250);
  };

  const filtered = videos.filter(v => v.title.toLowerCase().includes(search.toLowerCase()));
  const remove = (id: number) => { setVideos(vs => vs.filter(v => v.id !== id)); toast("Video deleted"); };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Video Uploads</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your course videos and lectures</p>
        </div>
        <Button onClick={() => setShowUpload(!showUpload)} className="gradient-primary text-primary-foreground border-0 gap-2">
          <Upload className="w-4 h-4" /> Upload Video
        </Button>
      </motion.div>

      {showUpload && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <div
            className={`glass p-8 border-2 border-dashed transition-colors rounded-xl ${dragOver ? 'border-secondary bg-secondary/5' : 'border-border/50'}`}
            onDragOver={(e: React.DragEvent) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e: React.DragEvent) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-secondary" />
              </div>
              <div>
                <p className="text-foreground font-medium">Drag & drop your video here</p>
                <p className="text-sm text-muted-foreground">MP4, MOV, AVI up to 2GB</p>
              </div>
              <Button onClick={() => inputRef.current?.click()} variant="outline" className="border-border/50">Browse Files</Button>
              <div className="grid grid-cols-2 gap-4 mt-4 max-w-md mx-auto">
                <Input placeholder="Video title" value={meta.title} onChange={e => setMeta({ ...meta, title: e.target.value })} className="bg-muted/30 border-border/50" />
                <Input placeholder="Course name" value={meta.course} onChange={e => setMeta({ ...meta, course: e.target.value })} className="bg-muted/30 border-border/50" />
              </div>
              {uploadingFile && (
                <div className="mt-4 max-w-md mx-auto text-left">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="truncate">{uploadingFile.name}</span>
                    <span>{Math.round(uploadingFile.progress)}%</span>
                  </div>
                  <Progress value={uploadingFile.progress} className="h-1.5" />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search videos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-muted/30 border-border/50" />
        </div>
        <Button variant="outline" className="border-border/50 gap-2"><Filter className="w-4 h-4" /> Filter</Button>
      </div>

      <div className="grid gap-4">
        {filtered.map((video, i) => (
          <motion.div key={video.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard className="p-4 flex items-center gap-4 hover:bg-muted/20 transition-colors group">
              <div className="w-20 h-14 rounded-lg bg-muted/50 flex items-center justify-center text-2xl flex-shrink-0">
                {video.thumbnail}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{video.title}</h3>
                <p className="text-xs text-muted-foreground">{video.course}</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" /> {video.duration}
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <Eye className="w-3.5 h-3.5" /> {video.views.toLocaleString()}
              </div>
              <Badge variant={video.status === 'published' ? 'default' : video.status === 'processing' ? 'secondary' : 'outline'} className={video.status === 'published' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : video.status === 'processing' ? 'bg-secondary/20 text-secondary border-secondary/30' : ''}>
                {video.status}
              </Badge>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button onClick={() => toast(`Playing ${video.title}`)} variant="ghost" size="icon" className="h-8 w-8"><Play className="w-4 h-4" /></Button>
                <Button onClick={() => remove(video.id)} variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VideoUploads;
