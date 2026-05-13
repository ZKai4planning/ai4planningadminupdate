import {
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  Activity,
  ArrowUpRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Target,
  Zap,
} from 'lucide-react';

const PieChart = ({
  data,
  title,
}: {
  data: Array<{ label: string; value: number; color: string }>;
  title: string;
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;
  const slices = data.map((item) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const startAngle = (cumulativePercentage / 100) * 360;
    const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
    cumulativePercentage += percentage;
    return { ...item, percentage, startAngle, endAngle };
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-800">{title}</h3>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <svg width="120" height="120" viewBox="0 0 120 120" className="shrink-0">
          {slices.map((slice, idx) => {
            const startRad = (slice.startAngle * Math.PI) / 180;
            const endRad = (slice.endAngle * Math.PI) / 180;
            const x1 = 60 + 45 * Math.cos(startRad);
            const y1 = 60 + 45 * Math.sin(startRad);
            const x2 = 60 + 45 * Math.cos(endRad);
            const y2 = 60 + 45 * Math.sin(endRad);
            const largeArc = slice.percentage > 50 ? 1 : 0;
            const pathData = `M 60 60 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`;

            return (
              <path
                key={idx}
                d={pathData}
                fill={slice.color}
                className="transition-opacity hover:opacity-80"
              />
            );
          })}
        </svg>
        <div className="w-full space-y-2 sm:w-auto sm:min-w-[160px]">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-slate-600">{item.label}</span>
              <span className="ml-auto text-xs font-semibold text-slate-800 sm:ml-0">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BarChart = ({
  data,
  title,
  height = 200,
}: {
  data: Array<{ label: string; value: number }>;
  title: string;
  height?: number;
}) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  const barHeight = height - 60;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-800">{title}</h3>
      <div className="overflow-x-auto">
        <div
          className="flex min-w-[340px] items-end justify-between gap-2 sm:min-w-0"
          style={{ height: barHeight }}
        >
          {data.map((item, idx) => (
            <div key={idx} className="flex flex-1 flex-col items-center">
              <div
                className="w-full rounded-t bg-gradient-to-t from-blue-500 to-blue-400 transition-all hover:shadow-lg"
                style={{ height: `${(item.value / max) * barHeight}px`, cursor: 'pointer' }}
                title={`${item.label}: ${item.value}`}
              />
              <span className="mt-2 w-full truncate text-center text-xs text-slate-600">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const stats = [
    {
      label: 'Total Revenue',
      value: 'GBP 124,500',
      change: '+12.5%',
      icon: DollarSign,
      color: 'from-blue-50 to-transparent',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Active Projects',
      value: '28',
      change: '+8',
      icon: FileText,
      color: 'from-emerald-50 to-transparent',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Total Clients',
      value: '156',
      change: '+23',
      icon: Users,
      color: 'from-amber-50 to-transparent',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Completion Rate',
      value: '94%',
      change: '+2.3%',
      icon: Activity,
      color: 'from-rose-50 to-transparent',
      iconColor: 'text-rose-600',
    },
  ];

  const projectStatus = [
    { label: 'In Progress', value: 18, color: '#3b82f6' },
    { label: 'Pending Review', value: 12, color: '#f59e0b' },
    { label: 'Completed', value: 84, color: '#10b981' },
    { label: 'On Hold', value: 5, color: '#ef4444' },
  ];

  const paymentStatus = [
    { label: 'Completed', value: 142, color: '#10b981' },
    { label: 'Pending', value: 28, color: '#f59e0b' },
    { label: 'Failed', value: 4, color: '#ef4444' },
  ];

  const revenueByMonth = [
    { label: 'Jan', value: 18 },
    { label: 'Feb', value: 24 },
    { label: 'Mar', value: 31 },
    { label: 'Apr', value: 28 },
    { label: 'May', value: 35 },
    { label: 'Jun', value: 42 },
  ];

  const projectsByMonth = [
    { label: 'Jan', value: 8 },
    { label: 'Feb', value: 12 },
    { label: 'Mar', value: 15 },
    { label: 'Apr', value: 14 },
    { label: 'May', value: 18 },
    { label: 'Jun', value: 16 },
  ];

  const recentProjects = [
    {
      id: 1,
      title: 'Modern Office Complex',
      client: 'Tech Corp Ltd',
      progress: 78,
      status: 'in_progress',
      dueDate: '15 Mar 2024',
    },
    {
      id: 2,
      title: 'Residential Building',
      client: 'Urban Homes',
      progress: 45,
      status: 'in_progress',
      dueDate: '22 Apr 2024',
    },
    {
      id: 3,
      title: 'Retail Space',
      client: 'Commerce Inc',
      progress: 92,
      status: 'in_review',
      dueDate: '08 Mar 2024',
    },
    {
      id: 4,
      title: 'Community Center',
      client: 'Local Council',
      progress: 60,
      status: 'in_progress',
      dueDate: '30 May 2024',
    },
  ];

  const upcomingDeadlines = [
    { id: 1, title: 'Submit Plans - Retail Space', daysLeft: 2, priority: 'high' },
    { id: 2, title: 'Client Review - Office Complex', daysLeft: 5, priority: 'medium' },
    { id: 3, title: 'Final Approval - Residential', daysLeft: 12, priority: 'low' },
  ];

  const recentActivity = [
    {
      id: 1,
      title: 'Planning Application Approved',
      client: 'Sarah Johnson',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-emerald-600',
    },
    {
      id: 2,
      title: 'New Project Started',
      client: 'Michael Brown',
      time: '5 hours ago',
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      id: 3,
      title: 'Payment Received',
      client: 'Emma Wilson',
      time: '1 day ago',
      icon: DollarSign,
      color: 'text-emerald-600',
    },
    {
      id: 4,
      title: 'Documents Pending',
      client: 'James Davis',
      time: '2 days ago',
      icon: Clock,
      color: 'text-amber-600',
    },
  ];

  const statusColors = {
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
    in_review: 'bg-amber-50 text-amber-700 border-amber-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-3 pb-6 pt-4 sm:px-4 md:space-y-8 md:px-6 md:pt-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome back, here&apos;s your overview.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`rounded-xl border border-slate-200 bg-gradient-to-br ${stat.color} p-4 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md sm:p-5`}
            >
              <div className="mb-4 flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                  {stat.change}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-semibold text-slate-800">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <PieChart data={projectStatus} title="Project Status Breakdown" />
        <PieChart data={paymentStatus} title="Payment Status" />

        <div className="space-y-4">
          <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 p-5 text-white shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <TrendingUp className="h-8 w-8 text-emerald-400" />
              <ArrowUpRight className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="mb-1 text-3xl font-semibold">GBP 24,800</p>
            <p className="mb-4 text-sm text-slate-300">This Month</p>
            <div className="border-t border-slate-600 pt-4">
              <p className="text-xs text-slate-400">+18% from last month</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Performance</h3>
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-slate-600">Client Satisfaction</span>
                  <span className="text-xs font-semibold text-slate-800">98%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: '98%' }} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-slate-600">On-time Delivery</span>
                  <span className="text-xs font-semibold text-slate-800">92%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarChart data={revenueByMonth} title="Revenue Trend (Last 6 Months)" />
        <BarChart data={projectsByMonth} title="Projects Created (Last 6 Months)" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800 sm:text-lg">
              <Target className="h-5 w-5 text-blue-600" />
              Recent Projects
            </h2>
            <button className="text-sm text-slate-500 transition-colors hover:text-slate-700">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-lg border border-slate-100 p-4 transition-colors hover:border-slate-200"
              >
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{project.title}</p>
                    <p className="text-xs text-slate-500">{project.client}</p>
                  </div>
                  <span
                    className={`inline-flex w-fit rounded-full border px-2 py-1 text-xs ${statusColors[project.status as keyof typeof statusColors]}`}
                  >
                    {project.status === 'in_progress'
                      ? 'In Progress'
                      : project.status === 'in_review'
                      ? 'In Review'
                      : 'Completed'}
                  </span>
                </div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="h-2 w-full rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-700">{project.progress}%</span>
                </div>
                <p className="text-xs text-slate-500">Due: {project.dueDate}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800 sm:text-lg">
              <Calendar className="h-5 w-5 text-amber-600" />
              Upcoming Deadlines
            </h2>
            <button className="text-sm text-slate-500 transition-colors hover:text-slate-700">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.map((deadline) => (
              <div
                key={deadline.id}
                className={`rounded-lg border-l-4 p-4 ${
                  deadline.priority === 'high'
                    ? 'border-l-red-500 bg-red-50'
                    : deadline.priority === 'medium'
                    ? 'border-l-amber-500 bg-amber-50'
                    : 'border-l-emerald-500 bg-emerald-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-medium text-slate-800">{deadline.title}</p>
                    <p
                      className={`mt-1 text-xs ${
                        deadline.priority === 'high'
                          ? 'text-red-600'
                          : deadline.priority === 'medium'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {deadline.daysLeft === 0 ? 'Due today' : `${deadline.daysLeft} days left`}
                    </p>
                  </div>
                  <AlertCircle
                    className={`h-4 w-4 shrink-0 ${
                      deadline.priority === 'high'
                        ? 'text-red-600'
                        : deadline.priority === 'medium'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-5 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800 sm:text-lg">
            <Zap className="h-5 w-5 text-blue-600" />
            Recent Activity
          </h2>
          <button className="text-sm text-slate-500 transition-colors hover:text-slate-700">
            View all
          </button>
        </div>
        <div className="space-y-2">
          {recentActivity.map((activity) => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.id}
                className="group flex flex-col gap-2 rounded-lg p-3 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${activity.color}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-800 group-hover:text-slate-900">
                      {activity.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{activity.client}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">{activity.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
