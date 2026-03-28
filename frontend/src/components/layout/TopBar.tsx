'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@/lib/types';
import { Bell, Search, LogOut, ChevronDown, Crown, User, UserCircle } from 'lucide-react';

interface TopBarProps {
  userName: string;
  role: Role;
}

export default function TopBar({ userName, role }: TopBarProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = React.useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const roleLabels: Record<Role, string> = {
    [Role.OWNER]: 'เจ้าของร้าน',
    [Role.STAFF]: 'พนักงาน',
    [Role.CUSTOMER]: 'ลูกค้า',
  };

  const roleColors: Record<Role, string> = {
    [Role.OWNER]: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    [Role.STAFF]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    [Role.CUSTOMER]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left side - Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="ค้นหาสัญญา, ลูกค้า, หรือรายการ..."
            className="w-full pl-11 pr-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/[0.03]">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>

        {/* Role Badge */}
        <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border ${roleColors[role]}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${role === Role.OWNER ? 'bg-amber-400' : role === Role.STAFF ? 'bg-blue-400' : 'bg-emerald-400'} animate-pulse`} />
          <span className="text-xs font-medium">{roleLabels[role]}</span>
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/[0.03] transition-colors"
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white ${
              role === Role.OWNER ? 'from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20' : 'from-indigo-500 to-purple-600'
            }`}>
              {role === Role.OWNER ? (
                <Crown className="w-4 h-4" />
              ) : role === Role.STAFF ? (
                <User className="w-4 h-4" />
              ) : (
                <UserCircle className="w-4 h-4" />
              )}
            </div>
            <span className="text-sm font-medium text-white hidden sm:block">{userName}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-white/[0.08] rounded-xl shadow-2xl shadow-black/20 z-50 overflow-hidden">
                <div className="p-3 border-b border-white/[0.08]">
                  <p className="text-sm font-medium text-white truncate">{userName}</p>
                  <p className="text-xs text-slate-400">{roleLabels[role]}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  ออกจากระบบ
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
