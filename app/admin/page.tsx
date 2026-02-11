'use client';


import { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  DollarSign, 
  Clock,
  Activity,
  Calendar,
  Zap,
  ArrowUpRight,
  Target,
} from 'lucide-react';
import {
  mockDashboardStats,
  mockProjects,
  mockPayments,
  mockMessages,
  mockClients,
  mockCouncilApplications,
} from '@/app/lib/mock-data';


export default function DashboardPage() {
  
  const stats = mockDashboardStats;
  const recentProjects = mockProjects.slice(0, 5);
  const recentPayments = mockPayments.slice(0, 5);
  const unreadMessages = mockMessages.filter(m => !m.read);

  // Calculate analytics
  const projectsByStatus = {
    pending: mockProjects.filter(p => p.status === 'pending').length,
    inReview: mockProjects.filter(p => p.status === 'in_review').length,
    docsReceived: mockProjects.filter(p => p.status === 'docs_received').length,
    inProgress: mockProjects.filter(p => ['architect_assigned', 'measurements_done', 'drawings_in_progress', 'drawings_received'].includes(p.status)).length,
    submitted: mockProjects.filter(p => p.status === 'submitted_to_council').length,
    approved: mockProjects.filter(p => p.status === 'approved').length,
  };

  const paymentsByStatus = {
    completed: mockPayments.filter(p => p.status === 'completed').length,
    pending: mockPayments.filter(p => p.status === 'pending').length,
    failed: mockPayments.filter(p => p.status === 'failed').length,
    refunded: mockPayments.filter(p => p.status === 'refunded').length,
  };

  const clientsByStatus = {
    registered: mockClients.filter(p => p.status === 'registered').length,
    docsUploaded: mockClients.filter(p => p.status === 'docs_uploaded').length,
    reviewed: mockClients.filter(p => p.status === 'reviewed').length,
    approved: mockClients.filter(p => p.status === 'approved').length,
  };

  const councilByStatus = {
    draft: mockCouncilApplications.filter(a => a.status === 'draft').length,
    submitted: mockCouncilApplications.filter(a => a.status === 'submitted').length,
    underReview: mockCouncilApplications.filter(a => a.status === 'under_review').length,
    approved: mockCouncilApplications.filter(a => a.status === 'approved').length,
  };

  const avgProjectProgress = Math.round(
    mockProjects.reduce((sum, p) => sum + p.progress, 0) / mockProjects.length
  );

  const averagePaymentAmount = Math.round(
    mockPayments.reduce((sum, p) => sum + p.amount, 0) / mockPayments.length
  );

  const this30Days = mockProjects.filter(p => {
    const createdDate = new Date(p.createdDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate >= thirtyDaysAgo;
  }).length;

  // Helper: last N months labels
  const getLastNMonths = (n: number) => {
    const months: string[] = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleString('default', { month: 'short', year: 'numeric' }));
    }
    return months;
  };

  const last6 = getLastNMonths(6);

  // Revenue by month (last 6 months)
  const paymentsByMonth = last6.map(label => {
    const [monthName, year] = label.split(' ');
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
    const yearNum = parseInt(year, 10);
    const total = mockPayments
      .filter(p => {
        const d = new Date(p.paymentDate);
        return d.getFullYear() === yearNum && d.getMonth() === monthIndex;
      })
      .reduce((sum, p) => sum + p.amount, 0);
    return { label, value: total };
  });

  // Projects created by month (last 6 months)
  const projectsByMonth = last6.map(label => {
    const [monthName, year] = label.split(' ');
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
    const yearNum = parseInt(year, 10);
    const count = mockProjects.filter(p => {
      const d = new Date(p.createdDate);
      return d.getFullYear() === yearNum && d.getMonth() === monthIndex;
    }).length;
    return { label, value: count };
  });

  const [showTrends, setShowTrends] = useState(false);

  // Small PieChart and BarChart components (compact, lightweight SVG)
  const PieChart = ({ data, title }: { data: Array<{ label: string; value: number; color: string }>; title: string }) => {
    const total = data.reduce((s, i) => s + i.value, 0) || 1;
    let cumulative = 0;
    const slices = data.map(item => {
      const percentage = (item.value / total) * 100;
      const start = (cumulative / 100) * 360;
      cumulative += percentage;
      const end = (cumulative / 100) * 360;
      return { ...item, percentage, start, end };
    });

    return (
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <h3 className="text-sm font-medium text-slate-800 mb-3">{title}</h3>
        <div className="flex items-center gap-4">
          <svg width="96" height="96" viewBox="0 0 120 120" className="flex-shrink-0">
            {slices.map((s, i) => {
              const sa = (s.start * Math.PI) / 180;
              const ea = (s.end * Math.PI) / 180;
              const x1 = 60 + 36 * Math.cos(sa);
              const y1 = 60 + 36 * Math.sin(sa);
              const x2 = 60 + 36 * Math.cos(ea);
              const y2 = 60 + 36 * Math.sin(ea);
              const large = s.percentage > 50 ? 1 : 0;
              const d = `M 60 60 L ${x1} ${y1} A 36 36 0 ${large} 1 ${x2} ${y2} Z`;
              return <path key={i} d={d} fill={s.color} />;
            })}
          </svg>
          <div className="text-xs text-slate-700 space-y-2">
            {data.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <div className="truncate w-36">{d.label}</div>
                {/* <div className="font-medium text-slate-900">{d.value}</div> */}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const BarChart = ({ data, title, height = 140 }: { data: Array<{ label: string; value: number }>; title: string; height?: number }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    const barH = height - 40;
    return (
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <h3 className="text-sm font-medium text-slate-800 mb-3">{title}</h3>
        <div className="flex items-end gap-2" style={{ height: barH }}>
          {data.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full rounded-t bg-gradient-to-t from-blue-500 to-blue-400" style={{ height: `${(d.value / max) * barH}px` }} title={`${d.label}: ${d.value}`} />
              <div className="text-xs text-slate-500 mt-2 truncate w-full text-center">{d.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Build compact arrays for small charts
  const projectStatus = [
    { label: 'Pending', value: projectsByStatus.pending, color: '#f59e0b' },
    { label: 'In Review', value: projectsByStatus.inReview, color: '#eab308' },
    { label: 'In Progress', value: projectsByStatus.inProgress, color: '#3b82f6' },
    { label: 'Approved', value: projectsByStatus.approved, color: '#10b981' },
  ];

  const paymentStatusArr = [
    { label: 'Completed', value: paymentsByStatus.completed, color: '#10b981' },
    { label: 'Pending', value: paymentsByStatus.pending, color: '#f59e0b' },
    { label: 'Failed', value: paymentsByStatus.failed, color: '#ef4444' },
  ];

  const revenue = paymentsByMonth.map(p => ({ label: p.label.split(' ')[0], value: p.value }));
  const projectsMonthly = projectsByMonth.map(p => ({ label: p.label.split(' ')[0], value: p.value }));

  // derive simple upcoming deadlines from nearest estimated completion
  const upcomingDeadlines = mockProjects
    .map(p => ({ id: p.id, title: p.title, due: new Date(p.estimatedCompletionDate) }))
    .sort((a, b) => +a.due - +b.due)
    .slice(0, 3)
    .map(d => {
      const daysLeft = Math.max(0, Math.ceil((+d.due - +new Date()) / (1000 * 60 * 60 * 24)));
      return { ...d, daysLeft, priority: daysLeft <= 3 ? 'high' : daysLeft <= 10 ? 'medium' : 'low' };
    });

  const recentActivity = mockMessages.slice(0, 4).map(m => ({ id: m.id, title: m.subject, client: m.from, time: 'recent', icon: Clock, color: 'text-slate-600' }));

  return (
    <div className="max-w-8xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview — smart, compact and actionable</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-start justify-between mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-xs text-slate-500">+{projectsByMonth.reduce((a,b)=>a+b.value,0)} this 6m</div>
          </div>
          <div className="text-lg font-bold text-slate-900">{stats.totalProjects}</div>
          <div className="text-xs text-slate-500">Projects</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-start justify-between mb-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-xs text-slate-500">Active</div>
          </div>
          <div className="text-lg font-bold text-slate-900">{stats.activeProjects}</div>
          <div className="text-xs text-slate-500">Active projects</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-start justify-between mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-xs text-slate-500">Clients</div>
          </div>
          <div className="text-lg font-bold text-slate-900">{stats.totalClients}</div>
          <div className="text-xs text-slate-500">Active clients</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-start justify-between mb-2">
            <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-rose-600" />
            </div>
            <div className="text-xs text-slate-500">Revenue</div>
          </div>
          <div className="text-lg font-bold text-slate-900">£{stats.totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Total revenue</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        <PieChart data={projectStatus} title="Project Status" />
        <PieChart data={paymentStatusArr} title="Payment Status" />
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6 text-emerald-300" />
              <ArrowUpRight className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="text-2xl font-semibold">£{paymentsByMonth.reduce((s,p)=>s+p.value,0)}</div>
            <div className="text-xs text-slate-200">This period</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <h3 className="text-sm font-medium text-slate-800 mb-3">Performance</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><div className="text-slate-600">Avg progress</div><div className="font-medium">{avgProjectProgress}%</div></div>
              <div className="flex justify-between"><div className="text-slate-600">Avg payment</div><div className="font-medium">£{averagePaymentAmount}</div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <BarChart data={revenue} title="Revenue (6m)" />
        <BarChart data={projectsMonthly} title="Projects Created (6m)" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-bold text-blue-900">Recent Projects</h3>
            </div>
            <a href="/admin/projects" className="text-xs text-blue-700 hover:text-blue-900 font-semibold">View all</a>
          </div>
          <div className="space-y-2">
            {recentProjects.map(p => (
              <div key={p.id} className="bg-white rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-2">
                  <div className="truncate flex-1">
                    <div className="font-semibold text-slate-900 text-sm">{p.title}</div>
                    <div className="text-xs text-slate-500">{p.clientName}</div>
                  </div>
                  <div className="text-xs font-bold text-blue-600 ml-2">{p.progress}%</div>
                </div>
                <div className="w-full h-1.5 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-300 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-bold text-amber-900">Upcoming Deadlines</h3>
            </div>
            <a href="#" className="text-xs text-amber-700 hover:text-amber-900 font-semibold">View all</a>
          </div>
          <div className="space-y-2">
            {upcomingDeadlines.map(d => (
              <div key={d.id} className={`p-3 rounded-lg border-l-4 ${
                d.priority === 'high' 
                  ? 'bg-red-50 border-l-red-500 hover:bg-red-100' 
                  : d.priority === 'medium' 
                  ? 'bg-amber-50 border-l-amber-500 hover:bg-amber-100' 
                  : 'bg-emerald-50 border-l-emerald-500 hover:bg-emerald-100'
              } transition-colors cursor-pointer`}>
                <div className="flex justify-between items-start">
                  <div className="truncate flex-1">
                    <div className="font-semibold text-slate-900 text-sm">{d.title}</div>
                    <div className={`text-xs font-medium mt-1 ${
                      d.priority === 'high' ? 'text-red-700' : d.priority === 'medium' ? 'text-amber-700' : 'text-emerald-700'
                    }`}>Due in {d.daysLeft} day{d.daysLeft !== 1 ? 's' : ''}</div>
                  </div>
                  <div className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                    d.priority === 'high' ? 'bg-red-200 text-red-800' : d.priority === 'medium' ? 'bg-amber-200 text-amber-800' : 'bg-emerald-200 text-emerald-800'
                  }`}>{d.priority === 'high' ? '🔴' : d.priority === 'medium' ? '🟡' : '🟢'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-white">Recent Activity</h3>
          </div>
          <a href="#" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">View all</a>
        </div>
        <div className="space-y-2">
          {recentActivity.map((a, idx) => {
            const activityColors = [
              'from-blue-500 to-blue-600',
              'from-emerald-500 to-emerald-600',
              'from-purple-500 to-purple-600',
              'from-orange-500 to-orange-600',
            ];
            const colors = activityColors[idx % activityColors.length];
            return (
              <div key={a.id} className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-3 hover:from-slate-700 hover:to-slate-600 transition-all cursor-pointer border border-slate-600">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors} flex items-center justify-center flex-shrink-0`}>
                      <a.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="truncate min-w-0 flex-1">
                      <div className="text-sm font-semibold text-white truncate">{a.title}</div>
                      <div className="text-xs text-slate-400 truncate">{a.client}</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 whitespace-nowrap flex-shrink-0">{a.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>


    </div>
  );
}
