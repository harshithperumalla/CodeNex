import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProfilePictureDialog from "@/components/shared/ProfilePictureDialog";
import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Star, Users, Video, Award } from "lucide-react";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

interface Props {
  experience: string;
}

const MentorProfileHeader = ({ experience }: Props) => {
  const { user } = useUser();
  const [picDialogOpen, setPicDialogOpen] = useState(false);
  const initials = user.fullName.split(" ").map(n => n[0]).join("");

  const students = useAnimatedCounter(124);
  const videos = useAnimatedCounter(48);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <div className="h-32 bg-gradient-to-r from-[hsl(var(--neon-purple)/0.4)] via-[hsl(var(--primary)/0.3)] to-[hsl(var(--neon-cyan)/0.3)]" />
      <div className="relative px-6 pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
          <div className="relative group">
            <Avatar className="w-32 h-32 border-4 border-card shadow-[0_0_30px_hsl(var(--neon-cyan)/0.3)] transition-shadow duration-300 group-hover:shadow-[0_0_45px_hsl(var(--neon-cyan)/0.5)]">
              {user.profileImageUrl ? (
                <AvatarImage src={user.profileImageUrl} className="object-cover" />
              ) : null}
              <AvatarFallback className="text-3xl font-bold bg-[hsl(var(--neon-cyan)/0.15)] text-secondary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => setPicDialogOpen(true)}
              className="absolute bottom-2 right-2 p-1.5 rounded-full bg-secondary text-secondary-foreground shadow-md hover:bg-secondary/90 transition-all duration-300 hover:scale-110"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <ProfilePictureDialog open={picDialogOpen} onOpenChange={setPicDialogOpen} />
          </div>

          <div className="flex-1 pt-2">
            <h2 className="text-2xl font-bold text-foreground">{user.fullName}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className="bg-[hsl(var(--neon-cyan)/0.15)] text-secondary border border-[hsl(var(--neon-cyan)/0.3)]">
                <Award className="w-3 h-3 mr-1" /> Mentor
              </Badge>
              <Badge variant="outline" className="border-primary/30 text-primary">
                <Star className="w-3 h-3 mr-1" /> 4.8 Rating
              </Badge>
              <Badge variant="outline" className="border-[hsl(var(--neon-green)/0.3)] text-[hsl(var(--neon-green))]">
                Verified
              </Badge>
            </div>
          </div>

          <div className="flex gap-6 text-center">
            {[
              { icon: Users, value: students, label: "Students", ref: students.ref },
              { icon: Video, value: videos, label: "Videos", ref: videos.ref },
              { icon: Award, value: null, label: "Yrs Exp", text: `${experience}+` },
            ].map((stat, i) => (
              <div key={i} ref={stat.ref as any} className="flex flex-col items-center">
                <stat.icon className="w-4 h-4 text-muted-foreground mb-1" />
                <p className="text-lg font-bold text-foreground">
                  {stat.text ?? stat.value?.count}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MentorProfileHeader;
