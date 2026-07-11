import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Save, User, BarChart3, Award } from "lucide-react";
import MentorProfileHeader from "@/components/mentor/MentorProfileHeader";
import MentorProfileTab from "@/components/mentor/MentorProfileTab";
import MentorStatsTab from "@/components/mentor/MentorStatsTab";
import MentorAchievementsTab, { type MedalItem } from "@/components/mentor/MentorAchievementsTab";

const defaultMedals: MedalItem[] = [
  { label: "Best Mentor 2025", iconIndex: 0 },
  { label: "100+ Students Mentored", iconIndex: 1 },
  { label: "Verified Expert", iconIndex: 2 },
  { label: "Top Rated Mentor", iconIndex: 3 },
  { label: "Community Star", iconIndex: 4 },
];

const defaultCertifications = [
  "AWS Certified Solutions Architect",
  "Google Professional Cloud Developer",
  "Meta Front-End Developer Certificate",
  "MongoDB Certified Developer",
];

const defaultAccomplishments = [
  "Published 3 research papers on distributed systems",
  "Open source contributor to React & Next.js",
  "Speaker at ReactConf 2024 & JSNation",
  "Mentored 20+ students to FAANG placements",
  "Built a platform with 50K+ active users",
];

const MentorProfile = () => {
  const { user, setUser } = useUser();
  const [editData, setEditData] = useState({
    fullName: user.fullName,
    phone: user.phone,
    location: user.location,
    college: user.college,
    degree: user.degree,
    about: user.about,
    github: user.github,
    linkedin: user.linkedin,
    portfolio: user.portfolio,
    skills: [...user.skills],
    experience: "5",
    languages: ["JavaScript", "TypeScript", "Python", "Go"],
  });
  const [skillInput, setSkillInput] = useState("");
  const [langInput, setLangInput] = useState("");

  const [medals, setMedals] = useState<MedalItem[]>(defaultMedals);
  const [certifications, setCertifications] = useState(defaultCertifications);
  const [accomplishments, setAccomplishments] = useState(defaultAccomplishments);

  const handleSave = () => {
    setUser(prev => ({
      ...prev,
      fullName: editData.fullName,
      name: editData.fullName,
      phone: editData.phone,
      location: editData.location,
      college: editData.college,
      degree: editData.degree,
      about: editData.about,
      github: editData.github,
      linkedin: editData.linkedin,
      portfolio: editData.portfolio,
      skills: editData.skills,
    }));
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Mentor Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your professional profile, stats, and achievements</p>
      </motion.div>

      <MentorProfileHeader experience={editData.experience} />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="glass border border-border/50 w-full sm:w-auto">
          <TabsTrigger value="profile" className="gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5 data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary">
            <BarChart3 className="w-4 h-4" /> Stats
          </TabsTrigger>
          <TabsTrigger value="achievements" className="gap-1.5 data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
            <Award className="w-4 h-4" /> Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <MentorProfileTab
            editData={editData}
            setEditData={setEditData}
            email={user.email}
            skillInput={skillInput}
            setSkillInput={setSkillInput}
            langInput={langInput}
            setLangInput={setLangInput}
          />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <MentorStatsTab />
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <MentorAchievementsTab
            medals={medals}
            certifications={certifications}
            accomplishments={accomplishments}
            onMedalsChange={setMedals}
            onCertificationsChange={setCertifications}
            onAccomplishmentsChange={setAccomplishments}
          />
        </TabsContent>
      </Tabs>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end pb-6"
      >
        <Button
          onClick={handleSave}
          size="lg"
          className="gap-2 px-8 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_hsl(var(--neon-cyan)/0.3)]"
        >
          <Save className="w-4 h-4" /> Save Profile
        </Button>
      </motion.div>
    </div>
  );
};

export default MentorProfile;
