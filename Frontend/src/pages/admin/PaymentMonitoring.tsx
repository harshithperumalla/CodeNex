import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, BookOpen, Award, CheckCircle, Clock, RefreshCw, UserCheck } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/services/api";

interface EnrollmentRecord {
  id: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  courseType: string;
  progress: number;
  isCompleted: boolean;
  enrolledAt: string;
}

const PaymentMonitoring = () => {
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/course-management/enrollments");
      if (res.data.success) {
        setEnrollments(res.data.enrollments);
      }
    } catch (err) {
      console.error("Failed to load course enrollments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const totalEnrollments = enrollments.length;
  const completedCertificates = enrollments.filter((e) => e.isCompleted).length;
  const activeLearners = enrollments.filter((e) => !e.isCompleted && e.progress > 0).length;

  const stats = [
    { label: "Total Enrollments", value: totalEnrollments.toString(), icon: Users, sub: "All time free course enrollments" },
    { label: "Active Student Learners", value: activeLearners.toString(), icon: BookOpen, sub: "In-progress course learners" },
    { label: "Certificates Completed", value: completedCertificates.toString(), icon: Award, sub: "100% course completions" },
    { label: "Access Model", value: "100% FREE", icon: UserCheck, sub: "Instant 1-click student access" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">
            Enrollment & <span className="gradient-text">Course Monitoring</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Track student course enrollments, learning progress, and completion records
          </p>
        </div>
        <Button onClick={fetchEnrollments} variant="outline" size="sm" className="gap-2 text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }}>
            <GlassCard className="p-5">
              <s.icon className="w-5 h-5 text-primary mb-3" />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              <p className="text-[10px] text-primary mt-2">{s.sub}</p>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Enrollments Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <GlassCard className="overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Live Student Course Enrollments</h3>
            <span className="text-xs text-muted-foreground">{enrollments.length} records</span>
          </div>
          {loading ? (
            <div className="text-center py-10 text-xs text-muted-foreground">Loading enrollment records...</div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground">No student enrollments recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase tracking-wider text-left">
                    <th className="p-4">Student</th>
                    <th className="p-4 hidden md:table-cell">Course Title</th>
                    <th className="p-4">Access Type</th>
                    <th className="p-4">Progress</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 hidden lg:table-cell">Enrolled Date</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enr) => (
                    <tr key={enr.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <span className="font-semibold text-foreground">{enr.studentName}</span>
                        <span className="block text-[11px] text-muted-foreground">{enr.studentEmail}</span>
                      </td>
                      <td className="p-4 text-sm text-foreground hidden md:table-cell">{enr.courseTitle}</td>
                      <td className="p-4">
                        <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30" variant="outline">
                          {enr.courseType || "FREE"}
                        </Badge>
                      </td>
                      <td className="p-4 font-mono font-medium text-neon-cyan">{enr.progress}%</td>
                      <td className="p-4">
                        <span className={`flex items-center gap-1.5 ${enr.isCompleted ? "text-neon-green" : "text-neon-yellow"}`}>
                          <CheckCircle className="w-3.5 h-3.5" />
                          {enr.isCompleted ? "Completed 🎓" : "In Progress"}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground hidden lg:table-cell">
                        {new Date(enr.enrolledAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default PaymentMonitoring;
