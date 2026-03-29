'use client';

import React, { useState, useEffect } from 'react';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Link from 'next/link';
import { Customer } from '@/lib/types';
import { getCustomers, createCustomer, updateCustomer, getClientSession, resetCustomerPassword } from '@/lib/api';
import { Key } from 'lucide-react';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadCustomers();
    checkUser();
  }, []);

  const checkUser = async () => {
    const session = await getClientSession();
    setCurrentUser(session);
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredCustomers(customers);
      return;
    }
    const q = query.toLowerCase();
    setFilteredCustomers(
      customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.idCard?.includes(q)
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

    console.log(`[CustomerOperation] Starting: ${selectedCustomer ? 'Update' : 'Create'}`, {
      id: selectedCustomer?.id,
      data
    });

    try {
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, data);
        showToast(`แก้ไขข้อมูล ${data.name} สำเร็จ`, 'success');
        console.log(`[CustomerOperation] Success: Updated customer ${selectedCustomer.id}`);
      } else {
        await createCustomer(data);
        showToast(`เพิ่มลูกค้า ${data.name} สำเร็จ`, 'success');
        console.log(`[CustomerOperation] Success: Created new customer`);
      }
      
      await loadCustomers();
      setIsModalOpen(false);
      setSelectedCustomer(null);
    } catch (error: any) {
      console.error('[CustomerOperation] Error:', error);
      showToast(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    
    setSubmitting(true);
    try {
      await resetCustomerPassword(selectedCustomer.id, { password: resetPassword });
      showToast(`รีเซ็ตรหัสผ่านให้ ${selectedCustomer.name} สำเร็จ`, 'success');
      setIsResetModalOpen(false);
      setResetPassword('');
    } catch (error: any) {
      showToast(error.message || 'เกิดข้อผิดพลาด', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'ชื่อ-นามสกุล',
      render: (item: Customer) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
            <span className="text-sm font-semibold text-indigo-700">
              {item.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{item.name}</p>
            <p className="text-xs text-gray-400">{item.email || '-'}</p>
          </div>
        </div>
      ),
    },
    { key: 'idCard', label: 'เลขบัตรประชาชน' },
    { key: 'phone', label: 'เบอร์โทร' },
    {
      key: 'address',
      label: 'ที่อยู่',
      className: 'max-w-[200px] truncate',
    },
    {
      key: 'createdAt',
      label: 'วันที่สร้าง',
      render: (item: Customer) =>
        item.createdAt ? new Date(item.createdAt).toLocaleDateString('th-TH') : '-',
    },
    {
      key: 'actions',
      label: 'จัดการ',
      render: (item: Customer) => (
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/customers/${item.id}`}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            ดูประวัติ
          </Link>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => {
              setSelectedCustomer(item);
              setIsModalOpen(true);
            }}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            แก้ไข
          </button>
          {currentUser?.role === 'OWNER' && item.hasUser && (
            <>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => {
                  setSelectedCustomer(item);
                  setIsResetModalOpen(true);
                }}
                className="text-amber-600 hover:text-amber-800 flex items-center gap-1 text-sm font-medium"
                title="รีเซ็ตรหัสผ่าน"
              >
                <Key className="w-3.5 h-3.5" />
                กู้รหัส
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
      </div>
    );
  }

  // เช็กว่าพนักงานห้ามแก้เมลลูกค้าที่มี User แล้ว
  const isEmailReadOnly = selectedCustomer?.hasUser && currentUser?.role === 'STAFF';

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
          <h1 className="text-2xl font-bold text-gray-900">ลูกค้า</h1>
          <p className="text-gray-500 mt-1">จัดการข้อมูลลูกค้าทั้งหมด</p>
        </div>
        <Button
          onClick={() => {
            setSelectedCustomer(null);
            setIsModalOpen(true);
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มลูกค้าใหม่
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <Table
          columns={columns}
          data={filteredCustomers}
          onSearch={handleSearch}
          searchPlaceholder="ค้นหาชื่อ, เบอร์โทร, เลขบัตรประชาชน..."
          pageSize={10}
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCustomer(null);
        }}
        title={selectedCustomer ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="ชื่อ-นามสกุล"
            name="name"
            placeholder="กรอกชื่อ-นามสกุล"
            defaultValue={selectedCustomer?.name}
            required
          />
          <Input
            label="เลขบัตรประชาชน"
            name="idCard"
            placeholder="X-XXXX-XXXXX-XX-X"
            defaultValue={selectedCustomer?.idCard}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="เบอร์โทรศัพท์"
              name="phone"
              placeholder="0XX-XXX-XXXX"
              defaultValue={selectedCustomer?.phone}
              required
            />
            <Input
              label="อีเมล"
              name="email"
              type="email"
              placeholder="email@example.com"
              defaultValue={selectedCustomer?.email}
              readOnly={isEmailReadOnly}
              className={isEmailReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}
              helperText={isEmailReadOnly ? 'เฉพาะเจ้าของร้านเท่านั้นที่แก้ไขอีเมลที่สมัครสมาชิกแล้วได้' : ''}
            />
          </div>
          <Input
            label="ที่อยู่"
            name="address"
            placeholder="กรอกที่อยู่"
            defaultValue={selectedCustomer?.address}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedCustomer(null);
              }}
            >
              ยกเลิก
            </Button>
            <Button type="submit" loading={submitting}>
              {selectedCustomer ? 'บันทึกการแก้ไข' : 'เพิ่มลูกค้า'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => {
          setIsResetModalOpen(false);
          setResetPassword('');
        }}
        title="รีเซ็ตรหัสผ่านลูกค้า"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl mb-4">
            <p className="text-sm text-amber-800">
              คุณกำลังจะเปลี่ยนรหัสผ่านให้กับ <strong>{selectedCustomer?.name}</strong> <br/>
              กรุณาระบุรหัสผ่านใหม่ที่ต้องการ (ขั้นต่ำ 6 ตัวอักษร)
            </p>
          </div>
          
          <Input
            label="รหัสผ่านใหม่"
            type="password"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
            placeholder="กรอกรหัสผ่านใหม่"
            required
            autoFocus
          />
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setIsResetModalOpen(false);
                setResetPassword('');
              }}
            >
              ยกเลิก
            </Button>
            <Button type="submit" loading={submitting} variant="primary">
              ยืนยันเปลี่ยนรหัสผ่าน
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
