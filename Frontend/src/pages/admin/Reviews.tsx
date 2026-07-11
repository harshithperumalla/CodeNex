import { motion } from "framer-motion";
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Filter, Flag, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import GlassCard from "@/components/shared/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const initialReviews = [
  { id: 1, user: "Rahul Sharma", avatar: "RS", course: "Advanced DSA with Java", rating: 5, comment: "Excellent course! The problem-solving approach is very structured.", date: "2025-02-28", helpful: 24, status: "approved" },
  { id: 2, user: "Sneha Reddy", avatar: "SR", course: "React Masterclass 2025", rating: 4, comment: "Great content but some sections could use more real-world examples.", date: "2025-02-27", helpful: 18, status: "approved" },
  { id: 3, user: "Amit Kumar", avatar: "AK", course: "Python for Data Science", rating: 2, comment: "The course is outdated. Needs to cover newer libraries.", date: "2025-02-26", helpful: 5, status: "flagged" },
  { id: 4, user: "Ananya Gupta", avatar: "AG", course: "Communication Skills Pro", rating: 5, comment: "Transformed my interview skills! Highly recommend.", date: "2025-02-25", helpful: 31, status: "approved" },
  { id: 5, user: "Karthik Nair", avatar: "KN", course: "Aptitude Crash Course", rating: 3, comment: "Decent course but lacks depth in some quantitative topics.", date: "2025-02-24", helpful: 9, status: "pending" },
  { id: 6, user: "Priya Patel", avatar: "PP", course: "System Design Fundamentals", rating: 1, comment: "Incomplete content. Many promised modules are still missing.", date: "2025-02-23", helpful: 2, status: "flagged" },
];

const filters = ["All", "Approved", "Pending", "Flagged"];
const statusColor: Record<string, string> = {
  approved: "bg-primary/20 text-primary border-primary/30",
  pending: "bg-muted text-muted-foreground border-border",
  flagged: "bg-destructive/20 text-destructive border-destructive/30",
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
    ))}
  </div>
);

const Reviews = () => {
  const [reviews, setReviews] = useState(initialReviews);
  const [activeFilter, setActiveFilter] = useState("All");

  const setStatus = (id: number, status: string) => {
    setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(`Review ${status}`);
  };
  const reject = (id: number) => {
    setReviews((rs) => rs.filter((r) => r.id !== id));
    toast.error("Review removed");
  };

  const filtered = activeFilter === "All" ? reviews : reviews.filter((r) => r.status === activeFilter.toLowerCase());
  const avgRating = (reviews.reduce((a, r) => a + r.rating, 0) / (reviews.length || 1)).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Course <span className="gradient-text">Reviews</span></h1>
        <p className="text-sm text-muted-foreground">{reviews.length} reviews • {avgRating} avg rating</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Avg Rating", value: avgRating, icon: Star },
          { label: "Total Reviews", value: reviews.length, icon: MessageSquare },
          { label: "Approved", value: reviews.filter((r) => r.status === "approved").length, icon: ThumbsUp },
          { label: "Flagged", value: reviews.filter((r) => r.status === "flagged").length, icon: ThumbsDown },
        ].map((m) => (
          <GlassCard key={m.label} className="p-4" tilt={false}>
            <m.icon className="w-5 h-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{m.value}</p>
            <p className="text-xs text-muted-foreground">{m.label}</p>
          </GlassCard>
        ))}
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {filters.map((f) => (
          <Button key={f} size="sm" variant={activeFilter === f ? "default" : "outline"} onClick={() => setActiveFilter(f)} className="text-xs">
            {f}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((review, i) => (
          <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <GlassCard className="p-4" tilt={false}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {review.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">{review.user}</span>
                    <Badge variant="outline" className={statusColor[review.status]}>{review.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{review.course} • {review.date}</p>
                  <StarRating rating={review.rating} />
                  <p className="text-sm text-foreground/80 mt-2">{review.comment}</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {review.helpful} helpful</span>
                    <Button variant="ghost" size="sm" className="text-xs h-7 gap-1 text-emerald-300 hover:text-emerald-200" onClick={() => setStatus(review.id, "approved")}>
                      <CheckCircle2 className="h-3 w-3" /> Approve
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-7 gap-1 text-amber-300 hover:text-amber-200" onClick={() => setStatus(review.id, "flagged")}>
                      <Flag className="h-3 w-3" /> Flag
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive" onClick={() => reject(review.id)}>
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
