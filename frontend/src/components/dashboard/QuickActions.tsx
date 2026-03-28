'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { createContract, createPayment, createCustomer } from '@/lib/api';
import { Contract, Customer } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface QuickActionsProps {
  activeContracts: Contract[];
  customers: Customer[];
}

export default function QuickActions({ activeContracts, customers }: QuickActionsProps) {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  
  const [modalType, setModalType] = useState<'NONE' | 'CONTRACT' | 'PAYMENT' | 'CUSTOMER'>('NONE');
  const [submitting, setSubmitting] = useState(false);
  
  const [paymentType, setPaymentType] = useState<'INTEREST' | 'REDEMPTION'>('INTEREST');

  const closeModals = () => setModalType('NONE');

  const handleContractSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

    try {
      await createContract(data);
      showToast('สร้างสัญญาจำนำสำเร็จ!', 'success');
      closeModals();
      router.refresh();
    } catch (error: any) {
      showToast(error.message || 'เกิดข้อผิดพลาดในการสร้างสัญญา', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      contractId: formData.get('contractId') as string,
      paymentType: paymentType,
      amount: parseFloat(formData.get('amount') as string),
    };

    try {
      await createPayment(data);
      showToast('บันทึกการชำระเงินสำเร็จ!', 'success');
      closeModals();
      router.refresh();
    } catch (error: any) {
      showToast(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      idCard: formData.get('idCard') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
    };

    try {
      await createCustomer(data);
      showToast('เพิ่มลูกค้าสำเร็จ!', 'success');
      closeModals();
      router.refresh();
    } catch (error: any) {
      showToast(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type} onClose={hideToast} />

      <div className="rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/[0.08] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">ดำเนินการอย่างรวดเร็ว</h3>
            <p className="text-slate-400 text-sm">จัดการงานประจำวันของคุณได้อย่างรวดเร็ว</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setModalType('CONTRACT')}
              className="px-5 py-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl font-medium hover:bg-indigo-500/20 transition-all duration-300"
            >
              สร้างสัญญาใหม่
            </button>
            <button
              onClick={() => setModalType('PAYMENT')}
              className="px-5 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-medium hover:bg-emerald-500/20 transition-all duration-300"
            >
              บันทึกการชำระ
            </button>
            <button
              onClick={() => setModalType('CUSTOMER')}
              className="px-5 py-2.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl font-medium hover:bg-purple-500/20 transition-all duration-300"
            >
              เพิ่มลูกค้า
            </button>
          </div>
        </div>
      </div>

      {/* Contract Modal */}
      <Modal isOpen={modalType === 'CONTRACT'} onClose={closeModals} title="สร้างสัญญาจำนำใหม่" size="lg">
        <form onSubmit={handleContractSubmit} className="space-y-4">
          <Select
            label="ลูกค้า"
            name="customerId"
            required
            options={customers.map(c => ({ value: c.id, label: c.name }))}
            placeholder="เลือกลูกค้า"
          />
          <Input label="ชื่อสิ่งของ" name="itemName" placeholder="เช่น สร้อยคอทองคำ" required />
          <Input label="รายละเอียดสิ่งของ" name="itemDescription" placeholder="ทองคำ 96.5% น้ำหนัก 2 บาท" required />
          <div className="grid grid-cols-2 gap-4">
             <Input label="ราคากลาง / ราคาประเมิน" name="estimatedValue" type="number" placeholder="0" required />
             <Input label="วงเงินจำนำ (จำนวนเงิน)" name="amount" type="number" placeholder="0" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="อัตราดอกเบี้ย (%)" name="interestRate" type="number" step="0.1" defaultValue="1.5" required />
            <Input label="ระยะเวลา (วัน)" name="duration" type="number" defaultValue="30" required />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={closeModals}>ยกเลิก</Button>
            <Button type="submit" loading={submitting}>สร้างสัญญา</Button>
          </div>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={modalType === 'PAYMENT'} onClose={closeModals} title="บันทึกการชำระเงิน">
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                checked={paymentType === 'INTEREST'} 
                onChange={() => setPaymentType('INTEREST')} 
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-700">ชำระดอกเบี้ย</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                checked={paymentType === 'REDEMPTION'} 
                onChange={() => setPaymentType('REDEMPTION')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-gray-700">ไถ่คืน</span>
            </label>
          </div>

          <Select
            label="สัญญาจำนำ"
            name="contractId"
            required
            options={activeContracts.map(c => ({ 
              value: c.id, 
              label: `${c.contractNumber} - ${c.customerName} (฿${c.amount.toLocaleString()})` 
            }))}
            placeholder="เลือกสัญญาจำนำ"
          />
          <Input
            label={paymentType === 'INTEREST' ? 'จำนวนดอกเบี้ย (บาท)' : 'จำนวนเงินไถ่คืน (บาท)'}
            name="amount"
            type="number"
            placeholder="0"
            required
          />
          {paymentType === 'INTEREST' && (
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-700">💡 ดอกเบี้ย = เงินต้น × อัตราดอกเบี้ย ÷ 100</p>
            </div>
          )}
          {paymentType === 'REDEMPTION' && (
            <div className="p-4 bg-emerald-50 rounded-xl">
              <p className="text-sm text-emerald-700">✅ ยอดไถ่คืน = เงินต้น + ดอกเบี้ยค้างชำระ</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={closeModals}>ยกเลิก</Button>
            <Button type="submit" loading={submitting} variant={paymentType === 'REDEMPTION' ? 'success' : 'primary'}>
              {paymentType === 'INTEREST' ? 'บันทึกดอกเบี้ย' : 'ยืนยันไถ่คืน'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Customer Modal */}
      <Modal isOpen={modalType === 'CUSTOMER'} onClose={closeModals} title="เพิ่มลูกค้าใหม่" size="lg">
        <form onSubmit={handleCustomerSubmit} className="space-y-4">
          <Input label="ชื่อ-นามสกุล" name="name" placeholder="กรอกชื่อ-นามสกุล" required />
          <Input label="เลขบัตรประชาชน" name="idCard" placeholder="X-XXXX-XXXXX-XX-X" required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="เบอร์โทรศัพท์" name="phone" placeholder="0XX-XXX-XXXX" required />
            <Input label="อีเมล" name="email" type="email" placeholder="email@example.com" />
          </div>
          <Input label="ที่อยู่" name="address" placeholder="กรอกที่อยู่" required />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={closeModals}>ยกเลิก</Button>
            <Button type="submit" loading={submitting}>เพิ่มลูกค้า</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
