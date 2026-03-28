'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { User } from '@/lib/types';

interface DashboardShellProps {
  user: User;
  children: React.ReactNode;
}

export default function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] animate-float" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] animate-float" style={{ animationDelay: '-3s' }} />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Sidebar role={user.role} userName={user.name} />
        <div className="ml-64">
          <TopBar userName={user.name} role={user.role} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
