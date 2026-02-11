 'use client';

interface AnalyticsChartProps {
  title: string;
  data: Array<{
    label: string;
    value: number;
    percentage?: number;
  }>;
  type?: 'bar' | 'pie' | 'line';
  color?: string;
}

export default function AnalyticsChart({
  title,
  data,
  type = 'bar',
  color = 'bg-blue-500',
  size = 'medium',
}: AnalyticsChartProps & { size?: 'small' | 'medium' | 'large' }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  // Colors for pie slices
  const sliceColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Pie helpers
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = size === 'small' ? 30 : size === 'large' ? 50 : 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-slideInUp">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">{title}</h3>

      {type === 'bar' && (
        <div className="space-y-4">
          {data.map((item, idx) => (
            <div key={idx} className="animate-slideInUp" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-700">{item.label}</p>
                <span className="text-sm font-semibold text-slate-900">
                  {item.value}
                  {item.percentage && <span className="text-slate-500 font-normal"> ({item.percentage}%)</span>}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} transition-all duration-500 rounded-full`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {type === 'pie' && (
        <div className="flex items-center justify-between gap-6">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {data.reduce((acc, item, idx) => {
                const value = item.value;
                const dash = (value / total) * circumference;
                const offset = acc.offset + 0;
                acc.slices.push({ dash, offset, color: sliceColors[idx % sliceColors.length], idx, item });
                acc.offset += dash;
                return acc;
              }, { slices: [] as any[], offset: 0 }).slices.map((s) => (
                <circle
                  key={s.idx}
                  r={radius}
                  cx={50}
                  cy={50}
                  fill="transparent"
                  stroke={s.color}
                  strokeWidth={20}
                  strokeDasharray={`${s.dash} ${circumference - s.dash}`}
                  strokeDashoffset={-s.offset}
                  strokeLinecap="butt"
                  transform="rotate(-90 50 50)"
                />
              ))}
              {/* inner hole */}
              <circle cx={50} cy={50} r={26} fill="white" />
            </svg>
            <div className="absolute text-center">
              <p className="text-sm text-slate-500">Total</p>
              <p className="text-lg font-bold text-slate-900">{total}</p>
            </div>
          </div>

          <div className="flex-1">
            <div className="space-y-2">
              {data.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sliceColors[idx % sliceColors.length] }} />
                    <span className="text-sm text-slate-700">{item.label}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
