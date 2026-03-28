import React from 'react';
import { getReportSummary } from '@/lib/api';
import Card from '@/components/ui/Card';
import MonthlyInterestChart from '@/components/dashboard/MonthlyInterestChart';

export default async function ReportsPage() {
  const report = await getReportSummary();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">รายงาน</h1>
        <p className="text-gray-500 mt-1">ภาพรวมธุรกิจและสถิติ</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card
          title="สัญญาที่จำนำอยู่"
          icon="📄"
          value={report.totalActiveContracts}
          subtitle="สัญญาจำนำ"
          trend={{ value: 12, label: 'จากเดือนที่แล้ว' }}
        />
        <Card
          title="ดอกเบี้ยที่ได้รับ"
          icon="💰"
          value={`฿${report.totalInterestEarned.toLocaleString()}`}
          subtitle="รายได้ดอกเบี้ยรวม"
          trend={{ value: 8, label: 'จากเดือนที่แล้ว' }}
        />
        <Card
          title="ไถ่คืนแล้ว"
          icon="✅"
          value={report.totalRedeemedContracts}
          subtitle="สัญญาที่ไถ่คืน"
        />
        <Card
          title="ยอดเงินสะสม"
          icon="💎"
          value={`฿${report.totalAmountLent.toLocaleString()}`}
          subtitle="ยอดจำนำรวม"
          trend={{ value: 15, label: 'จากเดือนที่แล้ว' }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Interest Chart */}
        <div className="h-full">
          <MonthlyInterestChart data={report.monthlyInterest} />
        </div>

        {/* Contract Status Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            สถานะสัญญา
          </h3>
          <p className="text-sm text-gray-400 mb-6">การกระจายสถานะสัญญาทั้งหมด</p>

          {/* Donut-style display */}
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 mb-6">
              {/* SVG Donut Chart */}
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                {(() => {
                  const total = report.contractsByStatus.reduce(
                    (s, c) => s + c.count,
                    0
                  );
                  const colors = [
                    '#6366f1',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                  ];
                  let cumulative = 0;

                  return report.contractsByStatus.map((item, idx) => {
                    const percentage = total === 0 ? 0 : (item.count / total) * 100;
                    const circumference = 2 * Math.PI * 45;
                    const dashLength = (percentage / 100) * circumference;
                    const dashOffset = (cumulative / 100) * circumference;
                    cumulative += percentage;

                    return (
                      <circle
                        key={item.status}
                        cx="60"
                        cy="60"
                        r="45"
                        fill="none"
                        stroke={colors[idx % colors.length]}
                        strokeWidth="20"
                        strokeDasharray={`${dashLength} ${
                          circumference - dashLength
                        }`}
                        strokeDashoffset={-dashOffset}
                        className="transition-all duration-700"
                      />
                    );
                  });
                })()}
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">
                  {report.contractsByStatus.reduce(
                    (s, c) => s + c.count,
                    0
                  )}
                </span>
                <span className="text-xs text-gray-400">รายการทั้งหมด</span>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {report.contractsByStatus.map((item, idx) => {
                const colors = [
                  'bg-indigo-500',
                  'bg-emerald-500',
                  'bg-amber-500',
                  'bg-red-500',
                ];
                const statusLabels: Record<string, string> = {
                  'ACTIVE': 'จำนำอยู่',
                  'REDEEMED': 'ไถ่ถอนแล้ว',
                  'EXPIRED': 'เกินกำหนด',
                  'FORFEITED': 'หลุดจำนำ',
                };
                return (
                  <div
                    key={item.status}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50"
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        colors[idx % colors.length]
                      }`}
                    />
                    <span className="text-sm text-gray-600">
                      {statusLabels[item.status] || item.status}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 ml-auto">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
