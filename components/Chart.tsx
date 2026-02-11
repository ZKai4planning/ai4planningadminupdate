'use client';

// Simple Chart component - placeholder for visualization
interface ChartProps {
  data?: any[];
  title?: string;
}

export default function Chart({ data, title }: ChartProps) {
  return (
    <div className="w-full h-64 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center">
      <p className="text-slate-500">{title || 'Chart Visualization'}</p>
    </div>
  );
}
