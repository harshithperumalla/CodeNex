import { Outlet, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import AIChatButton from "../shared/AIChatButton";
import ProfileDropdown from "./ProfileDropdown";
import NotificationBell from "../shared/NotificationBell";
import PageTransitionOverlay from "../shared/PageTransitionOverlay";
import { useUser } from "@/contexts/UserContext";

const pageVariants = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.99 },
};

const AppLayout = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === "mentor") {
    return <Navigate to="/mentor" replace />;
  }

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[5%] right-[10%] w-80 h-80 rounded-full opacity-[0.04] animate-float" style={{ background: 'radial-gradient(circle, hsl(265 90% 60%), transparent)' }} />
        <div className="absolute top-[40%] left-[5%] w-96 h-96 rounded-full opacity-[0.03] animate-float" style={{ background: 'radial-gradient(circle, hsl(195 100% 50%), transparent)', animationDelay: '1.5s' }} />
        <div className="absolute bottom-[15%] right-[25%] w-72 h-72 rounded-full opacity-[0.04] animate-float" style={{ background: 'radial-gradient(circle, hsl(330 90% 60%), transparent)', animationDelay: '3s' }} />
        <div className="absolute top-[70%] left-[50%] w-48 h-48 rounded-full opacity-[0.03] animate-float" style={{ background: 'radial-gradient(circle, hsl(145 80% 50%), transparent)', animationDelay: '4.5s' }} />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
      </div>
      <Sidebar />
      <div className="fixed top-4 right-4 lg:right-6 z-50 flex items-center gap-3">
        <NotificationBell />
        <ProfileDropdown />
      </div>
      <main className="ml-[72px] lg:ml-[220px] min-h-screen p-4 lg:p-6 relative z-10">
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
      <AIChatButton />
    </div>
  );
};

export default AppLayout;
