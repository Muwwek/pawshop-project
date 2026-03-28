import { getSession } from '@/lib/auth';
import { getMyContracts, getMyPayments } from '@/lib/api';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Wallet, FileText, CheckCircle2, Calendar, Percent, Banknote, Sparkles, Receipt, ArrowRight, TrendingUp } from 'lucide-react';
import { Contract, Payment } from '@/lib/types';

export default async function CustomerPortalPage() {
  const user = await getSession();
  if (!user) return null;

  const contracts = await getMyContracts();
  const payments = await getMyPayments();

  const activeContracts = contracts.filter((c: Contract) => c.status === 'ACTIVE' || c.status === 'EXPIRED');
  const closedContracts = contracts.filter((c: Contract) => c.status === 'REDEEMED' || c.status === 'FORFEITED');
  const totalOutstanding = activeContracts.reduce(
    (sum: number, c: Contract) => sum + c.amount,
    0
  );

  return (
    <div className="space-y-8 animate-in">
      {/* Header with Animation */}
      <div className="relative p-8 rounded-3xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/[0.08] overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            สวัสดี, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">{user.name}</span> 👋
          </h1>
          <p className="text-slate-400 max-w-md">
            ยินดีต้อนรับสู่พอร์ทัลลูกค้า คุณสามารถตรวจสอบสถานะสัญญาจำนำและประวัติการชำระเงินของคุณได้ที่นี่
          </p>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">สัญญาที่จำนำอยู่</p>
              <p className="text-2xl font-bold text-white">{activeContracts.length}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">ยอดเงินจำนำรวม</p>
              <p className="text-2xl font-bold text-white">฿{totalOutstanding.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">การชำระเงินแล้ว</p>
              <p className="text-2xl font-bold text-white">{payments.length} รายการ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contracts Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
          <h2 className="text-xl font-bold text-white">สัญญาจำนำของฉัน</h2>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {activeContracts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-dashed border-white/[0.1]">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">ยังไม่มีสัญญาที่จำนำอยู่ในขณะนี้</p>
            </div>
          ) : (
            activeContracts.map((contract: Contract) => (
              <div
                key={contract.id}
                className="group relative p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-all overflow-hidden"
              >
                <div className="relative z-20">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Receipt className="w-7 h-7 text-indigo-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-white">{contract.contractNumber}</h3>
                          <StatusBadge status={contract.status} />
                        </div>
                        <p className="text-slate-400">{contract.itemDescription}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                       <div className="text-right">
                          <p className="text-slate-500 text-xs uppercase tracking-wider mb-1 font-semibold">ยอดเงินต้น</p>
                          <p className="text-2xl font-bold text-white">฿{contract.amount.toLocaleString()}</p>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Percent className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold uppercase tracking-wider">ดอกเบี้ย</span>
                      </div>
                      <p className="text-white font-medium">{contract.interestRate}% / เดือน</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold uppercase tracking-wider">วันเริ่มต้น</span>
                      </div>
                      <p className="text-white font-medium">{new Date(contract.startDate).toLocaleDateString('th-TH')}</p>
                    </div>

                    <div className="space-y-1 col-span-2">
                       <div className="flex items-center gap-2 text-slate-500">
                        <Banknote className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold uppercase tracking-wider">วันครบกำหนด & สถานะการจ่าย</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`font-semibold ${
                          new Date(contract.dueDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) && 
                          contract.status === 'ACTIVE' ? 'text-red-400' : 'text-indigo-300'
                        }`}>
                          {new Date(contract.dueDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        
                        <div className="flex items-center gap-2">
                           {contract.status === 'EXPIRED' && (
                              <div className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400">
                                ⚠️ หมดอายุแล้ว
                              </div>
                           )}
                           {(() => {
                            const today = new Date().setHours(0,0,0,0);
                            const dueDate = new Date(contract.dueDate).setHours(0,0,0,0);
                            const diffTime = dueDate - today;
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                            return (
                              <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                diffDays < 0 ? 'bg-red-500/10 text-red-400' : 
                                diffDays <= 7 ? 'bg-amber-500/10 text-amber-400' : 
                                'bg-emerald-500/10 text-emerald-400'
                              }`}>
                                {diffDays < 0 ? `เลยมา ${Math.abs(diffDays)} วัน` : 
                                 diffDays === 0 ? 'ครบกำหนดวันนี้' : `เหลืออีก ${diffDays} วัน`}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Closed Contracts Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-slate-500 rounded-full" />
          <h2 className="text-xl font-bold text-white text-opacity-70">สัญญาที่สิ้นสุดแล้ว</h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {closedContracts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/[0.01] border border-white/[0.05]">
              <p className="text-slate-600 text-sm">ยังไม่มีสัญญาที่เสร็จสมบูรณ์</p>
            </div>
          ) : (
            closedContracts.map((contract: Contract) => (
              <div
                key={contract.id}
                className="group relative p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.03] transition-all overflow-hidden opacity-80"
              >
                {/* Stamp */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 rotate-12 opacity-10">
                   <span className={`text-4xl font-black uppercase tracking-widest ${
                     contract.status === 'REDEEMED' ? 'text-emerald-500' : 'text-red-500'
                   }`}>
                     {contract.status === 'REDEEMED' ? 'ไถ่คืนแล้ว' : 'หลุดจำนำ'}
                   </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Receipt className="w-5 h-5 text-slate-500" />
                    <div className="flex-1">
                  <h3 className="text-white font-bold text-lg leading-tight mb-1">
                    {contract.itemName}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm font-medium">{contract.contractNumber}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                    <span className="text-slate-500 text-sm">{contract.itemDescription}</span>
                  </div>
                </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">฿{contract.amount.toLocaleString()}</p>
                    <StatusBadge status={contract.status} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payment History Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
          <h2 className="text-xl font-bold text-white">ประวัติการชำระเงิน</h2>
        </div>

        <div className="rounded-3xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
          <div className="divide-y divide-white/[0.05]">
            {payments.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-500">ยังไม่มีประวัติการชำระเงิน</p>
              </div>
            ) : (
              payments.map((payment: Payment) => (
                <div key={payment.id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      payment.type === 'INTEREST' ? 'bg-blue-500/10' : 'bg-emerald-500/10'
                    }`}>
                      {payment.type === 'INTEREST' ? (
                        <TrendingUp className="w-6 h-6 text-blue-400" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{payment.contractNumber}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(payment.paidAt).toLocaleDateString('th-TH', { 
                          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">฿{payment.amount.toLocaleString()}</p>
                    <StatusBadge status={payment.type} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
