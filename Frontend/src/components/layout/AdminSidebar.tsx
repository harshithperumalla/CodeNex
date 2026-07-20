import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, BookOpen, CreditCard,
  BarChart3, MessageSquare, Star, Settings,
  Shield, ArrowLeft
} from "lucide-react";
import { usePageTransition } from "@/contexts/PageTransitionContext";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/courses", icon: BookOpen, label: "Courses" },
  { to: "/admin/payments", icon: CreditCard, label: "Payments" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/admin/reviews", icon: Star, label: "Reviews" },
  { to: "/admin/suggestions", icon: MessageSquare, label: "Suggestions" },
];

const AdminSidebar = () => {
  const location = useLocation();
  const { triggerTransition, isTransitioning } = usePageTransition();

  const handleClick = (e: React.MouseEvent, to: string, label: string) => {
    e.preventDefault();
    if (isTransitioning || location.pathname === to) return;
    triggerTransition(to, label);
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-[72px] lg:w-[240px] glass-strong z-50 flex flex-col items-center lg:items-stretch py-6 gap-1 overflow-y-auto border-r border-border/50">
      <div className="flex items-center justify-center lg:justify-start lg:px-5 mb-2">
        <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center">
          <Shield className="w-5 h-5 text-accent-foreground" />
        </div>
        <span className="hidden lg:block ml-3 font-bold text-lg gradient-text">Admin Panel</span>
      </div>

      <a
        href="/"
        onClick={(e) => handleClick(e, "/", "Home")}
        className="flex items-center justify-center lg:justify-start gap-2 mx-2 lg:mx-3 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all mb-4 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden lg:block">Back to App</span>
      </a>

      <nav className="flex flex-col gap-1 flex-1 w-full px-2 lg:px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <a
              key={item.to}
              href={item.to}
              onClick={(e) => handleClick(e, item.to, item.label)}
              className="relative flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-xl transition-all group cursor-pointer overflow-hidden"
            >
              {isActive && (
                <motion.div
                  layoutId="admin-sidebar-active"
                  className="absolute inset-0 rounded-xl gradient-accent opacity-20 z-0 pointer-events-none"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon className={`w-5 h-5 relative z-10 shrink-0 transition-colors ${isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'}`} />
              <span className={`hidden lg:block relative z-10 text-sm font-medium whitespace-nowrap transition-colors ${isActive ? 'text-foreground font-semibold' : 'text-muted-foreground group-hover:text-foreground'}`}>
                {item.label}
              </span>
            </a>
          );
        })}
      </nav>

      <div className="px-2 lg:px-3 mt-auto">
        <a
          href="/admin/settings"
          onClick={(e) => handleClick(e, "/admin/settings", "Settings")}
          className="flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Settings className="w-5 h-5" />
          <span className="hidden lg:block text-sm font-medium">Settings</span>
        </a>
      </div>
    </aside>
  );
};

export default AdminSidebar;
