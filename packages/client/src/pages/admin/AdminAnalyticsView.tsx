import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import {
  Users, ShieldCheck, Trophy, Building, TrendingUp, BarChart2, RefreshCw,
  ArrowUpRight, ArrowDownRight, Minus, Activity, Layers
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#E8672E', '#3FB65F', '#D89A3E', '#E0554E', '#6B6B70'];

type Range = '7d' | '30d' | '90d';

function StatCard({
  label, value, sub, trend, icon, onClick
}: { label: string; value: string | number; sub?: string; trend?: 'up' | 'down' | 'flat'; icon: React.ReactNode; onClick?: () => void }) {
  const trendColor = trend === 'up' ? 'text-[#3FB65F]' : trend === 'down' ? 'text-[#E0554E]' : 'text-[#6B6B70]';
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;
  return (
    <div
      onClick={onClick}
      className={`bg-[#17171A] border border-[#2A2A2E] rounded-xl p-5 hover:border-[#38383D] transition-colors ${onClick ? 'cursor-pointer group' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B6B70]">{label}</span>
        <div className="p-1.5 rounded-lg bg-[#1E1E22] text-[#6B6B70] group-hover:text-[#E8672E] transition-colors">{icon}</div>
      </div>
      <div className="text-3xl font-bold font-mono text-[#F5F5F4]">{value}</div>
      {sub && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-mono ${trendColor}`}>
          {trend && <TrendIcon className="w-3 h-3" />}
          <span>{sub}</span>
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E1E22] border border-[#2A2A2E] rounded-lg px-3 py-2 text-xs text-[#F5F5F4] font-mono shadow-xl">
      <p className="text-[#6B6B70] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
      ))}
    </div>
  );
};

export const AdminAnalyticsView: React.FC = () => {
  const [range, setRange] = useState<Range>('30d');
  const [data, setData] = useState<any>(null);
  const [impact, setImpact] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [analyticsRes, impactRes] = await Promise.all([
        adminService.getPlatformAnalytics(range),
        adminService.getImpactAnalysis(),
      ]);
      setData(analyticsRes);
      setImpact(impactRes);
    } catch {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [range]);

  const userGrowthData = (data?.charts?.userGrowth || []).map((r: any) => ({
    date: new Date(r.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: Number(r.count),
  }));

  const teamData = (data?.charts?.teamFormation || []).map((r: any) => ({
    date: new Date(r.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    teams: Number(r.count),
  }));

  const verificationPieData = (data?.charts?.verificationStats || []).map((r: any) => ({
    name: r.verification_status,
    value: Number(r.count),
  }));

  const summary = data?.summary || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#F5F5F4]">Platform Analytics</h1>
          <p className="text-xs text-[#6B6B70] mt-0.5 font-mono">Real-time growth, verification, and impact data</p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d'] as Range[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                range === r ? 'bg-[#241C16] text-[#E8672E] border border-[#E8672E]/40' : 'bg-[#17171A] border border-[#2A2A2E] text-[#A3A3A8] hover:text-[#F5F5F4]'
              }`}
            >{r}</button>
          ))}
          <button
            onClick={load}
            aria-label="Refresh analytics"
            className="p-1.5 rounded-lg bg-[#17171A] border border-[#2A2A2E] text-[#A3A3A8] hover:text-[#F5F5F4] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Users" value={summary.totalUsers ?? '—'} icon={<Users className="w-4 h-4" />} trend="up" sub={`${range} window`} />
        <StatCard label="Verified Skills" value={summary.totalVerifiedSkills ?? '—'} icon={<ShieldCheck className="w-4 h-4" />} trend="up" />
        <StatCard label="Hackathons" value={summary.totalHackathons ?? '—'} icon={<Trophy className="w-4 h-4" />} />
        <StatCard label="Teams" value={summary.totalTeams ?? '—'} icon={<Layers className="w-4 h-4" />} trend="up" />
        <StatCard label="Organizations" value={summary.totalOrganizations ?? '—'} icon={<Building className="w-4 h-4" />} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User Growth */}
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[#E8672E]" />
            <h3 className="text-sm font-semibold text-[#F5F5F4]">User Registrations</h3>
          </div>
          {userGrowthData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-[#6B6B70] font-mono">No data for this range</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8672E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E8672E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" />
                <XAxis dataKey="date" tick={{ fill: '#6B6B70', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis tick={{ fill: '#6B6B70', fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="users" name="Registrations" stroke="#E8672E" fill="url(#userGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Verification Breakdown */}
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-[#E8672E]" />
            <h3 className="text-sm font-semibold text-[#F5F5F4]">Skill Verification Status</h3>
          </div>
          {verificationPieData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-[#6B6B70] font-mono">No verification data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={verificationPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" nameKey="name">
                  {verificationPieData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#A3A3A8' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Team Formation */}
      <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-[#E8672E]" />
          <h3 className="text-sm font-semibold text-[#F5F5F4]">Team Formation Activity</h3>
        </div>
        {teamData.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-xs text-[#6B6B70] font-mono">No team data for this range</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={teamData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" />
              <XAxis dataKey="date" tick={{ fill: '#6B6B70', fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis tick={{ fill: '#6B6B70', fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="teams" name="Teams Created" fill="#E8672E" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Impact Section */}
      {impact && (
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[#F5F5F4] mb-4">Platform Impact Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#1E1E22] rounded-lg p-4 text-center">
              <p className="text-xs text-[#6B6B70] font-mono uppercase mb-1">Candidate Verification Rate</p>
              <p className="text-2xl font-bold text-[#E8672E] font-mono">{impact.verificationRate ?? '—'}%</p>
            </div>
            <div className="bg-[#1E1E22] rounded-lg p-4 text-center">
              <p className="text-xs text-[#6B6B70] font-mono uppercase mb-1">Org Verification Rate</p>
              <p className="text-2xl font-bold text-[#3FB65F] font-mono">{impact.orgVerificationRate ?? '—'}%</p>
            </div>
            <div className="bg-[#1E1E22] rounded-lg p-4 text-center">
              <p className="text-xs text-[#6B6B70] font-mono uppercase mb-1">Verified Skills</p>
              <p className="text-2xl font-bold text-[#F5F5F4] font-mono">{impact.candidates?.verified ?? '—'}</p>
            </div>
            <div className="bg-[#1E1E22] rounded-lg p-4 text-center">
              <p className="text-xs text-[#6B6B70] font-mono uppercase mb-1">Verified Orgs</p>
              <p className="text-2xl font-bold text-[#F5F5F4] font-mono">{impact.organizations?.verified ?? '—'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
