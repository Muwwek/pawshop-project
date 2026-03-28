'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity, password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'เกิดข้อผิดพลาด');
        setLoading(false);
        return;
      }

      // Redirect ตาม role
      if (data.user.role === 'CUSTOMER') {
        router.push('/dashboard/portal');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      setLoading(false);
    }
  };

  const setDemoCredentials = (user: string, pass: string) => {
    setIdentity(user);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[150px] animate-float" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[150px] animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse-slow" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/20 mb-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
            <Sparkles className="w-8 h-8 text-white relative" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">PawShop</h1>
          <p className="text-slate-400 text-sm">ระบบจัดการร้านรับจำนำ</p>
        </div>

        {/* Login Card */}
        <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-3xl p-8 border border-white/[0.08] shadow-2xl">
          {/* Decorative Gradient */}
          <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          <div className="mb-6 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">ยินดีต้อนรับกลับมา</h2>
              <p className="text-slate-400 text-sm">กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-xs"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              กลับหน้าหลัก
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username/Email Input */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300 font-medium">ชื่อผู้ใช้ หรือ อีเมล</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้ หรือ อีเมล"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300 font-medium">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-4 h-4 border border-white/20 rounded peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-colors" />
                  <svg
                    className="absolute inset-0 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-slate-400 group-hover:text-slate-300 transition-colors">จดจำฉัน</span>
              </label>
              <Link
                href="#"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-red-300">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  <>
                    เข้าสู่ระบบ
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>

            {/* Register Link */}
            <div className="text-center pt-2">
              <span className="text-slate-500 text-sm">ยังไม่มีบัญชี? </span>
              <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors">
                สมัครสมาชิก
              </Link>
            </div>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-500 text-center mb-4">
              บัญชีทดสอบ (คลิกเพื่อเลือก)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { user: 'owner01', label: 'เจ้าของ', icon: '👑', color: 'amber' },
                { user: 'staff01', label: 'พนักงาน', icon: '👤', color: 'blue' },
                { user: 'customer01', label: 'ลูกค้า', icon: '🏠', color: 'emerald' },
              ].map((demo) => (
                <button
                  key={demo.user}
                  onClick={() => setDemoCredentials(demo.user, demo.user === 'customer01' ? 'abc1234' : 'myteam12345')}
                  className={`group flex flex-col items-center gap-2 px-3 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-${demo.color}-500/30 transition-all duration-300`}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform duration-300">
                    {demo.icon}
                  </span>
                  <div className="text-center">
                    <span className={`block text-xs font-medium text-${demo.color}-400`}>
                      {demo.label}
                    </span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">{demo.user}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-8">
          © 2024 PawShop. สงวนลิขสิทธิ์.
        </p>
      </div>
    </div>
  );
}
