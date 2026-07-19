import { Outlet, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "./AdminSidebar";
import AdminChatbot from "../shared/AdminChatbot";
import NotificationBell from "../shared/NotificationBell";
import ProfileDropdown from "./ProfileDropdown";
import PageTransitionOverlay from "../shared/PageTransitionOverlay";
import { useUser } from "@/contexts/UserContext";

const pageVariants = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.99 },
};

const AdminLayout = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    if (user?.role === "mentor") {
      return <Navigate to="/mentor" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[15%] w-72 h-72 rounded-full opacity-[0.04] animate-float" style={{ background: 'radial-gradient(circle, hsl(265 90% 60%), transparent)' }} />
        <div className="absolute top-[50%] right-[10%] w-96 h-96 rounded-full opacity-[0.03] animate-float" style={{ background: 'radial-gradient(circle, hsl(195 100% 50%), transparent)', animationDelay: '2s' }} />
        <div className="absolute bottom-[10%] left-[40%] w-64 h-64 rounded-full opacity-[0.04] animate-float" style={{ background: 'radial-gradient(circle, hsl(330 90% 60%), transparent)', animationDelay: '4s' }} />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>
      <AdminSidebar />
      <div className="fixed top-4 right-4 lg:right-6 z-50 flex items-center gap-3">
        <NotificationBell />
        <ProfileDropdown />
      </div>
      <main className="ml-[72px] lg:ml-[240px] min-h-screen p-4 lg:p-6 relative z-10">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <Outlet />
        </motion.div>
      </main>
      <PageTransitionOverlay />
      <AdminChatbot />
    </div>
  );
};

export default AdminLayout;
