'use client';

import React, { useState, useMemo } from 'react';

interface MonthlyInterestData {
  month: string;
  amount: number;
  year?: number;
  monthIndex?: number;
}

interface Props {
  data: MonthlyInterestData[];
}

export default function MonthlyInterestChart({ data }: Props) {
  // หาปีทั้งหมดที่มีในข้อมูล เผื่อให้เลือกได้
  const availableYears = useMemo(() => {
    const years = new Set(data.map((d) => d.year).filter((y): y is number => y !== undefined));
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [data]);

  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>(availableYears[0] || new Date().getFullYear());

  const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  const chartData = useMemo(() => {
    if (selectedYear === 'ALL') {
      // ถ้าเลือกทั้งหมด โชว์ข้อมูลที่มีทั้งหมดจริงๆ 
      return data;
    } else {
      // ถ้าเลือกปีใดปีหนึ่ง ให้สร้างอาร์เรย์รอไว้ 12 เดือน แล้วเติมข้อมูลลงไป
      const yearData: MonthlyInterestData[] = monthNames.map((m, idx) => ({
        month: m,
        amount: 0,
        year: selectedYear,
        monthIndex: idx + 1,
      }));

      data.forEach(item => {
        if (item.year === selectedYear && item.monthIndex) {
          const index = item.monthIndex - 1;
          if (yearData[index]) {
            yearData[index].amount = item.amount;
          }
        }
      });

      return yearData;
    }
  }, [data, selectedYear]);

  const maxAmount = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.max(...chartData.map((i) => i.amount));
  }, [chartData]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            ดอกเบี้ยรายเดือน
          </h3>
          <p className="text-sm text-gray-400">แนวโน้มรายได้ดอกเบี้ย</p>
        </div>

        {/* Filter Dropdown */}
        <select
          value={selectedYear}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedYear(val === 'ALL' ? 'ALL' : Number(val));
          }}
          className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
        >
          <option value="ALL">ทุกเดือน (รวมทุกปี)</option>
          {availableYears.map(year => (
            <option key={year} value={year}>ปี {year}</option>
          ))}
        </select>
      </div>

      {/* Scrollable Container for many items */}
      <div className="flex-1 overflow-y-auto pr-2 max-h-[300px] space-y-4">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            ไม่มีข้อมูล
          </div>
        ) : (
          chartData.map((item, idx) => {
            const percentage = maxAmount === 0 ? 0 : (item.amount / maxAmount) * 100;
            const label = selectedYear === 'ALL' && item.year ? `${item.month} ${item.year}` : item.month;

            return (
              <div key={`${item.year || 'all'}-${item.monthIndex || idx}`} className="flex items-center gap-4">
                <div className="w-16 text-sm font-medium text-gray-500 text-right whitespace-nowrap">
                  {label}
                </div>
                <div className="flex-1 h-8 bg-gray-50 rounded-lg overflow-hidden group">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg transition-all duration-700 flex items-center justify-end pr-3 relative overflow-hidden"
                    style={{ width: `${percentage}%` }}
                  >
                    {/* Gloss / shine effect */}
                    <div className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out"></div>
                    
                    {item.amount > 0 && (
                      <span className="text-xs font-medium text-white whitespace-nowrap z-10">
                        ฿{item.amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                {/* Fallback label when bar is too small */}
                {item.amount > 0 && percentage < 15 && (
                  <div className="text-xs font-medium text-gray-500 min-w-10">
                    ฿{item.amount.toLocaleString()}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
