import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Eye, EyeOff, Shield, GraduationCap, UserCheck } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { useUser } from "@/contexts/UserContext";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setIsAuthenticated, setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine portal role from route path
  const isMentorPortal = location.pathname === "/mentor/login";
  const isAdminPortal = location.pathname === "/admin/login";
  const portalRole = isAdminPortal ? "admin" : isMentorPortal ? "mentor" : "user";
  const portalTitle = isAdminPortal ? "Admin Portal" : isMentorPortal ? "Mentor Portal" : "Student Login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password,
        portalRole,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("role", res.data.role);

      setUser(res.data.user);
      setIsAuthenticated(true);

      toast.success("Login successful!");

      if (res.data.role === "admin") {
        navigate("/admin");
      } else if (res.data.role === "mentor") {
        navigate("/mentor");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        (err?.message === "Network Error"
          ? "Network Error: Could not connect to backend server."
          : err?.message) ||
        "Invalid email or password";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            CodeNex
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center justify-center gap-1.5 font-medium">
            {isAdminPortal ? (
              <Shield className="w-4 h-4 text-accent" />
            ) : isMentorPortal ? (
              <GraduationCap className="w-4 h-4 text-secondary" />
            ) : (
              <UserCheck className="w-4 h-4 text-primary" />
            )}
            {portalTitle}
          </p>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-foreground">
              Sign In
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={loading}
              >
                <LogIn className="w-4 h-4" />
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <GoogleSignInButton portalRole={portalRole} />

            <div className="mt-6 pt-4 border-t border-border/40 text-center space-y-2 text-xs">
              {!isAdminPortal && !isMentorPortal && (
                <p className="text-sm text-muted-foreground mb-3">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign Up
                  </Link>
                </p>
              )}

              <div className="flex items-center justify-center gap-4 text-muted-foreground">
                {!isAdminPortal && (
                  <Link to="/admin/login" className="hover:text-accent flex items-center gap-1 transition-colors">
                    <Shield className="w-3 h-3" /> Admin Portal
                  </Link>
                )}
                {!isMentorPortal && (
                  <Link to="/mentor/login" className="hover:text-secondary flex items-center gap-1 transition-colors">
                    <GraduationCap className="w-3 h-3" /> Mentor Portal
                  </Link>
                )}
                {(isAdminPortal || isMentorPortal) && (
                  <Link to="/login" className="hover:text-primary flex items-center gap-1 transition-colors">
                    <UserCheck className="w-3 h-3" /> Student Portal
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;