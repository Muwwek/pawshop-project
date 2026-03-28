'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MENU_ITEMS, Role } from '@/lib/types';
import { ChevronLeft, ChevronRight, Crown, User, UserCircle } from 'lucide-react';

interface SidebarProps {
  role: Role;
  userName: string;
}

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  const filteredMenuItems = MENU_ITEMS.filter((item) =>
    item.roles.includes(role)
  );

  const roleLabels: Record<Role, string> = {
    [Role.OWNER]: 'เจ้าของร้าน',
    [Role.STAFF]: 'พนักงาน',
    [Role.CUSTOMER]: 'ลูกค้า',
  };

  const roleColors: Record<Role, string> = {
    [Role.OWNER]: 'from-amber-500 to-orange-500',
    [Role.STAFF]: 'from-blue-500 to-indigo-500',
    [Role.CUSTOMER]: 'from-emerald-500 to-teal-500',
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full ${collapsed ? 'w-20' : 'w-64'} bg-slate-950 border-r border-white/[0.08] flex flex-col z-50 transition-all duration-300`}
    >
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? 'justify-center px-4' : 'px-6'} py-6 border-b border-white/[0.08]`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
            <span className="text-white text-lg font-bold">P</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-white">PawShop</h1>
              <p className="text-xs text-slate-400">ระบบร้านรับจำนำ</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-white/[0.08] rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors z-50"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
                ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-white/[0.08]'
                    : 'text-slate-400 hover:bg-white/[0.03] hover:text-white'
                }`}
              title={collapsed ? item.label : undefined}
            >
              <span className={`text-lg transition-transform duration-200 group-hover:scale-110 ${isActive ? 'drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}`}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              )}
              {isActive && collapsed && (
                <div className="absolute right-2 w-1 h-1 rounded-full bg-indigo-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className={`${collapsed ? 'px-2' : 'px-4'} py-4 border-t border-white/[0.08]`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'px-2 py-2 justify-center' : 'px-3 py-2'} rounded-xl bg-white/[0.03] border border-white/[0.08]`}>
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleColors[role]} flex items-center justify-center flex-shrink-0 text-white shadow-lg shadow-white/5`}>
            {role === Role.OWNER ? (
              <Crown className="w-5 h-5" />
            ) : role === Role.STAFF ? (
              <User className="w-5 h-5" />
            ) : (
              <UserCircle className="w-5 h-5" />
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-slate-400">{roleLabels[role]}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
