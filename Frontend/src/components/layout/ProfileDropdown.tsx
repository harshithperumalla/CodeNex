import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { User, Settings, Award, LogOut, Camera } from "lucide-react";
import ProfilePictureDialog from "@/components/shared/ProfilePictureDialog";

const ProfileDropdown = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [picDialogOpen, setPicDialogOpen] = useState(false);

  const initials = user.fullName
    ? user.fullName.split(" ").map(n => n[0]).join("")
    : user.name.split(" ").map(n => n[0]).join("");

  const canChangePhoto = user.role !== "admin";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
            <Avatar className="w-9 h-9 border-2 border-primary/40 hover:border-primary shadow-[0_0_12px_hsl(var(--primary)/0.2)] transition-all cursor-pointer">
              {user.profileImageUrl ? (
                <AvatarImage src={user.profileImageUrl} className="object-cover" />
              ) : null}
              <AvatarFallback className="text-xs font-semibold bg-primary/20 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-3 py-2">
            <p className="text-sm font-medium">{user.fullName || user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/profile")}>
            <User className="w-4 h-4 mr-2" /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            <Settings className="w-4 h-4 mr-2" /> Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/badges")}>
            <Award className="w-4 h-4 mr-2" /> My Badges
          </DropdownMenuItem>
          {canChangePhoto && (
            <DropdownMenuItem onClick={() => setPicDialogOpen(true)}>
              <Camera className="w-4 h-4 mr-2" /> Change Profile Picture
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => { logout(); navigate("/login"); }} className="text-destructive focus:text-destructive">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {canChangePhoto && (
        <ProfilePictureDialog open={picDialogOpen} onOpenChange={setPicDialogOpen} />
      )}
    </>
  );
};

export default ProfileDropdown;
