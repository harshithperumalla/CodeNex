import { motion } from "framer-motion";
import { IndianRupee, TrendingUp, ArrowUpRight, ArrowDownRight, CheckCircle, Clock, XCircle, CreditCard } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import GlassCard from "@/components/shared/GlassCard";
import { Badge } from "@/components/ui/badge";

const paymentStats = [
  { label: "Total Revenue", value: "₹24,56,800", change: "+23%", up: true, icon: IndianRupee },
  { label: "This Month", value: "₹4,82,300", change: "+18%", up: true, icon: TrendingUp },
  { label: "Pending", value: "₹12,400", change: "-5%", up: false, icon: Clock },
  { label: "Refunds", value: "₹8,200", change: "+2%", up: true, icon: CreditCard },
];

const dailyRevenue = [
  { day: "Mon", amount: 42000 }, { day: "Tue", amount: 58000 }, { day: "Wed", amount: 35000 },
  { day: "Thu", amount: 72000 }, { day: "Fri", amount: 61000 }, { day: "Sat", amount: 89000 },
  { day: "Sun", amount: 54000 },
];

const methodData = [
  { name: "UPI", value: 45, color: "hsl(265 90% 60%)" },
  { name: "Card", value: 30, color: "hsl(195 100% 50%)" },
  { name: "Net Banking", value: 15, color: "hsl(330 90% 60%)" },
  { name: "Wallet", value: 10, color: "hsl(145 80% 50%)" },
];

const transactions = [
  { id: "TXN001", user: "Rahul Sharma", course: "Advanced DSA", amount: 1999, status: "success", method: "UPI", time: "Today, 2:30 PM" },
  { id: "TXN002", user: "Ananya Gupta", course: "React Masterclass", amount: 2499, status: "success", method: "Card", time: "Today, 1:15 PM" },
  { id: "TXN003", user: "Karthik Nair", course: "Python DS", amount: 1499, status: "pending", method: "Net Banking", time: "Today, 12:45 PM" },
  { id: "TXN004", user: "Meera Joshi", course: "Communication Pro", amount: 999, status: "success", method: "UPI", time: "Today, 11:30 AM" },
  { id: "TXN005", user: "Sneha Reddy", course: "Aptitude Crash", amount: 799, status: "failed", method: "Card", time: "Today, 10:00 AM" },
  { id: "TXN006", user: "Vikram Singh", course: "System Design", amount: 3999, status: "success", method: "UPI", time: "Yesterday, 8:00 PM" },
];

const statusIcons: Record<string, typeof CheckCircle> = { success: CheckCircle, pending: Clock, failed: XCircle };
const statusStyles: Record<string, string> = {
  success: "text-neon-green", pending: "text-neon-yellow", failed: "text-destructive"
};

const PaymentMonitoring = () => (
  <div className="max-w-7xl mx-auto space-y-6">
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold">Payment <span className="gradient-text">Monitoring</span></h1>
      <p className="text-sm text-muted-foreground">Track revenue, transactions & payment health</p>
    </motion.div>

    {/* Stats */}
    <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
      {paymentStats.map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }}>
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-3">
              <s.icon className="w-5 h-5 text-primary" />
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${s.up ? '' : 'text-destructive'}`} style={s.up ? { color: 'hsl(145 80% 50%)' } : {}}>
                {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{s.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </GlassCard>
        </motion.div>
      ))}
    </motion.div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Daily Revenue (This Week)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={dailyRevenue}>
              <defs>
                <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(145 80% 50%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(145 80% 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 18%)" />
              <XAxis dataKey="day" stroke="hsl(220 15% 55%)" fontSize={12} />
              <YAxis stroke="hsl(220 15% 55%)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(230 25% 11%)', border: '1px solid hsl(230 20% 22%)', borderRadius: '8px', color: 'hsl(210 40% 96%)' }} />
              <Area type="monotone" dataKey="amount" stroke="hsl(145 80% 50%)" fill="url(#payGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <GlassCard className="p-5 h-full">
          <h3 className="text-sm font-semibold text-foreground mb-4">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={methodData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                {methodData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(230 25% 11%)', border: '1px solid hsl(230 20% 22%)', borderRadius: '8px', color: 'hsl(210 40% 96%)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {methodData.map(m => (
              <span key={m.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />{m.name} ({m.value}%)
              </span>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>

    {/* Transactions */}
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <GlassCard className="overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left p-4">ID</th>
                <th className="text-left p-4">User</th>
                <th className="text-left p-4 hidden md:table-cell">Course</th>
                <th className="text-left p-4">Amount</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4 hidden lg:table-cell">Method</th>
                <th className="text-left p-4 hidden lg:table-cell">Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => {
                const Icon = statusIcons[tx.status];
                return (
                  <motion.tr key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.05 }} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono text-xs text-muted-foreground">{tx.id}</td>
                    <td className="p-4 text-sm text-foreground">{tx.user}</td>
                    <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{tx.course}</td>
                    <td className="p-4 text-sm font-semibold text-foreground">₹{tx.amount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1.5 text-xs ${statusStyles[tx.status]}`} style={tx.status === 'success' ? { color: 'hsl(145 80% 50%)' } : tx.status === 'pending' ? { color: 'hsl(45 100% 55%)' } : {}}>
                        <Icon className="w-3.5 h-3.5" />{tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground hidden lg:table-cell">{tx.method}</td>
                    <td className="p-4 text-xs text-muted-foreground hidden lg:table-cell">{tx.time}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </motion.div>
  </div>
);

export default PaymentMonitoring;
