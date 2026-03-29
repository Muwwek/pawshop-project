'use client';

import React, { useState, useEffect } from 'react';
import { getReportSummary, getContracts, getCustomers, getCustomerHistory } from '@/lib/api';
import { ReportSummary, Contract, Customer } from '@/lib/types';
import { 
  Loader2, 
  Calendar, 
  TrendingUp, 
  FileText, 
  AlertCircle, 
  Trash2, 
  Users, 
  Search, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  CheckCircle2,
  Clock,
  ExternalLink,
  History
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import Table from '@/components/ui/Table';

export default function ReportsPage() {
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [nearDueContracts, setNearDueContracts] = useState<Contract[]>([]);
  const [forfeitedContracts, setForfeitedContracts] = useState<Contract[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  
  // Drill-down View State
  const [viewDetail, setViewDetail] = useState<'NONE' | 'REVENUE' | 'TRANSACTIONS' | 'NEAR_DUE' | 'FORFEITED' | 'CUSTOMERS'>('NONE');

  // Customer History states
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerHistory, setCustomerHistory] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  useEffect(() => {
    fetchMainData();
  }, [selectedYear, setSelectedYear, selectedMonth, setSelectedMonth]);

  const fetchMainData = async () => {
    setLoading(true);
    try {
      const [reportData, nearDueData, forfeitedData, customersData] = await Promise.all([
        getReportSummary(selectedYear, selectedMonth),
        getContracts(),
        getContracts(),
        getCustomers()
      ]);
      
      setReport(reportData);
      setNearDueContracts(nearDueData.filter(c => c.status === 'NEAR_DUE' || (c.status === 'ACTIVE' && isNearDue(c.dueDate))));
      setForfeitedContracts(forfeitedData.filter(c => c.status === 'FORFEITED'));
      setCustomers(customersData);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const isNearDue = (dueDateStr: string) => {
    const dueDate = new Date(dueDateStr);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  const handleCustomerSelect = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewDetail('CUSTOMERS');
    setHistoryLoading(true);
    try {
      const history = await getCustomerHistory(customer.id);
      setCustomerHistory(history);
    } catch (error) {
      console.error('Failed to fetch customer history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading && !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-sm font-medium">รอสักครู่ กำลังเตรียมข้อมูล...</p>
      </div>
    );
  }

  // Back to Dashboard Helper
  const backToDashboard = () => setViewDetail('NONE');

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 1. Header & Filters (Clean & Professional) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">ข้อมูลสรุปในร้าน</h1>
          <p className="text-slate-400 mt-2 text-sm">ข้อมูลสรุปของเดือน {monthNames[selectedMonth - 1]} ค.ศ. {selectedYear}</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
          <Calendar className="w-4 h-4 text-indigo-400 ml-2" />
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="bg-transparent text-white text-sm outline-none px-2 py-1 cursor-pointer hover:text-indigo-400 transition-colors"
          >
            {monthNames.map((name, i) => (
              <option key={i} value={i + 1} className="bg-slate-900">{name}</option>
            ))}
          </select>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-transparent text-white text-sm outline-none px-2 py-1 cursor-pointer hover:text-indigo-400 transition-colors"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y} className="bg-slate-900">{y}</option>
            ))}
          </select>
        </div>
      </div>

      {viewDetail === 'NONE' ? (
        <>
          {/* 2. Main Stats (The "Pulse") */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard 
              label="รายได้รวมเดือนนี้" 
              value={`฿${report?.totalReceived.toLocaleString()}`} 
              icon={<TrendingUp className="w-6 h-6" />}
              color="emerald"
              onClick={() => setViewDetail('REVENUE')}
            />
            <SummaryCard 
              label="ยอดปล่อยกู้ทั้งหมด" 
              value={`฿${report?.totalPrincipalLent.toLocaleString()}`} 
              icon={<Wallet className="w-6 h-6" />}
              color="blue"
              onClick={() => setViewDetail('TRANSACTIONS')}
            />
            <SummaryCard 
              label="จำนวนสัญญาทั้งหมด" 
              value={`${report?.totalNewContracts} รายการ`} 
              icon={<FileText className="w-6 h-6" />}
              color="indigo"
              onClick={() => setViewDetail('TRANSACTIONS')}
            />
            <SummaryCard 
              label="ไถ่คืนไปแล้ว" 
              value={`${report?.totalRedeemedContracts} รายการ`} 
              icon={<CheckCircle2 className="w-6 h-6" />}
              color="emerald"
              onClick={() => setViewDetail('TRANSACTIONS')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 3. Urgent Alerts (Left Column) */}
            <div className="lg:col-span-1 space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 px-1">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                สิ่งที่ต้องทำด่วน
              </h2>
              
              <AlertCard 
                label="ของที่ใกล้จะหลุด" 
                count={nearDueContracts.length} 
                icon={<Clock />} 
                color="orange"
                description="ลูกค้าที่ต้องตามภายใน 7 วัน"
                onClick={() => setViewDetail('NEAR_DUE')}
              />
              
              <AlertCard 
                label="ของที่หลุดจำนำแล้ว" 
                count={forfeitedContracts.length} 
                icon={<Trash2 />} 
                color="rose"
                description="ของที่เจ้าของไม่มาเอาและต้องขายต่อ"
                onClick={() => setViewDetail('FORFEITED')}
              />

              {/* Customer Search Quick Tool */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  ค้นหาข้อมูลลูกค้า
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ชื่อลูกค้า หรือ เบอร์โทร..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                {customerSearch && (
                  <div className="max-h-40 overflow-y-auto space-y-1 scrollbar-hide">
                    {customers
                      .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch))
                      .slice(0, 5)
                      .map(c => (
                        <button 
                          key={c.id} 
                          onClick={() => handleCustomerSelect(c)}
                          className="w-full text-left p-2 rounded-lg hover:bg-white/5 text-xs text-slate-300 flex items-center justify-between"
                        >
                          {c.name}
                          <ChevronRight className="w-3 h-3 text-slate-500" />
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* 4. Recent Activity Feed (Right 2 Column) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  รายการล่าสุด
                </h2>
                <button 
                  onClick={() => setViewDetail('TRANSACTIONS')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
                >
                  ดูทั้งหมด <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto no-scrollbar">
                  {report?.recentTransactions.length ? (
                    report.recentTransactions.slice(0, 10).map((tx, idx) => (
                      <TransactionItem key={tx.id} tx={tx} isLast={idx === 9} />
                    ))
                  ) : (
                    <div className="p-12 text-center text-slate-500 italic text-sm">
                      ไม่มีรายการความเคลื่อนไหวในช่วงเวลานี้
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* 5. Drill-down Full Report View */
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <button 
            onClick={backToDashboard}
            className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-bold transiton-all"
          >
            ← กลับหน้ารายงาน
          </button>

          {viewDetail === 'REVENUE' && report && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">รายงานสรุปรายได้รายวัน</h3>
              <p className="text-slate-500 text-sm mb-8">แจกแจงรายรับจากดอกเบี้ยและยอดไถ่ถอนในแต่ละวัน</p>
              <Table 
                columns={[
                  { key: 'day', label: 'วันที่' },
                  { key: 'interest', label: 'เงินค่าดอกเบี้ย', render: (row: any) => <span className="text-emerald-600 font-medium">฿{row.interest.toLocaleString()}</span> },
                  { key: 'redemption', label: 'เงินที่ไถ่คืนไป', render: (row: any) => `฿${row.redemption.toLocaleString()}` },
                  { key: 'total', label: 'ยอดรวมวันนี้', render: (row: any) => <span className="font-bold text-slate-900">฿{row.total.toLocaleString()}</span> },
                ]}
                data={report.dailyRevenue}
                pageSize={15}
              />
            </div>
          )}

          {viewDetail === 'TRANSACTIONS' && report && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">รายชื่อรับจำนำและไถ่คืน</h3>
              <p className="text-slate-500 text-sm mb-8">บัญชีรายชื่อทั้งหมดที่มีการเคลื่อนไหวในช่วงนี้</p>
              <Table 
                columns={[
                  { key: 'date', label: 'วันที่ชำระ', render: (row: any) => new Date(row.date).toLocaleDateString('th-TH') },
                  { 
                    key: 'type', 
                    label: 'รายการ', 
                    render: (row: any) => {
                      const typeMap: any = {
                        'PAWN': { label: 'รับจำนำ', class: 'bg-blue-100 text-blue-700' },
                        'REDEMPTION': { label: 'ไถ่คืน', class: 'bg-emerald-100 text-emerald-700' },
                        'RENEWAL': { label: 'ต่อดอก', class: 'bg-amber-100 text-amber-700' }
                      };
                      const config = typeMap[row.type] || { label: row.type, class: 'bg-slate-100 text-slate-700' };
                      return (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${config.class}`}>
                          {config.label}
                        </span>
                      );
                    }
                  },
                  { key: 'contractNumber', label: 'เลขสัญญา', className: 'font-mono' },
                  { key: 'itemName', label: 'ของที่จำนำ' },
                  { key: 'customerName', label: 'คนจำนำ' },
                  { key: 'amount', label: 'เป็นเงิน', render: (row: any) => <span className="font-bold">฿{row.amount.toLocaleString()}</span> },
                ]}
                data={report.recentTransactions}
                pageSize={10}
              />
            </div>
          )}

          {viewDetail === 'NEAR_DUE' && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">ของที่ใกล้จะหลุด</h3>
              <p className="text-slate-500 text-sm mb-8">รายชื่อของที่เหลือเวลาไม่ถึง 7 วัน (ควรรีบตามลูกค้าครับ)</p>
              <Table 
                columns={[
                  { key: 'contractNumber', label: 'เลขสัญญา' },
                  { key: 'itemName', label: 'ของที่ติดอยู่' },
                  { key: 'customerName', label: 'คนจำนำ' },
                  { key: 'amount', label: 'ยอดเงินต้น', render: (row: Contract) => `฿${row.amount.toLocaleString()}` },
                  { 
                    key: 'dueDate', 
                    label: 'วันที่ต้องมาจ่าย', 
                    render: (row: Contract) => (
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{new Date(row.dueDate).toLocaleDateString('th-TH')}</span>
                        <StatusBadge status="NEAR_DUE" />
                      </div>
                    )
                  },
                ]}
                data={nearDueContracts}
                pageSize={10}
              />
            </div>
          )}

          {viewDetail === 'FORFEITED' && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200">
              <h3 className="text-2xl font-bold text-rose-600 mb-2">ของหน้าที่หลุดจำนำแล้ว</h3>
              <p className="text-slate-500 text-sm mb-8">รายชื่อของที่ตกเป็นของร้านแล้ว และเตรียมนำออกขาย</p>
              <Table 
                columns={[
                  { key: 'contractNumber', label: 'เลขสัญญา' },
                  { key: 'itemName', label: 'ชื่อของ' },
                  { key: 'customerName', label: 'เจ้าของเดิม' },
                  { key: 'amount', label: 'เงินต้นที่จำนำ', render: (row: Contract) => `฿${row.amount.toLocaleString()}` },
                  { key: 'dueDate', label: 'วันที่หลุด', render: (row: Contract) => new Date(row.dueDate).toLocaleDateString('th-TH') },
                  { key: 'status', label: 'สถานะทางบัญชี', render: () => <StatusBadge status="FORFEITED" /> },
                ]}
                data={forfeitedContracts}
                pageSize={10}
              />
            </div>
          )}

          {viewDetail === 'CUSTOMERS' && selectedCustomer && (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
              <div className="bg-slate-900 p-8 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Users className="w-32 h-32" />
                </div>
                <h3 className="text-3xl font-black">{selectedCustomer.name}</h3>
                <p className="text-indigo-300 font-medium">รหัสลูกค้า: {selectedCustomer.id.slice(-6).toUpperCase()}</p>
                <div className="mt-6 flex gap-4">
                   <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/5">
                      <p className="text-[10px] uppercase font-bold text-slate-400">เบอร์โทร</p>
                      <p className="text-sm font-bold">{selectedCustomer.phone}</p>
                   </div>
                   <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/5">
                      <p className="text-[10px] uppercase font-bold text-slate-400">เป็นสมาชิกเมื่อ</p>
                      <p className="text-sm font-bold">{new Date().toLocaleDateString('th-TH')}</p>
                   </div>
                </div>
              </div>
              <div className="p-8 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl">
                       <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-1">สัญญาที่ยังไม่จบ</p>
                       <p className="text-4xl font-extrabold text-blue-900">{customerHistory?.contracts?.filter((c: any) => c.status === 'ACTIVE').length || 0}</p>
                    </div>
                    <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl">
                       <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-1">ไถ่ถอนไปแล้วทั้งหมด</p>
                       <p className="text-4xl font-extrabold text-emerald-900">{customerHistory?.contracts?.filter((c: any) => c.status === 'REDEEMED').length || 0}</p>
                    </div>
                 </div>
                 <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                       <History className="w-5 h-5 text-slate-400" /> 
                       ประวัติสัญญาและทรัพย์สินทั้งหมด
                    </h4>
                    <Table 
                      columns={[
                        { key: 'contractNumber', label: 'เลขสัญญา', className: 'font-mono' },
                        { key: 'itemName', label: 'รายการทรัพย์' },
                        { key: 'amount', label: 'ยอดเงินต้น', render: (row: any) => `฿${row.amount.toLocaleString()}` },
                        { key: 'status', label: 'สถานะ', render: (row: any) => <StatusBadge status={row.status} /> },
                      ]}
                      data={customerHistory?.contracts || []}
                      pageSize={5}
                    />
                 </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** 
 * Sub-Components 
 */

function SummaryCard({ label, value, icon, color, trend, onClick }: any) {
  const colorMap: any = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-white/5 border border-white/10 p-6 rounded-[2.5rem] hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer shadow-xl shadow-black/10"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-slate-400 text-sm font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-indigo-400 transition-colors">{value}</h3>
      {trend && (
        <p className="text-emerald-400 text-[10px] font-bold mt-2 flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3" /> {trend}
        </p>
      )}
    </div>
  );
}

function AlertCard({ label, count, icon, color, description, onClick }: any) {
  const colors: any = {
    orange: {
      bg: 'bg-orange-500/10 hover:bg-orange-500/15 border-orange-500/20',
      text: 'text-orange-500',
      icon: 'bg-orange-500 text-white',
      badge: 'bg-orange-500/20 text-orange-400'
    },
    rose: {
      bg: 'bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/20',
      text: 'text-rose-500',
      icon: 'bg-rose-500 text-white',
      badge: 'bg-rose-500/20 text-rose-400'
    }
  };

  const c = colors[color];

  return (
    <div 
      onClick={onClick}
      className={`group relative p-6 rounded-3xl border ${c.bg} transition-all cursor-pointer overflow-hidden`}
    >
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <h3 className={`text-sm font-bold uppercase tracking-wider ${c.text}`}>{label}</h3>
          <p className="text-5xl font-black text-white mt-2 mb-1">{count}</p>
          <p className="text-[11px] text-slate-400 leading-tight pr-4">{description}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform ${c.icon}`}>
          {icon}
        </div>
      </div>
      <div className="absolute -bottom-2 -right-2 opacity-5 text-white transform group-hover:scale-150 transition-transform">
        {icon}
      </div>
    </div>
  );
}

function TransactionItem({ tx, isLast }: any) {
  const isPawn = tx.type === 'PAWN';
  const isRenewal = tx.type === 'RENEWAL';
  
  return (
    <div className={`p-4 flex items-center gap-4 hover:bg-white/[0.03] transition-colors ${!isLast ? 'border-b border-white/5' : ''}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
        isPawn ? 'bg-blue-500/20 text-blue-400' : 
        isRenewal ? 'bg-amber-500/20 text-amber-400' : 
        'bg-emerald-500/20 text-emerald-400'
      }`}>
        {isPawn ? <ArrowDownRight className="w-5 h-5" /> : 
         isRenewal ? <Clock className="w-5 h-5" /> : 
         <ArrowUpRight className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-white truncate">{tx.itemName}</p>
          <span className="text-xs font-black text-white">฿{tx.amount.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-[11px] text-slate-400 font-medium">#{tx.contractNumber} • {tx.customerName}</p>
          <div className="flex items-center gap-2">
            <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${
              isPawn ? 'bg-blue-500/20 text-blue-400' : 
              isRenewal ? 'bg-amber-500/20 text-amber-400' : 
              'bg-emerald-500/20 text-emerald-400'
            }`}>
              {isPawn ? 'รับเข้า' : isRenewal ? 'ต่อดอก' : 'ไถ่คืน'}
            </span>
            <p className="text-[10px] text-slate-500">{new Date(tx.date).toLocaleDateString('th-TH')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
