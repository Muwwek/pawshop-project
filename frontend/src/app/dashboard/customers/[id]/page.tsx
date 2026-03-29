'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCustomerHistory } from '@/lib/api';
import Table from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/Badge';
import { Loader2, ArrowLeft, User, Phone, Mail, MapPin, CreditCard, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { Contract, Payment } from '@/lib/types';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';

export default function CustomerHistoryPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contracts' | 'payments'>('contracts');
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const historyData = await getCustomerHistory(id);
        setData(historyData);
      } catch (error: any) {
        console.error('Failed to load customer history:', error);
        showToast('ไม่พบข้อมูลลูกค้า หรือเกิดข้อผิดพลาด', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, showToast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>กำลังโหลดประวัติลูกค้า...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-bold text-gray-900 mb-4">ไม่พบข้อมูลลูกค้า</h2>
        <button onClick={() => router.push('/dashboard/customers')} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> กลับไปหน้ารายชื่อลูกค้า
        </button>
      </div>
    );
  }

  const { customer, contracts, payments } = data;

  const contractColumns = [
    { key: 'contractNumber', label: 'เลขสัญญา' },
    { key: 'itemName', label: 'สิ่งของจำนำ' },
    { 
      key: 'amount', 
      label: 'วงเงินจำนำ', 
      render: (item: any) => <span className="font-semibold text-gray-900">฿{item.amount.toLocaleString()}</span> 
    },
    { key: 'status', label: 'สถานะ', render: (item: any) => <StatusBadge status={item.status} /> },
    { 
      key: 'dueDate', 
      label: 'วันครบกำหนด', 
      render: (item: any) => item.dueDate ? new Date(item.dueDate).toLocaleDateString('th-TH') : '-' 
    },
    { key: 'createdBy', label: 'พนักงานผู้ทำรายการ' },
  ];

  const paymentColumns = [
    { key: 'contractId', label: 'อ้างอิงเลขสัญญา', render: (item: any) => {
        const relatedContract = contracts.find((c: any) => c.id === item.contractId);
        return relatedContract ? relatedContract.contractNumber : '-';
    }},
    { key: 'type', label: 'ประเภทการชำระ', render: (item: any) => <StatusBadge status={item.type} /> },
    { 
      key: 'amount', 
      label: 'จำนวนเงิน', 
      render: (item: any) => <span className="font-semibold text-indigo-600">฿{item.amount.toLocaleString()}</span> 
    },
    { 
      key: 'paymentDate', 
      label: 'วันที่ชำระ', 
      render: (item: any) => item.paymentDate ? new Date(item.paymentDate).toLocaleDateString('th-TH') : '-' 
    },
    { key: 'recordedBy', label: 'ผู้รับเงิน' },
  ];

  return (
    <div className="animate-in space-y-6">
      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type} onClose={hideToast} />
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => router.push('/dashboard/customers')}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ประวัติการทำรายการลูกค้า</h1>
          <p className="text-gray-500 mt-1">รายละเอียดและประวัติย้อนหลังทั้งหมด</p>
        </div>
      </div>

      {/* Customer Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-md">
              <span className="text-3xl font-bold text-indigo-700">{customer.name.charAt(0)}</span>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{customer.name}</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm">เลขบัตร: {customer.idCard || '-'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm">เบอร์โทร: {customer.phone || '-'}</span>
                </div>
              </div>
            </div>
            <div className="pt-2 md:pt-11 space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span className="text-sm">อีเมล: {customer.email || '-'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span className="text-sm">ที่อยู่: {customer.address || '-'}</span>
              </div>
            </div>
            <div className="pt-2 md:pt-11 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 h-fit">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">จำนวนสัญญาจำนำรวม:</span>
                <span className="font-bold text-indigo-600 text-lg">{contracts.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">สมัครเป็นลูกค้าเมื่อ:</span>
                <span className="font-medium text-gray-700">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('th-TH') : '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('contracts')}
            className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'contracts'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4" /> ประวัติการจำนำ (สัญญา)
            <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">{contracts.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'payments'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> ประวัติการชำระเงิน
            <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">{payments.length}</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'contracts' ? (
            contracts.length > 0 ? (
              <Table
                columns={contractColumns}
                data={contracts}
                onSearch={() => {}} // Not strictly necessary for individual customer unless they have hundreds
                searchPlaceholder="ค้นหาเลขสัญญา..."
                pageSize={10}
              />
            ) : (
              <div className="text-center py-10 text-gray-500">ไม่พบประวัติการทำสัญญาจำนำ</div>
            )
          ) : (
            payments.length > 0 ? (
              <Table
                columns={paymentColumns}
                data={payments}
                onSearch={() => {}}
                searchPlaceholder="ค้นหาการชำระเงิน..."
                pageSize={10}
              />
            ) : (
              <div className="text-center py-10 text-gray-500">ไม่พบประวัติการชำระเงิน</div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
