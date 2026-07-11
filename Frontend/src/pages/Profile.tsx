import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProfilePictureDialog from "@/components/shared/ProfilePictureDialog";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, MapPin, GraduationCap, BookOpen, Calendar,
  Github, Linkedin, Globe, Edit3, Save, X, Upload
} from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";

const Profile = () => {
  const { user, setUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [picDialogOpen, setPicDialogOpen] = useState(false);
  const [editData, setEditData] = useState({ ...user });
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  useEffect(() => {
    setEditData({ ...user });
  }, [user]);

  const initials = user.fullName.split(" ").map(n => n[0]).join("");

  const handleSave = async () => {
    try {
      const res = await api.put("/user/profile", editData);
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    setEditData({ ...user });
    setIsEditing(false);
  };

  const addSkill = () => {
    if (skillInput.trim() && !editData.skills.includes(skillInput.trim())) {
      setEditData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setEditData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const addInterest = () => {
    if (interestInput.trim() && !editData.interests.includes(interestInput.trim())) {
      setEditData(prev => ({ ...prev, interests: [...prev.interests, interestInput.trim()] }));
      setInterestInput("");
    }
  };

  const removeInterest = (interest: string) => {
    setEditData(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }));
  };

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground text-sm">Manage your personal information</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Edit3 className="w-4 h-4" /> Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </Button>
            <Button variant="outline" onClick={handleCancel} className="gap-2">
              <X className="w-4 h-4" /> Cancel
            </Button>
          </div>
        )}
      </div>

      <motion.div {...fadeUp}>
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/40 via-secondary/30 to-accent/30" />
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-card shadow-[0_0_20px_hsl(var(--primary)/0.25)]">
                  {user.profileImageUrl ? (
                    <AvatarImage src={user.profileImageUrl} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="text-2xl font-bold bg-primary/20 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {isEditing && user.role !== "admin" && (
                  <>
                    <button
                      onClick={() => setPicDialogOpen(true)}
                      className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                    <ProfilePictureDialog open={picDialogOpen} onOpenChange={setPicDialogOpen} />
                  </>
                )}
              </div>
              <div className="flex-1 pt-2">
                <h2 className="text-xl font-bold text-foreground">{user.fullName}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{user.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{user.phone}</span>
                </div>
                <Badge className="mt-2 bg-primary/20 text-primary border-primary/30">{roleLabel}</Badge>
              </div>
              <div className="flex gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">{user.streak}</p>
                  <p className="text-xs text-muted-foreground">Streak</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{user.points}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">#{user.rank}</p>
                  <p className="text-xs text-muted-foreground">Rank</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <User className="w-5 h-5 text-primary" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Full Name</label>
                  {isEditing ? (
                    <Input value={editData.fullName} onChange={e => setEditData(p => ({ ...p, fullName: e.target.value }))} />
                  ) : (
                    <p className="text-foreground">{user.fullName}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Email</label>
                  <p className="text-foreground">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Phone</label>
                  {isEditing ? (
                    <Input value={editData.phone} onChange={e => setEditData(p => ({ ...p, phone: e.target.value }))} />
                  ) : (
                    <p className="text-foreground">{user.phone}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Location</label>
                  {isEditing ? (
                    <Input value={editData.location} onChange={e => setEditData(p => ({ ...p, location: e.target.value }))} />
                  ) : (
                    <p className="text-foreground">{user.location}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" />College</label>
                  {isEditing ? (
                    <Input value={editData.college} onChange={e => setEditData(p => ({ ...p, college: e.target.value }))} />
                  ) : (
                    <p className="text-foreground">{user.college}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />Degree / Course</label>
                  {isEditing ? (
                    <Input value={editData.degree} onChange={e => setEditData(p => ({ ...p, degree: e.target.value }))} />
                  ) : (
                    <p className="text-foreground">{user.degree}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Year of Study</label>
                  {isEditing ? (
                    <Input value={editData.yearOfStudy} onChange={e => setEditData(p => ({ ...p, yearOfStudy: e.target.value }))} />
                  ) : (
                    <p className="text-foreground">{user.yearOfStudy}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Hobbies</label>
                  {isEditing ? (
                    <Input value={editData.hobbies} onChange={e => setEditData(p => ({ ...p, hobbies: e.target.value }))} />
                  ) : (
                    <p className="text-foreground">{user.hobbies}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Globe className="w-5 h-5 text-secondary" /> Social Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><Github className="w-3.5 h-3.5" />GitHub</label>
                {isEditing ? (
                  <Input value={editData.github} onChange={e => setEditData(p => ({ ...p, github: e.target.value }))} placeholder="https://github.com/..." />
                ) : (
                  <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">{user.github || "Not set"}</a>
                )}
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><Linkedin className="w-3.5 h-3.5" />LinkedIn</label>
                {isEditing ? (
                  <Input value={editData.linkedin} onChange={e => setEditData(p => ({ ...p, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/..." />
                ) : (
                  <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">{user.linkedin || "Not set"}</a>
                )}
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><Globe className="w-3.5 h-3.5" />Portfolio</label>
                {isEditing ? (
                  <Input value={editData.portfolio} onChange={e => setEditData(p => ({ ...p, portfolio: e.target.value }))} placeholder="https://yoursite.dev" />
                ) : (
                  <a href={user.portfolio} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">{user.portfolio || "Not set"}</a>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-foreground">About Me</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={editData.about}
                onChange={e => setEditData(p => ({ ...p, about: e.target.value }))}
                rows={4}
                placeholder="Write something about yourself..."
              />
            ) : (
              <p className="text-muted-foreground leading-relaxed">{user.about || "No bio added yet."}</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div {...fadeUp} transition={{ delay: 0.25 }}>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(isEditing ? editData.skills : user.skills).map(skill => (
                  <Badge key={skill} variant="secondary" className="bg-primary/15 text-primary border-primary/25 gap-1">
                    {skill}
                    {isEditing && (
                      <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => removeSkill(skill)} />
                    )}
                  </Badge>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2 mt-3">
                  <Input
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={addSkill}>Add</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Interests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(isEditing ? editData.interests : user.interests).map(interest => (
                  <Badge key={interest} variant="secondary" className="bg-secondary/15 text-secondary border-secondary/25 gap-1">
                    {interest}
                    {isEditing && (
                      <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => removeInterest(interest)} />
                    )}
                  </Badge>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2 mt-3">
                  <Input
                    value={interestInput}
                    onChange={e => setInterestInput(e.target.value)}
                    placeholder="Add an interest..."
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addInterest())}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={addInterest}>Add</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
