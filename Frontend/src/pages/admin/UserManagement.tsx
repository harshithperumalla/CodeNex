import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, MoreVertical, UserPlus, Ban, CheckCircle, Mail, Shield, Trash2 } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import api from "@/services/api";

type User = {
  id: string; name: string; email: string; role: string;
  status: "active" | "inactive" | "suspended"; streak: number; points: number;
  joined: string; photoUrl: string | null; initials: string; suspendDays?: number;
  assignedMentor?: string | null;
};

const initialUsers: User[] = [];

const statusColor: Record<string, string> = {
  active: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
  suspended: "bg-rose-500/10 border-rose-500/30 text-rose-300",
  inactive: "bg-muted border-border text-muted-foreground",
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [suspendUser, setSuspendUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "student" });
  const [suspendDays, setSuspendDays] = useState(7);
  
  const [mentorsList, setMentorsList] = useState<any[]>([]);
  const [assignMentorUser, setAssignMentorUser] = useState<User | null>(null);
  const [selectedMentorId, setSelectedMentorId] = useState<string>("");

  const fetchUsers = async () => {
    try {
      const roleFilter = filter === "all" ? "" : filter === "student" ? "user" : filter;
      const res = await api.get(`/admin/users?role=${roleFilter}&search=${search}`);
      if (res.data.success) {
        const mapped = res.data.users.map((u: any) => {
          const rawAvatar = u.avatar || u.profileImageUrl || "";
          const isPhoto = Boolean(rawAvatar && (rawAvatar.startsWith("http://") || rawAvatar.startsWith("https://") || rawAvatar.startsWith("data:")));
          const initials = u.fullName
            ? u.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
            : "U";

          return {
            id: u.userId,
            name: u.fullName || u.name || "User",
            email: u.email,
            role: u.role,
            status: u.isActive ? "active" : "inactive",
            streak: u.streak || 0,
            points: u.points || 0,
            joined: u.joinDate || "2025-01-01",
            photoUrl: isPhoto ? rawAvatar : null,
            initials: isPhoto ? initials : (rawAvatar.length <= 3 && rawAvatar ? rawAvatar.toUpperCase() : initials),
            assignedMentor: u.assignedMentor,
          };
        });
        setUsers(mapped);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const fetchMentors = async () => {
    try {
      const res = await api.get("/admin/users?role=mentor");
      if (res.data.success) {
        setMentorsList(res.data.users);
      }
    } catch (err) {
      console.error("Failed to load mentors:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchMentors();
  }, [search, filter]);

  const filtered = users;

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const backendRole = newUser.role === "student" ? "user" : newUser.role;
      const res = await api.post("/admin/users", {
        fullName: newUser.name,
        email: newUser.email,
        role: backendRole,
      });
      if (res.data.success) {
        toast.success(`User ${newUser.name} added.`);
        setAddOpen(false);
        setNewUser({ name: "", email: "", role: "student" });
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add user");
    }
  };

  const assignMentor = async (userId: string, mentorId: string | null) => {
    try {
      const res = await api.put(`/admin/users/${userId}`, {
        assignedMentor: mentorId,
      });
      if (res.data.success) {
        toast.success("Mentor assignment updated successfully.");
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update mentor assignment");
    }
  };

  const toggleActive = async (u: User) => {
    try {
      const targetIsActive = u.status !== "active";
      const res = await api.put(`/admin/users/${u.id}`, {
        isActive: targetIsActive,
      });
      if (res.data.success) {
        toast.success(`${u.name} status updated.`);
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update user");
    }
  };

  const confirmSuspend = async () => {
    if (!suspendUser) return;
    try {
      const res = await api.put(`/admin/users/${suspendUser.id}`, {
        isActive: false,
      });
      if (res.data.success) {
        toast.error(`${suspendUser.name} suspended.`);
        setSuspendUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to suspend user");
    }
  };

  const removeUser = async (u: User) => {
    try {
      const res = await api.delete(`/admin/users/${u.id}`);
      if (res.data.success) {
        toast.success(`${u.name} deleted.`);
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">User <span className="gradient-text">Management</span></h1>
          <p className="text-sm text-muted-foreground">{users.length} registered users</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gradient-primary text-primary-foreground gap-2">
          <UserPlus className="w-4 h-4" /> Add User
        </Button>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-muted/50 border-border" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "student", "mentor", "active", "suspended"].map(f => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className={filter === f ? "gradient-primary text-primary-foreground" : ""}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <GlassCard className="overflow-hidden" tilt={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Mentor</th>
                <th className="text-left p-4 hidden md:table-cell">Streak</th>
                <th className="text-left p-4 hidden md:table-cell">Points</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4 min-w-[240px] max-w-[320px] whitespace-nowrap">
                    <div className="flex items-center gap-3 min-w-0">
                      {user.photoUrl ? (
                        <img
                          src={user.photoUrl}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/10 shadow-md bg-slate-800"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0 shadow-md">
                          {user.initials}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate block leading-tight" title={user.name}>
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate block leading-tight mt-0.5" title={user.email}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className={user.role === "mentor" ? "border-secondary text-secondary" : "border-primary text-primary"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${statusColor[user.status]}`}>
                      {user.status}{user.status === "suspended" && user.suspendDays ? ` · ${user.suspendDays}d` : ""}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.role === "student" ? (
                      <span className="text-xs font-semibold text-cyan-300">
                        {mentorsList.find(m => m.userId === user.assignedMentor)?.fullName || "Unassigned"}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-sm">{user.streak > 0 ? `🔥 ${user.streak}` : '—'}</span>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-sm font-mono text-foreground">{user.points.toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8"><MoreVertical className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-xl border-border">
                        <DropdownMenuItem onClick={() => toast(`Email sent to ${user.email}`)} className="gap-2"><Mail className="w-4 h-4" /> Email</DropdownMenuItem>
                        {user.role === "student" && (
                          <DropdownMenuItem
                            onClick={() => {
                              setAssignMentorUser(user);
                              setSelectedMentorId(user.assignedMentor || "");
                            }}
                            className="gap-2"
                          >
                            <Shield className="w-4 h-4" /> Assign Mentor
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => toggleActive(user)} className="gap-2">
                          <CheckCircle className="w-4 h-4" /> {user.status === "active" ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSuspendUser(user)} className="gap-2"><Ban className="w-4 h-4" /> Suspend</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => removeUser(user)} className="gap-2 text-destructive"><Trash2 className="w-4 h-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Add user dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new platform account.</DialogDescription>
          </DialogHeader>
          <form onSubmit={addUser} className="space-y-4">
            <div><Label>Name</Label><Input required value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className="mt-1" /></div>
            <div><Label>Email</Label><Input required type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="mt-1" /></div>
            <div>
              <Label>Role</Label>
              <div className="flex gap-2 mt-1">
                {["student", "mentor", "admin"].map(r => (
                  <Button type="button" key={r} variant={newUser.role === r ? "default" : "outline"} size="sm" onClick={() => setNewUser({ ...newUser, role: r })}
                    className={newUser.role === r ? "gradient-primary text-primary-foreground" : ""}>{r}</Button>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground gap-2"><CheckCircle className="h-4 w-4" /> Add User</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Suspend dialog */}
      <Dialog open={!!suspendUser} onOpenChange={(o) => !o && setSuspendUser(null)}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10">
          <DialogHeader>
            <DialogTitle>Suspend {suspendUser?.name}</DialogTitle>
            <DialogDescription>Choose suspension duration in days.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 7, 14, 30, 60, 90, 365].map(d => (
                <Button key={d} variant={suspendDays === d ? "default" : "outline"} onClick={() => setSuspendDays(d)}
                  className={suspendDays === d ? "gradient-primary text-primary-foreground" : ""}>{d}d</Button>
              ))}
            </div>
            <Input type="number" min={1} value={suspendDays} onChange={e => setSuspendDays(Number(e.target.value) || 1)} />
            <Button onClick={confirmSuspend} className="w-full bg-rose-500 hover:bg-rose-600 text-white gap-2">
              <Ban className="h-4 w-4" /> Suspend for {suspendDays} day{suspendDays > 1 ? "s" : ""}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Mentor Dialog */}
      <Dialog open={!!assignMentorUser} onOpenChange={(o) => !o && setAssignMentorUser(null)}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10">
          <DialogHeader>
            <DialogTitle>Assign Mentor to {assignMentorUser?.name}</DialogTitle>
            <DialogDescription>Select a mentor to assign to this student.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Select Mentor</Label>
              <select
                className="w-full p-2 rounded-md bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
              >
                <option value="">None (Unassigned)</option>
                {mentorsList.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.fullName} ({m.email})
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={() => {
                if (assignMentorUser) {
                  assignMentor(assignMentorUser.id, selectedMentorId || null);
                  setAssignMentorUser(null);
                }
              }}
              className="w-full gradient-primary text-primary-foreground gap-2"
            >
              <CheckCircle className="h-4 w-4" /> Save Assignment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
