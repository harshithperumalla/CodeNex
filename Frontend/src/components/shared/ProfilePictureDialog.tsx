import { useState, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload, Globe, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ProfilePictureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfilePictureDialog = ({ open, onOpenChange }: ProfilePictureDialogProps) => {
  const { user, setUser } = useUser();
  const [urlInput, setUrlInput] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const initials = user.fullName.split(" ").map(n => n[0]).join("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput);
      setPreview(urlInput.trim());
    } catch {
      toast.error("Please enter a valid URL");
    }
  };

  const handleSave = () => {
    if (preview) {
      setUser(prev => ({ ...prev, profileImageUrl: preview }));
      toast.success("Profile picture updated!");
    }
    reset();
  };

  const handleRemove = () => {
    setUser(prev => ({ ...prev, profileImageUrl: undefined }));
    toast.success("Profile picture removed");
    reset();
  };

  const reset = () => {
    setPreview(null);
    setUrlInput("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); else onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Profile Picture</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          <Avatar className="w-28 h-28 border-2 border-primary/50 shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
            {(preview || user.profileImageUrl) ? (
              <AvatarImage src={preview || user.profileImageUrl} className="object-cover" />
            ) : null}
            <AvatarFallback className="text-3xl font-bold bg-primary/20 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="grid grid-cols-2 gap-3 w-full">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileSelect} />

            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-5 h-5 text-primary" />
              <span className="text-xs">Upload Image</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" onClick={() => cameraInputRef.current?.click()}>
              <Camera className="w-5 h-5 text-primary" />
              <span className="text-xs">Take Photo</span>
            </Button>
          </div>

          <div className="w-full space-y-2">
            <label className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Image URL
            </label>
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                onKeyDown={e => e.key === "Enter" && handleUrlSubmit()}
              />
              <Button size="sm" variant="secondary" onClick={handleUrlSubmit}>Load</Button>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            {preview && (
              <Button onClick={handleSave} className="flex-1">Save Picture</Button>
            )}
            {user.profileImageUrl && (
              <Button variant="destructive" onClick={handleRemove} className="gap-2">
                <Trash2 className="w-4 h-4" /> Remove
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePictureDialog;
