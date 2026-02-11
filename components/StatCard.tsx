'use client';

import { ReactNode } from 'react';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  sparkline?: number[];
}

const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 hover:border-blue-300',
    green: 'bg-green-50 border-green-200 hover:border-green-300',
    red: 'bg-red-50 border-red-200 hover:border-red-300',
    yellow: 'bg-yellow-50 border-yellow-200 hover:border-yellow-300',
    purple: 'bg-purple-50 border-purple-200 hover:border-purple-300',
  };

const iconColorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };

const textColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
  };
export default function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  color = 'blue',
  sparkline,
}: StatCardProps) {
  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]} shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-600 tracking-wide uppercase">{title}</p>
          <p className="text-4xl font-bold text-slate-900 mt-3 transition-transform duration-300 group-hover:scale-105">{value}</p>
          {sparkline && sparkline.length > 0 && (
            <div className="mt-3">
              <svg className="w-full h-6" viewBox="0 0 100 24" preserveAspectRatio="none">
                {(() => {
                  const max = Math.max(...sparkline);
                  const min = Math.min(...sparkline);
                  const range = max - min || 1;
                  const points = sparkline.map((v, i) => {
                    const x = (i / (sparkline.length - 1 || 1)) * 100;
                    const y = 24 - ((v - min) / range) * 20 - 2;
                    return `${x},${y}`;
                  }).join(' ');
                  return (
                    <>
                      <polyline points={points} fill="none" stroke="#0ea5a6" strokeWidth={2} strokeOpacity={0.95} strokeLinejoin="round" strokeLinecap="round" />
                    </>
                  );
                })()}
              </svg>
            </div>
          )}
          {description && (
            <p className="text-sm text-slate-600 mt-2 font-medium">{description}</p>
          )}
          {trend && (
            <div className="mt-3 flex items-center gap-1">
              {trend.isPositive ? (
                <TrendingUp size={14} className={`${textColorClasses[color]}`} />
              ) : (
                <TrendingDown size={14} className="text-red-600" />
              )}
              <p className={`text-sm font-semibold ${
                trend.isPositive ? textColorClasses[color] : 'text-red-600'
              }`}>
                {trend.isPositive ? '+' : '-'}{trend.value}% from last month
              </p>
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-4 rounded-lg ${iconColorClasses[color]} flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
