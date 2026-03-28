'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Box, Sparkles, TrendingUp, Users, Clock, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden font-sans">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-slate-950 to-purple-950/90" />

        {/* Animated Orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[150px] animate-float" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[150px] animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[200px] animate-pulse-slow" />

        {/* Light Beams */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-indigo-500/30 to-transparent animate-beam" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-purple-500/30 to-transparent animate-beam" style={{ animationDelay: '2s' }} />
        <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500/30 to-transparent animate-beam" style={{ animationDelay: '4s' }} />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
            <span className="relative text-xl font-bold text-white">P</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
            PawShop
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden sm:block text-sm text-indigo-200/70 hover:text-white transition-colors"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            href="/login"
            className="group relative px-5 py-2.5 text-sm font-medium text-white rounded-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-indigo-400 to-purple-500" />
            <span className="relative flex items-center gap-2">
              เริ่มต้นใช้งาน
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 pt-16 pb-20">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="group mb-8 p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-medium text-indigo-200 tracking-wide">
                ระบบจัดการร้านรับจำนำยุคใหม่
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
            <span className="block">จัดการร้านรับจำนำ</span>
            <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              ให้ง่ายกว่าที่เคย
            </span>
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-slate-400 mb-10 leading-relaxed">
            ยกระดับธุรกิจรับจำนำของคุณด้วยระบบดิจิทัลที่ทันสมัย
            จัดการสัญญา ลูกค้า และการเงินได้อย่างมืออาชีพ
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
            <Link
              href="/login"
              className="group relative px-8 py-4 bg-white text-slate-900 rounded-full font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              <span className="relative flex items-center gap-2">
                ทดลองใช้งานฟรี
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="/register"
              className="group px-8 py-4 text-white/80 hover:text-white font-medium transition-colors flex items-center gap-2"
            >
              สมัครสมาชิก
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-24">
            {[
              { value: '10K+', label: 'สัญญาที่จัดการ' },
              { value: '5K+', label: 'ลูกค้าในระบบ' },
              { value: '99.9%', label: 'ความปลอดภัย' },
              { value: '24/7', label: 'พร้อมใช้งาน' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
            {[
              {
                icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
                title: 'ปลอดภัยสูงสุด',
                desc: 'ระบบเข้ารหัสข้อมูลระดับธนาคาร พร้อมการยืนยันตัวตนหลายขั้นตอน',
                gradient: 'from-emerald-500/20 to-teal-500/20',
              },
              {
                icon: <Box className="w-6 h-6 text-indigo-400" />,
                title: 'จัดการครบวงจร',
                desc: 'บันทึกสัญญา คำนวณดอกเบี้ย และติดตามการไถ่คืนในที่เดียว',
                gradient: 'from-indigo-500/20 to-blue-500/20',
              },
              {
                icon: <TrendingUp className="w-6 h-6 text-purple-400" />,
                title: 'รายงาน Real-time',
                desc: 'ดูภาพรวมธุรกิจและสถิติสำคัญแบบเรียลไทม์ตลอด 24 ชั่วโมง',
                gradient: 'from-purple-500/20 to-pink-500/20',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-300"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Additional Features Section */}
      <section className="relative z-10 py-24 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ทำไมต้องเลือก <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">PawShop</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              ระบบที่ออกแบบมาเฉพาะสำหรับธุรกิจรับจำนำ ครบครันทุกฟีเจอร์ที่คุณต้องการ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Clock className="w-5 h-5" />, title: 'ประหยัดเวลา', desc: 'ลดเวลาการทำงานลง 80% ด้วยระบบอัตโนมัติ' },
              { icon: <Users className="w-5 h-5" />, title: 'จัดการลูกค้า', desc: 'ระบบ CRM ในตัวสำหรับติดตามลูกค้า' },
              { icon: <ShieldCheck className="w-5 h-5" />, title: 'ปลอดภัย', desc: 'ข้อมูลเข้ารหัสและสำรองอัตโนมัติ' },
              { icon: <TrendingUp className="w-5 h-5" />, title: 'วิเคราะห์', desc: 'รายงานและกราฟวิเคราะห์ธุรกิจ' },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h4 className="text-white font-medium mb-2">{item.title}</h4>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <div className="relative max-w-4xl mx-auto p-12 md:p-16 rounded-3xl overflow-hidden text-center">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 to-purple-700/90" />
            {/* cspell:disable-next-line */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

            {/* Content */}
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                พร้อมยกระดับธุรกิจของคุณ?
              </h2>
              <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
                เริ่มต้นใช้งานฟรีวันนี้ ไม่ต้องใช้บัตรเครดิต
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-full font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                เริ่มต้นใช้งานฟรี
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-white font-semibold">PawShop</span>
            </div>
            <p className="text-slate-500 text-sm">
              © 2024 PawShop Management System. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/login" className="hover:text-white transition-colors">เข้าสู่ระบบ</Link>
              <Link href="/register" className="hover:text-white transition-colors">สมัครสมาชิก</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
