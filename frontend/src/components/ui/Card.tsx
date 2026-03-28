import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  value?: string | number;
  trend?: { value: number; label: string };
  children?: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export default function Card({
  title,
  subtitle,
  icon,
  value,
  trend,
  children,
  className = '',
  gradient = false,
}: CardProps) {
  // Summary card mode (เมื่อมี value)
  if (value !== undefined) {
    return (
      <div
        className={`group relative rounded-2xl p-6 transition-all duration-300 ${
          gradient
            ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20'
            : 'bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.12]'
        } ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-slate-400">{title}</div>
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/[0.08] flex items-center justify-center text-lg">
              {icon}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold text-white mb-1">
          {typeof value === 'number' ? value.toLocaleString('th-TH') : value}
        </div>
        {subtitle && <div className="text-sm text-slate-500">{subtitle}</div>}
        {trend && (
          <div className="flex items-center mt-3 gap-1">
            <span
              className={`text-sm font-medium ${
                trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-slate-500">{trend.label}</span>
          </div>
        )}
      </div>
    );
  }

  // Container card mode
  return (
    <div
      className={`rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.08] ${className}`}
    >
      {title && (
        <div className="px-6 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            {icon && <span className="text-xl">{icon}</span>}
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              {subtitle && (
                <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
