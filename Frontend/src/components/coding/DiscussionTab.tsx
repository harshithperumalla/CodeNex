import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, MessageSquare, Clock, User, Send } from "lucide-react";

type Comment = {
  id: number;
  author: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  replies: number;
  tags: string[];
};

const mockDiscussions: Record<string, Comment[]> = {
  default: [
    {
      id: 1,
      author: "AlgoMaster",
      avatar: "AM",
      time: "2 hours ago",
      content: "The key insight here is to use a hash map for O(1) lookups. Instead of the brute force O(n²) approach, we can store each number and its index as we iterate.",
      likes: 42,
      replies: 5,
      tags: ["Hash Map", "Optimal"],
    },
    {
      id: 2,
      author: "CodeNinja99",
      avatar: "CN",
      time: "5 hours ago",
      content: "For anyone struggling with the edge cases — don't forget that the same element can't be used twice! Make sure you check the index, not just the value.",
      likes: 28,
      replies: 3,
      tags: ["Edge Cases"],
    },
    {
      id: 3,
      author: "PythonPro",
      avatar: "PP",
      time: "1 day ago",
      content: "Here's my Python solution using enumerate:\n```python\ndef solve(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target-n], i]\n        seen[n] = i\n```\nTime: O(n), Space: O(n)",
      likes: 67,
      replies: 12,
      tags: ["Python", "Clean Code"],
    },
    {
      id: 4,
      author: "DSALearner",
      avatar: "DL",
      time: "2 days ago",
      content: "Can someone explain why sorting the array first and using two pointers doesn't work here? I keep getting wrong answers with that approach.",
      likes: 15,
      replies: 8,
      tags: ["Question", "Two Pointers"],
    },
    {
      id: 5,
      author: "InterviewPrep",
      avatar: "IP",
      time: "3 days ago",
      content: "This was asked in my Google interview! The follow-up question was: what if the array is sorted? Then you can use the two-pointer technique for O(1) space.",
      likes: 93,
      replies: 15,
      tags: ["Interview", "Google"],
    },
  ],
};

interface DiscussionTabProps {
  problemId: number;
}

const DiscussionTab = ({ problemId }: DiscussionTabProps) => {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>(mockDiscussions.default);
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<"hot" | "recent">("hot");

  const handleLike = (commentId: number) => {
    setLikedComments(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
    setComments(prev =>
      prev.map(c =>
        c.id === commentId
          ? { ...c, likes: likedComments.has(commentId) ? c.likes - 1 : c.likes + 1 }
          : c
      )
    );
  };

  const handlePost = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now(),
      author: "You",
      avatar: "YO",
      time: "Just now",
      content: newComment,
      likes: 0,
      replies: 0,
      tags: [],
    };
    setComments(prev => [comment, ...prev]);
    setNewComment("");
  };

  const sorted = [...comments].sort((a, b) =>
    sortBy === "hot" ? b.likes - a.likes : b.id - a.id
  );

  return (
    <div className="flex flex-col h-full">
      {/* Post new comment */}
      <div className="p-4 border-b border-border">
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            YO
          </div>
          <div className="flex-1 relative">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your approach or ask a question..."
              className="w-full h-16 bg-background/50 rounded-lg p-3 pr-10 text-sm text-foreground border border-border resize-none focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
            />
            <button
              onClick={handlePost}
              disabled={!newComment.trim()}
              className="absolute right-2 bottom-2 p-1.5 rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-30"
            >
              <Send className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50">
        <span className="text-xs text-muted-foreground">Sort by:</span>
        <button
          onClick={() => setSortBy("hot")}
          className={`text-xs px-2 py-0.5 rounded transition-colors ${sortBy === "hot" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          🔥 Hot
        </button>
        <button
          onClick={() => setSortBy("recent")}
          className={`text-xs px-2 py-0.5 rounded transition-colors ${sortBy === "recent" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          🕐 Recent
        </button>
        <span className="ml-auto text-xs text-muted-foreground">{comments.length} comments</span>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {sorted.map((comment, i) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg bg-muted/20 border border-border/50 p-4 hover:border-border transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {comment.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{comment.author}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {comment.time}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                  {comment.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {comment.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/80">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className={`flex items-center gap-1 text-xs transition-colors ${likedComments.has(comment.id) ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {comment.likes + (likedComments.has(comment.id) ? 1 : 0) - (comments.find(c => c.id === comment.id)?.likes === comment.likes ? 0 : 0)}
                      {comment.likes}
                    </button>
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {comment.replies}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DiscussionTab;
