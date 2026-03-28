'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Settings } from '@/lib/types';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';

export default function SettingsPage() {
  const [, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const [interestRate, setInterestRate] = useState('');
  const [maxDuration, setMaxDuration] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { getSettings } = await import('@/lib/api');
      const data = await getSettings();
      setSettings(data);
      setInterestRate(data.interestRate.toString());
      setMaxDuration(data.maxDuration.toString());
      setMinAmount(data.minAmount.toString());
      setMaxAmount(data.maxAmount.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    console.log('[SettingsOperation] Starting: Update', {
      interestRate,
      maxDuration,
      minAmount,
      maxAmount
    });

    try {
      const { updateSettings } = await import('@/lib/api');
      await updateSettings({
        interestRate: parseFloat(interestRate),
        maxDuration: parseInt(maxDuration),
        minAmount: parseFloat(minAmount),
        maxAmount: parseFloat(maxAmount),
      });
      console.log('[SettingsOperation] Success: Updated settings');
      showToast('บันทึกการตั้งค่าสำเร็จ!', 'success');
    } catch (error: any) {
      console.error('[SettingsOperation] Error:', error);
      showToast(error.message || 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ตั้งค่า</h1>
        <p className="text-gray-500 mt-1">กำหนดค่าพื้นฐานของระบบ</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Interest Rate Settings */}
        <Card title="อัตราดอกเบี้ย" icon="💰" subtitle="กำหนดอัตราดอกเบี้ยรายเดือน">
          <div className="space-y-4">
            <Input
              label="อัตราดอกเบี้ย (% ต่อเดือน)"
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              helperText="อัตราดอกเบี้ยที่ใช้คำนวณสำหรับสัญญาใหม่"
            />

            {/* Preview */}
            <div className="p-4 bg-indigo-50 rounded-xl">
              <p className="text-sm font-medium text-indigo-700 mb-2">
                ตัวอย่างการคำนวณ
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-indigo-500">เงินต้น ฿10,000</p>
                  <p className="font-semibold text-indigo-800">
                    ดอกเบี้ย ฿
                    {((10000 * parseFloat(interestRate || '0')) / 100).toLocaleString()}
                    /เดือน
                  </p>
                </div>
                <div>
                  <p className="text-indigo-500">เงินต้น ฿50,000</p>
                  <p className="font-semibold text-indigo-800">
                    ดอกเบี้ย ฿
                    {((50000 * parseFloat(interestRate || '0')) / 100).toLocaleString()}
                    /เดือน
                  </p>
                </div>
                <div>
                  <p className="text-indigo-500">เงินต้น ฿100,000</p>
                  <p className="font-semibold text-indigo-800">
                    ดอกเบี้ย ฿
                    {((100000 * parseFloat(interestRate || '0')) / 100).toLocaleString()}
                    /เดือน
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Duration Settings */}
        <Card title="ระยะเวลาจำนำ" icon="📅" subtitle="กำหนดระยะเวลาจำนำสูงสุด">
          <Input
            label="ระยะเวลาสูงสุด (วัน)"
            type="number"
            value={maxDuration}
            onChange={(e) => setMaxDuration(e.target.value)}
            helperText="ระยะเวลาสูงสุดที่ให้ลูกค้าไถ่คืนสินค้า"
          />
        </Card>

        {/* Amount Limits */}
        <Card title="วงเงินจำนำ" icon="💎" subtitle="กำหนดวงเงินจำนำต่ำสุดและสูงสุด">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="วงเงินขั้นต่ำ (บาท)"
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
            <Input
              label="วงเงินสูงสุด (บาท)"
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
            />
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} loading={saving} size="lg">
            💾 บันทึกการตั้งค่า
          </Button>
        </div>
      </div>
    </div>
  );
}
