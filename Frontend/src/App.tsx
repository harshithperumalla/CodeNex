import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { PageTransitionProvider } from "@/contexts/PageTransitionContext";
import { ToastProvider, ToastContainer } from "@/components/toast";
import AppLayout from "@/components/layout/AppLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Problems from "./pages/Problems";
import CodingWorkspace from "./pages/CodingWorkspace";
import CodingArena from "./pages/CodingArena";
import Leaderboard from "./pages/Leaderboard";
import Badges from "./pages/Badges";
import Aptitude from "./pages/Aptitude";
import AptitudeCategory from "./pages/AptitudeCategory";
import AptitudeQuiz from "./pages/AptitudeQuiz";
import English from "./pages/English";
import Courses from "./pages/Courses";
import Games from "./pages/Games";
import Meetings from "./pages/Meetings";
import Mentors from "./pages/Mentors";
import NotFound from "./pages/NotFound";
import TypingTest from "./pages/TypingTest";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UserSuggestions from "./pages/Suggestions";
import ToastDemo from "@/components/toast/ToastDemo";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import CourseManagement from "./pages/admin/CourseManagement";
import PaymentMonitoring from "./pages/admin/PaymentMonitoring";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import Reviews from "./pages/admin/Reviews";
import Suggestions from "./pages/admin/Suggestions";
import MentorLayout from "./components/layout/MentorLayout";
import MentorDashboard from "./pages/mentor/MentorDashboard";
import VideoUploads from "./pages/mentor/VideoUploads";
import SessionScheduling from "./pages/mentor/SessionScheduling";
import StudentProgress from "./pages/mentor/StudentProgress";
import MentorProfile from "./pages/mentor/MentorProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ToastProvider>
        <Toaster />
        <Sonner />
        <ToastContainer />
        <BrowserRouter>
          <UserProvider>
          <PageTransitionProvider>
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mentor/login" element={<Login />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ai" element={<Navigate to="/dashboard" replace />} />
            <Route path="/codenex-ai" element={<Navigate to="/dashboard" replace />} />
            <Route path="/chat" element={<Navigate to="/dashboard" replace />} />
            <Route path="/coding" element={<Problems />} />
            <Route path="/coding/:id" element={<CodingWorkspace />} />
            <Route path="/arena" element={<CodingArena />} />
            <Route path="/aptitude" element={<Aptitude />} />
            <Route path="/aptitude/daily/quiz" element={<AptitudeQuiz />} />
            <Route path="/aptitude/:categoryId" element={<AptitudeCategory />} />
            <Route path="/aptitude/:categoryId/:conceptId/quiz" element={<AptitudeQuiz />} />
            <Route path="/english" element={<English />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/games" element={<Games />} />
            <Route path="/typing-test" element={<TypingTest />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/badges" element={<Badges />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/suggestions" element={<UserSuggestions />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/toast-demo" element={<ToastDemo />} />
          </Route>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/courses" element={<CourseManagement />} />
            <Route path="/admin/payments" element={<PaymentMonitoring />} />
            <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
            <Route path="/admin/reviews" element={<Reviews />} />
            <Route path="/admin/suggestions" element={<Suggestions />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>
          <Route element={<MentorLayout />}>
            <Route path="/mentor" element={<MentorDashboard />} />
            <Route path="/mentor/videos" element={<VideoUploads />} />
            <Route path="/mentor/sessions" element={<SessionScheduling />} />
            <Route path="/mentor/progress" element={<StudentProgress />} />
            <Route path="/mentor/profile" element={<MentorProfile />} />
            <Route path="/mentor/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        </PageTransitionProvider>
        </UserProvider>
      </BrowserRouter>
      </ToastProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
