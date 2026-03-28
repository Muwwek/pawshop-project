'use client';

import React, { useState, useEffect } from 'react';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/Badge';
import { Payment, Contract } from '@/lib/types';
import { getPayments, getContracts, createPayment } from '@/lib/api';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [activeContracts, setActiveContracts] = useState<Contract[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'INTEREST' | 'REDEMPTION'>('INTEREST');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [amount, setAmount] = useState('0');
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [paymentsData, allContracts] = await Promise.all([
        getPayments(),
        getContracts()
      ]);
      setPayments(paymentsData);
      setFilteredPayments(paymentsData);
      setActiveContracts(allContracts.filter(c => c.status === 'ACTIVE' || c.status === 'EXPIRED'));
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    let filtered = payments;
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.contractNumber.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q)
      );
    }
    if (typeFilter) {
      filtered = filtered.filter((p) => p.type === typeFilter);
    }
    setFilteredPayments(filtered);
  };

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type);
    let filtered = payments;
    if (type) {
      filtered = filtered.filter((p) => p.type === type);
    }
    setFilteredPayments(filtered);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      contractId: formData.get('contractId') as string,
      paymentType: paymentType,
      amount: parseFloat(formData.get('amount') as string),
    };

    console.log(`[PaymentOperation] Starting: ${paymentType}`, data);

    try {
      await createPayment(data);
      console.log(`[PaymentOperation] Success: Recorded ${paymentType} payment`);
      await loadData();
      setIsModalOpen(false);
      showToast('บันทึกการชำระเงินสำเร็จ!', 'success');
    } catch (error: any) {
      console.error('[PaymentOperation] Error:', error);
      showToast(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContractChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedContractId(id);
    
    if (id) {
      const contract = activeContracts.find(c => c.id === id);
      if (contract) {
        const value = paymentType === 'INTEREST' 
          ? contract.interestDue 
          : contract.totalRedeemAmount;
        setAmount(value.toString());
      }
    } else {
      setAmount('0');
    }
  };

  const handleOpenModal = (type: 'INTEREST' | 'REDEMPTION') => {
    setPaymentType(type);
    setSelectedContractId('');
    setAmount('0');
    setIsModalOpen(true);
  };

  const columns = [
    { key: 'contractNumber', label: 'เลขสัญญา' },
    { key: 'customerName', label: 'ชื่อลูกค้า' },
    {
      key: 'type',
      label: 'ประเภท',
      render: (item: Payment) => <StatusBadge status={item.type} />,
    },
    {
      key: 'amount',
      label: 'จำนวนเงิน',
      render: (item: Payment) => (
        <span className="font-semibold text-gray-900">
          ฿{item.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'paidAt',
      label: 'วันที่ชำระ',
      render: (item: Payment) =>
        item.paidAt ? new Date(item.paidAt).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }) : '-',
    },
    { key: 'receivedBy', label: 'รับเงินโดย' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="animate-in">
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ชำระเงิน</h1>
          <p className="text-gray-500 mt-1">บันทึกการชำระดอกเบี้ยและไถ่คืน</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => handleOpenModal('INTEREST')}
          >
            💳 ต่อดอกเบี้ย
          </Button>
          <Button
            onClick={() => handleOpenModal('REDEMPTION')}
          >
            ✅ ไถ่คืน
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">ดอกเบี้ยรวม</div>
          <div className="text-2xl font-bold text-indigo-600">
            ฿
            {payments
              .filter((p) => p.type === 'INTEREST')
              .reduce((s, p) => s + p.amount, 0)
              .toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">ไถ่คืนรวม</div>
          <div className="text-2xl font-bold text-emerald-600">
            ฿
            {payments
              .filter((p) => p.type === 'REDEMPTION')
              .reduce((s, p) => s + p.amount, 0)
              .toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">รายการทั้งหมด</div>
          <div className="text-2xl font-bold text-gray-900">{payments.length} รายการ</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        {['', 'INTEREST', 'REDEMPTION'].map((type) => {
          const labels: Record<string, string> = {
            '': 'ทั้งหมด',
            INTEREST: 'ดอกเบี้ย',
            REDEMPTION: 'ไถ่คืน',
          };
          return (
            <button
              key={type}
              onClick={() => handleTypeFilter(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                typeFilter === type
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {labels[type]}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <Table
          columns={columns}
          data={filteredPayments}
          onSearch={handleSearch}
          searchPlaceholder="ค้นหาเลขสัญญา, ชื่อลูกค้า..."
          pageSize={10}
        />
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          paymentType === 'INTEREST'
            ? 'ต่อดอกเบี้ย'
            : 'บันทึกการไถ่คืน'
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="สัญญาจำนำ"
            name="contractId"
            value={selectedContractId}
            onChange={handleContractChange}
            required
            options={activeContracts.map(c => ({ 
              value: c.id, 
              label: `${c.contractNumber} - ${c.customerName} (฿${c.amount.toLocaleString()})` 
            }))}
            placeholder="เลือกสัญญาจำนำ"
          />
          <Input
            label={
              paymentType === 'INTEREST'
                ? 'จำนวนดอกเบี้ย (บาท)'
                : 'จำนวนเงินไถ่คืน (บาท)'
            }
            name="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            required
          />
          {paymentType === 'INTEREST' && (
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-700">
                💡 ดอกเบี้ย = เงินต้น × อัตราดอกเบี้ย ÷ 100
              </p>
            </div>
          )}
          {paymentType === 'REDEMPTION' && (
            <div className="p-4 bg-emerald-50 rounded-xl">
              <p className="text-sm text-emerald-700">
                ✅ ยอดไถ่คืน = เงินต้น + ดอกเบี้ยค้างชำระ
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              type="submit"
              loading={submitting}
              variant={paymentType === 'REDEMPTION' ? 'success' : 'primary'}
            >
              {paymentType === 'INTEREST' ? 'ยืนยันต่อดอกเบี้ย' : 'ยืนยันไถ่คืน'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
