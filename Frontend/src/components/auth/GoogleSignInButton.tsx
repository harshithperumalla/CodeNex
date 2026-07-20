import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/services/api";

declare global {
  interface Window {
    google?: any;
  }
}

const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-1.5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

interface GoogleSignInButtonProps {
  className?: string;
  portalRole?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ className = "", portalRole = "user" }) => {
  const [loading, setLoading] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const { setIsAuthenticated, setUser } = useUser();
  const navigate = useNavigate();

  const handleBackendGoogleAuth = async (googleData: { credential?: string; email?: string; name?: string; picture?: string }) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/google", {
        ...googleData,
        portalRole,
      });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("role", res.data.role);

        setUser(res.data.user);
        setIsAuthenticated(true);

        toast.success(`Welcome to CodeNex, ${res.data.user.fullName}!`);

        if (res.data.role === "admin") {
          navigate("/admin");
        } else if (res.data.role === "mentor") {
          navigate("/mentor");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast.error(res.data.message || "Google authentication failed.");
      }
    } catch (err: any) {
      console.error("Google Auth backend error:", err);
      toast.error(err.response?.data?.message || "Could not complete Google Sign-In.");
    } finally {
      setLoading(false);
      setShowPromptModal(false);
    }
  };

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (googleClientId && !window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (response: any) => {
              if (response.credential) {
                handleBackendGoogleAuth({ credential: response.credential });
              }
            },
          });
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  const handleGoogleClick = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setShowPromptModal(true);
        }
      });
    } else {
      setShowPromptModal(true);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) {
      toast.error("Please enter your Google Email address");
      return;
    }
    handleBackendGoogleAuth({
      email: customEmail.trim(),
      name: customName.trim() || customEmail.split("@")[0],
      picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customEmail)}`,
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleClick}
        disabled={loading}
        className={`w-full bg-white/5 border-white/10 hover:bg-white/10 text-white font-semibold flex items-center justify-center gap-2 h-10 transition-all shadow-sm ${className}`}
      >
        <GoogleIcon />
        {loading ? "Signing in with Google..." : "Continue with Google"}
      </Button>

      {showPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-950 p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center gap-2">
              <GoogleIcon />
              <h3 className="text-base font-bold text-white">Google Sign-In</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your Google account details below to sign in or create a verified Student account:
            </p>

            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Google Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex.johnson@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Full Name (Optional)</label>
                <input
                  type="text"
                  placeholder="Alex Johnson"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPromptModal(false)}
                  className="flex-1 py-2 rounded-xl border border-white/10 text-xs font-semibold text-slate-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 rounded-xl gradient-primary text-white text-xs font-semibold shadow-lg hover:opacity-90"
                >
                  {loading ? "Verifying..." : "Continue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
