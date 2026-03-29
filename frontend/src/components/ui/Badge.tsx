import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  children: React.ReactNode;
  className?: string;
}

const variantClasses = {
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  default: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export default function Badge({
  variant = 'default',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// Helper function สำหรับ status badge
export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    ACTIVE: { variant: 'success', label: 'จำนำอยู่' },
    REDEEMED: { variant: 'default', label: 'ไถ่คืนแล้ว' },
    EXPIRED: { variant: 'danger', label: 'เลยกำหนด' },
    FORFEITED: { variant: 'danger', label: 'หลุดจำนำ' },
    INTEREST: { variant: 'info', label: 'ต่อดอกเบี้ย' },
    REDEMPTION: { variant: 'success', label: 'ไถ่คืน' },
    NEAR_DUE: { variant: 'warning', label: 'ใกล้ครบกำหนด' },
    RENEWED: { variant: 'info', label: 'ต่อดอก' },
  };

  const { variant, label } = config[status] || { variant: 'default' as const, label: status };

  return <Badge variant={variant}>{label}</Badge>;
}
