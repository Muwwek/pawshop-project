'use client';

import React, { useState, useEffect } from 'react';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/Badge';
import { Contract, Customer } from '@/lib/types';
import { getContracts, getCustomers, createContract } from '@/lib/api';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contractsData, customersData] = await Promise.all([
        getContracts(),
        getCustomers()
      ]);
      setContracts(contractsData);
      setFilteredContracts(contractsData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    let filtered = contracts;
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.contractNumber.toLowerCase().includes(q) ||
          c.customerName.toLowerCase().includes(q) ||
          c.itemDescription.toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }
    setFilteredContracts(filtered);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    let filtered = contracts;
    if (status) {
      filtered = filtered.filter((c) => c.status === status);
    }
    setFilteredContracts(filtered);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const durationDays = parseInt(formData.get('duration') as string);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + durationDays);

    const data = {
      customerId: formData.get('customerId') as string,
      itemName: formData.get('itemName') as string,
      itemDescription: formData.get('itemDescription') as string,
      principalAmount: formData.get('amount') as string,
      interestRate: formData.get('interestRate') as string,
      estimatedValue: formData.get('estimatedValue') as string,
      dueDate: dueDate.toISOString(),
    };

    console.log('[ContractOperation] Starting: Create', data);

    try {
      await createContract(data);
      console.log('[ContractOperation] Success: Created new contract');
      await loadData();
      setIsModalOpen(false);
      showToast('สร้างสัญญาจำนำสำเร็จ!', 'success');
    } catch (error: any) {
      console.error('[ContractOperation] Error:', error);
      showToast(error.message || 'เกิดข้อผิดพลาดในการสร้างสัญญา', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'contractNumber', label: 'เลขสัญญา' },
    { key: 'customerName', label: 'ชื่อลูกค้า' },
    {
      key: 'itemDescription',
      label: 'รายละเอียดสิ่งของ',
      className: 'max-w-[200px] truncate',
    },
    {
      key: 'amount',
      label: 'จำนวนเงิน',
      render: (item: Contract) => (
        <span className="font-semibold text-gray-900">
          ฿{item.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'สถานะ',
      render: (item: Contract) => <StatusBadge status={item.status} />,
    },
    {
      key: 'dueDate',
      label: 'วันครบกำหนด',
      render: (item: Contract) => {
        if (!item.dueDate) return '-';
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(item.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return (
          <div className="flex flex-col">
            <span className={`font-medium ${diffDays < 0 && item.status === 'ACTIVE' ? 'text-red-600' : 'text-gray-900'}`}>
              {dueDate.toLocaleDateString('th-TH')}
            </span>
            {item.status === 'ACTIVE' && (
              <span className={`text-[10px] font-bold uppercase ${
                diffDays < 0 ? 'text-red-500' : diffDays <= 7 ? 'text-amber-500' : 'text-emerald-600'
              }`}>
                {diffDays < 0 ? `⚠️ เลยมา ${Math.abs(diffDays)} วัน` : diffDays === 0 ? '🔔 วันนี้' : `⏳ อีก ${diffDays} วัน`}
              </span>
            )}
          </div>
        );
      },
    },
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
          <h1 className="text-2xl font-bold text-gray-900">สัญญาจำนำ</h1>
          <p className="text-gray-500 mt-1">จัดการสัญญาจำนำทั้งหมด</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          สร้างสัญญาใหม่
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
        {['', 'ACTIVE', 'REDEEMED', 'EXPIRED', 'FORFEITED'].map((status) => {
          const labels: Record<string, string> = {
            '': 'ทั้งหมด',
            ACTIVE: 'จำนำอยู่',
            REDEEMED: 'ไถ่คืน',
            EXPIRED: 'หมดอายุ',
            FORFEITED: 'หลุดจำนำ',
          };
          return (
            <button
              key={status}
              onClick={() => handleStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {labels[status]}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <Table
          columns={columns}
          data={filteredContracts}
          onSearch={handleSearch}
          searchPlaceholder="ค้นหาเลขสัญญา, ชื่อลูกค้า, รายละเอียด..."
          pageSize={10}
        />
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="สร้างสัญญาจำนำใหม่"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="ลูกค้า"
            name="customerId"
            required
            options={customers.map(c => ({ value: c.id, label: c.name }))}
            placeholder="เลือกลูกค้า"
          />
          <Input 
            label="ชื่อสิ่งของ" 
            name="itemName" 
            placeholder="เช่น สร้อยคอทองคำ" 
            required 
          />
          <Input 
            label="รายละเอียดสิ่งของ" 
            name="itemDescription" 
            placeholder="ทองคำ 96.5% น้ำหนัก 2 บาท" 
            required 
          />
          <div className="grid grid-cols-2 gap-4">
             <Input label="ราคากลาง / ราคาประเมิน" name="estimatedValue" type="number" placeholder="0" required />
             <Input label="วงเงินจำนำ (จำนวนเงิน)" name="amount" type="number" placeholder="0" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="อัตราดอกเบี้ย (%)" name="interestRate" type="number" step="0.1" defaultValue="1.5" required />
            <Input label="ระยะเวลา (วัน)" name="duration" type="number" defaultValue="30" required />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" loading={submitting}>
              สร้างสัญญา
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
