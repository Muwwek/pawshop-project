import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Users, FileText, Wallet, Clock, ChevronRight, Minus } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { getContracts, getCustomers, getPayments } from '@/lib/api';
import { Role } from '@/lib/types';
import { redirect } from 'next/navigation';
import QuickActions from '@/components/dashboard/QuickActions';

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) return null;

  // ถ้าเป็น CUSTOMER ให้ไปที่ Portal ทันที
  if (user.role === Role.CUSTOMER) {
    redirect('/dashboard/portal');
  }

  const contracts = await getContracts();
  const customers = await getCustomers();
  const payments = await getPayments();

  const activeContracts = contracts.filter((c) => c.status === 'ACTIVE' || c.status === 'EXPIRED');
  const totalLent = activeContracts.reduce((sum, c) => sum + c.amount, 0);
  const totalInterest = payments
    .filter((p) => p.type === 'INTEREST')
    .reduce((sum, p) => sum + p.amount, 0);

  const formatCurrency = (amount: number) => {
    return `฿ ${amount.toLocaleString('th-TH')}`;
  };

  // ลอจิกการคำนวณ % การเปลี่ยนแปลงจากเดือนที่แล้ว
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const isCurrentMonth = (dateString?: string) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };

  const isLastMonth = (dateString?: string) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  };

  const calcChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const currentMonthContracts = contracts.filter(c => isCurrentMonth(c.createdAt || c.startDate));
  const lastMonthContracts = contracts.filter(c => isLastMonth(c.createdAt || c.startDate));
  const contractChange = calcChange(currentMonthContracts.length, lastMonthContracts.length);

  const currentMonthLent = currentMonthContracts.reduce((sum, c) => sum + c.amount, 0);
  const lastMonthLent = lastMonthContracts.reduce((sum, c) => sum + c.amount, 0);
  const lentChange = calcChange(currentMonthLent, lastMonthLent);

  const currentMonthInterest = payments.filter(p => p.type === 'INTEREST' && isCurrentMonth(p.paidAt)).reduce((sum, p) => sum + p.amount, 0);
  const lastMonthInterest = payments.filter(p => p.type === 'INTEREST' && isLastMonth(p.paidAt)).reduce((sum, p) => sum + p.amount, 0);
  const interestChange = calcChange(currentMonthInterest, lastMonthInterest);

  const currentMonthCustomers = customers.filter(c => isCurrentMonth(c.createdAt));
  const lastMonthCustomers = customers.filter(c => isLastMonth(c.createdAt));
  const customerChange = calcChange(currentMonthCustomers.length, lastMonthCustomers.length);

  const stats = [
    {
      title: 'สัญญาที่จำนำอยู่',
      value: activeContracts.length.toLocaleString(),
      change: contractChange,
      icon: FileText,
      color: 'emerald',
    },
    {
      title: 'ยอดเงินทั้งหมด',
      value: formatCurrency(totalLent),
      change: lentChange,
      icon: Wallet,
      color: 'indigo',
    },
    {
      title: 'ดอกเบี้ยรวม',
      value: formatCurrency(totalInterest),
      change: interestChange,
      icon: TrendingUp,
      color: 'purple',
    },
    {
      title: 'ลูกค้าทั้งหมด',
      value: customers.length.toLocaleString(),
      change: customerChange,
      icon: Users,
      color: 'blue',
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      REDEEMED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      EXPIRED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      DEFAULT: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };
    const labels = {
      ACTIVE: 'จำนำอยู่',
      REDEEMED: 'ไถ่คืน',
      EXPIRED: 'หมดอายุ',
      DEFAULT: 'หลุดจำนำ',
      FORFEITED: 'หลุดจำนำ',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.DEFAULT}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            สวัสดี, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">{user.name}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1">นี่คือภาพรวมระบบร้านรับจำนำของคุณวันนี้</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-300">{new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {(user.role === Role.OWNER || user.role === Role.STAFF) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const isPositive = stat.change > 0;
            const isNeutral = stat.change === 0;
            return (
              <div
                key={index}
                className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-white tracking-wide">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {isPositive ? (
                        <ArrowUpRight className={`w-4 h-4 text-emerald-400`} />
                      ) : isNeutral ? (
                        <Minus className={`w-4 h-4 text-slate-500`} />
                      ) : (
                        <ArrowDownRight className={`w-4 h-4 text-red-400`} />
                      )}
                      <span className={`text-sm font-medium ${isPositive ? `text-emerald-400` : isNeutral ? 'text-slate-500' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{stat.change}%
                      </span>
                      <span className="text-slate-500 text-sm ml-1">จากเดือนที่แล้ว</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Contracts */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
            <div>
              <h3 className="text-lg font-semibold text-white">สัญญาล่าสุด</h3>
              <p className="text-sm text-slate-400">สัญญาจำนำที่สร้างล่าสุด</p>
            </div>
            <Link
              href="/dashboard/contracts"
              className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              ดูทั้งหมด
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-white/[0.08]">
            {contracts.slice(0, 5).map((contract) => (
              <div key={contract.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{contract.contractNumber}</p>
                      <p className="text-sm text-slate-400">{contract.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">฿{contract.amount.toLocaleString()}</p>
                    <div className="mt-1">{getStatusBadge(contract.status)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
            <div>
              <h3 className="text-lg font-semibold text-white">การชำระเงินล่าสุด</h3>
              <p className="text-sm text-slate-400">รายการชำระเงินล่าสุดในระบบ</p>
            </div>
            <Link
              href="/dashboard/payments"
              className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              ดูทั้งหมด
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-white/[0.08]">
            {payments.slice(0, 5).map((payment) => (
              <div key={payment.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      payment.type === 'INTEREST' ? 'bg-blue-500/10' : 'bg-emerald-500/10'
                    }`}>
                      {payment.type === 'INTEREST' ? (
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Wallet className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{payment.contractNumber}</p>
                      <p className="text-sm text-slate-400">{payment.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">฿{payment.amount.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      payment.type === 'INTEREST'
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {payment.type === 'INTEREST' ? 'ต่อดอกเบี้ย' : 'ไถ่คืน'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions activeContracts={activeContracts} customers={customers} />
    </div>
  );
}
