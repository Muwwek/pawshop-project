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
  selectedYear: number;
  selectedMonth?: number | null;
  onYearChange: (year: number) => void;
  onMonthClick: (monthIndex: number | null) => void;
}

export default function MonthlyInterestChart({ 
  data, 
  selectedYear, 
  selectedMonth, 
  onYearChange, 
  onMonthClick 
}: Props) {
  // หาปีทั้งหมดที่มีในข้อมูล เผื่อให้เลือกได้
  const availableYears = useMemo(() => {
    const years = new Set(data.map((d) => d.year).filter((y): y is number => y !== undefined));
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [data]);

  const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  const chartData = useMemo(() => {
    // สร้างอาร์เรย์รอไว้ 12 เดือน แล้วเติมข้อมูลลงไป
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
  }, [data, selectedYear]);

  const maxAmount = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.max(...chartData.map((i) => i.amount));
  }, [chartData]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              ดอกเบี้ยรายเดือน
            </h3>
            <p className="text-sm text-gray-400">คลิกที่แถบเพื่อดูยอดแต่ละเดือน</p>
          </div>
          {selectedMonth && (
            <button 
              onClick={() => onMonthClick(null)}
              className="px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="bg-gray-50 border border-gray-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none font-medium text-indigo-700 cursor-pointer"
        >
          {availableYears.map(year => (
            <option key={year} value={year}>ประจำปี {year}</option>
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
            const label = item.month;
            const isSelected = selectedMonth === item.monthIndex;

            return (
              <div 
                key={`${item.year || 'all'}-${item.monthIndex || idx}`} 
                className={`flex items-center gap-4 cursor-pointer group/item p-1.5 rounded-xl transition-all ${
                  isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => onMonthClick(item.monthIndex || null)}
              >
                <div className={`w-16 text-sm font-medium text-right whitespace-nowrap ${
                  isSelected ? 'text-indigo-600' : 'text-gray-500'
                }`}>
                  {label}
                </div>
                <div className="flex-1 h-8 bg-gray-50 rounded-lg overflow-hidden relative border border-transparent group-hover/item:border-indigo-200">
                  <div
                    className={`h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg transition-all duration-700 flex items-center justify-end pr-3 relative overflow-hidden ${
                      isSelected ? 'ring-2 ring-indigo-400 ring-offset-1' : ''
                    }`}
                    style={{ width: `${percentage}%` }}
                  >
                    {/* Gloss / shine effect */}
                    <div className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-[-150%] group-hover/item:translate-x-[150%] transition-transform duration-1000 ease-in-out"></div>
                    
                    {item.amount > 0 && (
                      <span className="text-xs font-medium text-white whitespace-nowrap z-10">
                        ฿{item.amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                {/* Fallback label when bar is too small */}
                {item.amount > 0 && percentage < 15 && (
                  <div className={`text-xs font-medium min-w-10 ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`}>
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
