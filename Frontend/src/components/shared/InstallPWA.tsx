import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPWA = () => {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const installedHandler = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const onInstall = async () => {
    if (!deferred) {
      toast.info("Installation not available", {
        description: "Open this app in Chrome/Edge on a supported device, or use 'Add to Home Screen' on iOS Safari.",
      });
      return;
    }
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      toast.success("App installed! 🎉");
      setInstalled(true);
    }
    setDeferred(null);
  };

  if (installed) return null;

  return (
    <button
      onClick={onInstall}
      className="px-3 py-1.5 text-xs rounded-lg glass hover:bg-muted/40 transition-colors flex items-center gap-1.5 text-foreground"
    >
      <Download className="w-3.5 h-3.5" /> Install App
    </button>
  );
};

export default InstallPWA;
