import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  User, Phone, MapPin, GraduationCap, Briefcase,
  Github, Linkedin, Globe, Plus, X,
} from "lucide-react";
import MentorAvailabilityCalendar from "./MentorAvailabilityCalendar";

interface EditData {
  fullName: string;
  phone: string;
  location: string;
  college: string;
  degree: string;
  about: string;
  github: string;
  linkedin: string;
  portfolio: string;
  skills: string[];
  experience: string;
  languages: string[];
}

interface Props {
  editData: EditData;
  setEditData: React.Dispatch<React.SetStateAction<EditData>>;
  email: string;
  skillInput: string;
  setSkillInput: (v: string) => void;
  langInput: string;
  setLangInput: (v: string) => void;
}

const inputGlow = "transition-shadow duration-300 focus:shadow-[0_0_12px_hsl(var(--neon-cyan)/0.2)]";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const TagSection = ({
  title,
  tags,
  input,
  setInput,
  onAdd,
  onRemove,
  placeholder,
  color = "secondary",
}: {
  title: string;
  tags: string[];
  input: string;
  setInput: (v: string) => void;
  onAdd: () => void;
  onRemove: (t: string) => void;
  placeholder: string;
  color?: string;
}) => (
  <motion.div {...fadeUp}>
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className={`bg-${color}/15 text-${color} border border-${color}/25 gap-1 pr-1.5 transition-all duration-300 hover:bg-${color}/25`}
            >
              {tag}
              <X className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors" onClick={() => onRemove(tag)} />
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={placeholder}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), onAdd())}
            className={`flex-1 ${inputGlow}`}
          />
          <Button size="sm" onClick={onAdd} className="gap-1">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const MentorProfileTab = ({ editData, setEditData, email, skillInput, setSkillInput, langInput, setLangInput }: Props) => {
  const set = (key: keyof EditData, val: string) => setEditData(p => ({ ...p, [key]: val }));

  const addTag = (key: "skills" | "languages", input: string, clear: () => void) => {
    if (input.trim() && !editData[key].includes(input.trim())) {
      setEditData(p => ({ ...p, [key]: [...p[key], input.trim()] }));
      clear();
    }
  };

  const removeTag = (key: "skills" | "languages", tag: string) => {
    setEditData(p => ({ ...p, [key]: p[key].filter(t => t !== tag) }));
  };

  const fields = [
    { label: "Full Name", icon: User, key: "fullName" as const },
    { label: "Email", icon: null, key: null, value: email, disabled: true },
    { label: "Phone", icon: Phone, key: "phone" as const },
    { label: "Location", icon: MapPin, key: "location" as const },
    { label: "Institution", icon: GraduationCap, key: "college" as const },
    { label: "Degree", icon: GraduationCap, key: "degree" as const },
    { label: "Experience (years)", icon: Briefcase, key: "experience" as const },
  ];

  return (
    <div className="space-y-6">
      {/* Personal Info */}
      <motion.div {...fadeUp}>
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground text-base">
              <User className="w-5 h-5 text-secondary" /> Personal & Professional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((f, i) => (
                <div key={i}>
                  <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1">
                    {f.icon && <f.icon className="w-3.5 h-3.5" />} {f.label}
                  </label>
                  <Input
                    value={f.disabled ? f.value : editData[f.key!]}
                    onChange={f.disabled ? undefined : e => set(f.key!, e.target.value)}
                    disabled={f.disabled}
                    className={f.disabled ? "opacity-60" : inputGlow}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bio */}
      <motion.div {...fadeUp}>
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground text-base">Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={editData.about}
              onChange={e => set("about", e.target.value)}
              rows={4}
              placeholder="Tell students about your teaching style and expertise..."
              className={inputGlow}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Expertise */}
      <TagSection
        title="Expertise & Skills"
        tags={editData.skills}
        input={skillInput}
        setInput={setSkillInput}
        onAdd={() => addTag("skills", skillInput, () => setSkillInput(""))}
        onRemove={t => removeTag("skills", t)}
        placeholder="e.g. React, System Design, DSA..."
      />

      {/* Programming Languages */}
      <TagSection
        title="Programming Languages"
        tags={editData.languages}
        input={langInput}
        setInput={setLangInput}
        onAdd={() => addTag("languages", langInput, () => setLangInput(""))}
        onRemove={t => removeTag("languages", t)}
        placeholder="e.g. JavaScript, Python, Go..."
        color="primary"
      />

      {/* Availability Calendar */}
      <MentorAvailabilityCalendar />

      {/* Social Links */}
      <motion.div {...fadeUp}>
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground text-base">
              <Globe className="w-5 h-5 text-primary" /> Social Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { icon: Github, key: "github" as const, ph: "https://github.com/..." },
              { icon: Linkedin, key: "linkedin" as const, ph: "https://linkedin.com/in/..." },
              { icon: Globe, key: "portfolio" as const, ph: "https://yoursite.dev" },
            ].map(({ icon: Icon, key, ph }) => (
              <div key={key}>
                <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1">
                  <Icon className="w-3.5 h-3.5" /> {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <Input
                  value={editData[key]}
                  onChange={e => set(key, e.target.value)}
                  placeholder={ph}
                  className={inputGlow}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default MentorProfileTab;
