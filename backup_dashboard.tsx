
import { TrendingUp, Users, FileText, DollarSign, Activity, ArrowUpRight, CheckCircle, Clock, AlertCircle, Calendar, Target, Zap } from 'lucide-react';

const PieChart = ({ data, title }: { data: Array<{ label: string; value: number; color: string }>; title: string }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;
  const slices = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const startAngle = (cumulativePercentage / 100) * 360;
    const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
    cumulativePercentage += percentage;
    return { ...item, percentage, startAngle, endAngle };
  });

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200">
      <h3 className="text-sm font-medium text-slate-800 mb-4">{title}</h3>
      <div className="flex items-center justify-between">
        <svg width="120" height="120" viewBox="0 0 120 120" className="flex-shrink-0">
          {slices.map((slice, idx) => {
            const startRad = (slice.startAngle * Math.PI) / 180;
            const endRad = (slice.endAngle * Math.PI) / 180;
            const x1 = 60 + 45 * Math.cos(startRad);
            const y1 = 60 + 45 * Math.sin(startRad);
            const x2 = 60 + 45 * Math.cos(endRad);
            const y2 = 60 + 45 * Math.sin(endRad);
            const largeArc = slice.percentage > 50 ? 1 : 0;
            const pathData = `M 60 60 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`;
            return <path key={idx} d={pathData} fill={slice.color} className="transition-opacity hover:opacity-80" />;
          })}
        </svg>
        <div className="ml-4 space-y-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-slate-600">{item.label}</span>
              <span className="text-xs font-medium text-slate-800">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BarChart = ({ data, title, height = 200 }: { data: Array<{ label: string; value: number }>; title: string; height?: number }) => {
  const max = Math.max(...data.map(d => d.value));
  const barHeight = height - 60;

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200">
      <h3 className="text-sm font-medium text-slate-800 mb-4">{title}</h3>
      <div className="flex items-end justify-between gap-2" style={{ height: barHeight }}>
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:shadow-lg"
              style={{ height: `${(item.value / max) * barHeight}px`, cursor: 'pointer' }}
              title={`${item.label}: ${item.value}`}
            />
            <span className="text-xs text-slate-600 mt-2 text-center truncate w-full">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const stats = [
    { label: 'Total Revenue', value: '£124,500', change: '+12.5%', icon: DollarSign, color: 'from-blue-50 to-transparent', iconColor: 'text-blue-600' },
    { label: 'Active Projects', value: '28', change: '+8', icon: FileText, color: 'from-emerald-50 to-transparent', iconColor: 'text-emerald-600' },
    { label: 'Total Clients', value: '156', change: '+23', icon: Users, color: 'from-amber-50 to-transparent', iconColor: 'text-amber-600' },
    { label: 'Completion Rate', value: '94%', change: '+2.3%', icon: Activity, color: 'from-rose-50 to-transparent', iconColor: 'text-rose-600' },
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
    { id: 1, title: 'Modern Office Complex', client: 'Tech Corp Ltd', progress: 78, status: 'in_progress', dueDate: '15 Mar 2024' },
    { id: 2, title: 'Residential Building', client: 'Urban Homes', progress: 45, status: 'in_progress', dueDate: '22 Apr 2024' },
    { id: 3, title: 'Retail Space', client: 'Commerce Inc', progress: 92, status: 'in_review', dueDate: '08 Mar 2024' },
    { id: 4, title: 'Community Center', client: 'Local Council', progress: 60, status: 'in_progress', dueDate: '30 May 2024' },
  ];

  const upcomingDeadlines = [
    { id: 1, title: 'Submit Plans - Retail Space', daysLeft: 2, priority: 'high' },
    { id: 2, title: 'Client Review - Office Complex', daysLeft: 5, priority: 'medium' },
    { id: 3, title: 'Final Approval - Residential', daysLeft: 12, priority: 'low' },
  ];

  const recentActivity = [
    { id: 1, title: 'Planning Application Approved', client: 'Sarah Johnson', time: '2 hours ago', icon: CheckCircle, color: 'text-emerald-600' },
    { id: 2, title: 'New Project Started', client: 'Michael Brown', time: '5 hours ago', icon: FileText, color: 'text-blue-600' },
    { id: 3, title: 'Payment Received', client: 'Emma Wilson', time: '1 day ago', icon: DollarSign, color: 'text-emerald-600' },
    { id: 4, title: 'Documents Pending', client: 'James Davis', time: '2 days ago', icon: Clock, color: 'text-amber-600' },
  ];

  const statusColors = {
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
    in_review: 'bg-amber-50 text-amber-700 border-amber-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-light text-slate-800 mb-2">Dashboard</h1>
        <p className="text-slate-500 text-sm">Welcome back, here's your overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-sm`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <PieChart data={projectStatus} title="Project Status Breakdown" />
        <PieChart data={paymentStatus} title="Payment Status" />

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-emerald-400" />
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-semibold mb-2">£24,800</p>
            <p className="text-slate-300 text-sm mb-4">This Month</p>
            <div className="pt-4 border-t border-slate-600">
              <p className="text-xs text-slate-400">+18% from last month</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="text-sm font-medium text-slate-800 mb-4">Performance</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-600">Client Satisfaction</span>
                  <span className="text-xs font-medium text-slate-800">98%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '98%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-600">On-time Delivery</span>
                  <span className="text-xs font-medium text-slate-800">92%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <BarChart data={revenueByMonth} title="Revenue Trend (Last 6 Months)" />
        <BarChart data={projectsByMonth} title="Projects Created (Last 6 Months)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-slate-800 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Recent Projects
            </h2>
            <button className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.id} className="p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{project.title}</p>
                    <p className="text-xs text-slate-500">{project.client}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[project.status as keyof typeof statusColors]}`}>
                    {project.status === 'in_progress' ? 'In Progress' : project.status === 'in_review' ? 'In Review' : 'Completed'}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-full mr-3 bg-slate-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full" style={{ width: `${project.progress}%` }} />
                  </div>
                  <span className="text-xs font-medium text-slate-700">{project.progress}%</span>
                </div>
                <p className="text-xs text-slate-500">Due: {project.dueDate}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              Upcoming Deadlines
            </h2>
            <button className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className={`p-4 rounded-lg border-l-4 ${
                deadline.priority === 'high'
                  ? 'border-l-red-500 bg-red-50'
                  : deadline.priority === 'medium'
                  ? 'border-l-amber-500 bg-amber-50'
                  : 'border-l-emerald-500 bg-emerald-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{deadline.title}</p>
                    <p className={`text-xs mt-1 ${
                      deadline.priority === 'high'
                        ? 'text-red-600'
                        : deadline.priority === 'medium'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}>
                      {deadline.daysLeft === 0 ? 'Due today' : `${deadline.daysLeft} days left`}
                    </p>
                  </div>
                  <AlertCircle className={`w-4 h-4 ${
                    deadline.priority === 'high'
                      ? 'text-red-600'
                      : deadline.priority === 'medium'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-slate-800 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Recent Activity
          </h2>
          <button className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
            View all
          </button>
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity) => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-4">
                  <Icon className={`w-5 h-5 ${activity.color}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-800 group-hover:text-slate-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{activity.client}</p>
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