import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Medal, ShieldCheck, Trophy, Sparkles, Plus, X } from "lucide-react";
import { useState } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const inputGlow = "transition-shadow duration-300 focus:shadow-[0_0_12px_hsl(var(--neon-cyan)/0.2)]";

const medalIconOptions = [
  { icon: Trophy, color: "text-[hsl(var(--neon-yellow))]", bg: "bg-[hsl(var(--neon-yellow)/0.12)]" },
  { icon: Medal, color: "text-[hsl(var(--neon-cyan))]", bg: "bg-[hsl(var(--neon-cyan)/0.12)]" },
  { icon: ShieldCheck, color: "text-[hsl(var(--neon-green))]", bg: "bg-[hsl(var(--neon-green)/0.12)]" },
  { icon: Award, color: "text-primary", bg: "bg-primary/10" },
  { icon: Sparkles, color: "text-accent", bg: "bg-accent/10" },
];

export interface MedalItem {
  label: string;
  iconIndex: number;
}

interface Props {
  medals: MedalItem[];
  certifications: string[];
  accomplishments: string[];
  onMedalsChange: (medals: MedalItem[]) => void;
  onCertificationsChange: (certs: string[]) => void;
  onAccomplishmentsChange: (items: string[]) => void;
}

const MentorAchievementsTab = ({
  medals,
  certifications,
  accomplishments,
  onMedalsChange,
  onCertificationsChange,
  onAccomplishmentsChange,
}: Props) => {
  const [medalInput, setMedalInput] = useState("");
  const [certInput, setCertInput] = useState("");
  const [accomplishInput, setAccomplishInput] = useState("");

  const addMedal = () => {
    const v = medalInput.trim();
    if (v && !medals.some(m => m.label === v)) {
      onMedalsChange([...medals, { label: v, iconIndex: medals.length % medalIconOptions.length }]);
      setMedalInput("");
    }
  };

  const removeMedal = (label: string) => {
    onMedalsChange(medals.filter(m => m.label !== label));
  };

  const addCert = () => {
    const v = certInput.trim();
    if (v && !certifications.includes(v)) {
      onCertificationsChange([...certifications, v]);
      setCertInput("");
    }
  };

  const removeCert = (cert: string) => {
    onCertificationsChange(certifications.filter(c => c !== cert));
  };

  const addAccomplishment = () => {
    const v = accomplishInput.trim();
    if (v && !accomplishments.includes(v)) {
      onAccomplishmentsChange([...accomplishments, v]);
      setAccomplishInput("");
    }
  };

  const removeAccomplishment = (item: string) => {
    onAccomplishmentsChange(accomplishments.filter(a => a !== item));
  };

  return (
    <div className="space-y-6">
      {/* Medals & Awards */}
      <motion.div {...fadeUp}>
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground text-base">
              <Trophy className="w-5 h-5 text-[hsl(var(--neon-yellow))]" /> Medals & Awards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
              <AnimatePresence mode="popLayout">
                {medals.map((m, i) => {
                  const opt = medalIconOptions[m.iconIndex % medalIconOptions.length];
                  return (
                    <motion.div
                      key={m.label}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ delay: i * 0.04 }}
                      className={`relative group flex flex-col items-center gap-2 p-4 rounded-xl ${opt.bg} border border-border/30 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] transition-shadow duration-300`}
                    >
                      <button
                        onClick={() => removeMedal(m.label)}
                        className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-0.5 rounded-full bg-destructive/80 text-destructive-foreground transition-opacity duration-200 hover:bg-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <opt.icon className={`w-7 h-7 ${opt.color}`} />
                      <span className="text-xs text-center text-foreground font-medium">{m.label}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            <div className="flex gap-2">
              <Input
                value={medalInput}
                onChange={e => setMedalInput(e.target.value)}
                placeholder="Add an award (e.g., Best Mentor 2025)..."
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addMedal())}
                className={`flex-1 ${inputGlow}`}
              />
              <Button size="sm" onClick={addMedal} className="gap-1">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Certifications */}
      <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground text-base">
              <ShieldCheck className="w-5 h-5 text-[hsl(var(--neon-green))]" /> Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <AnimatePresence mode="popLayout">
                {certifications.map((cert) => (
                  <motion.div
                    key={cert}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge
                      variant="outline"
                      className="px-3 py-1.5 text-sm border-[hsl(var(--neon-green)/0.3)] text-[hsl(var(--neon-green))] hover:bg-[hsl(var(--neon-green)/0.1)] transition-colors duration-300 gap-1 pr-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      {cert}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive transition-colors"
                        onClick={() => removeCert(cert)}
                      />
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="flex gap-2">
              <Input
                value={certInput}
                onChange={e => setCertInput(e.target.value)}
                placeholder="Add a certification (e.g., AWS Solutions Architect)..."
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCert())}
                className={`flex-1 ${inputGlow}`}
              />
              <Button size="sm" onClick={addCert} className="gap-1">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notable Accomplishments */}
      <motion.div {...fadeUp} transition={{ delay: 0.25 }}>
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground text-base">
              <Sparkles className="w-5 h-5 text-accent" /> Notable Accomplishments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-4">
              <AnimatePresence mode="popLayout">
                {accomplishments.map((item, i) => (
                  <motion.li
                    key={item}
                    layout
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ delay: i * 0.04 }}
                    className="group flex items-start gap-3 text-sm text-foreground"
                  >
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary shrink-0" />
                    <span className="flex-1">{item}</span>
                    <button
                      onClick={() => removeAccomplishment(item)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all duration-200 shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <div className="flex gap-2">
              <Input
                value={accomplishInput}
                onChange={e => setAccomplishInput(e.target.value)}
                placeholder="Add an accomplishment..."
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addAccomplishment())}
                className={`flex-1 ${inputGlow}`}
              />
              <Button size="sm" onClick={addAccomplishment} className="gap-1">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default MentorAchievementsTab;
