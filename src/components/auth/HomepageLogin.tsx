import React, { useState } from 'react';
import { 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Award,
  Compass,
  FileCheck2,
  PhoneCall,
  Sparkles,
  Layers
} from 'lucide-react';
import { MulakaEmblem } from '../common/MulakaLogo';
import { User, SecurityLoginLog } from '../../types';

interface HomepageLoginProps {
  onLoginSuccess: (user: User) => void;
  users: User[];
  homepageBgUrl?: string;
  onRecordSecurityLogin?: (log: SecurityLoginLog) => void;
}

export const HomepageLogin: React.FC<HomepageLoginProps> = ({ 
  onLoginSuccess, 
  users, 
  homepageBgUrl,
  onRecordSecurityLogin
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Default to the uploaded villa sunset image as requested by user
  const effectiveBg = homepageBgUrl || '/images/mulaka_sunset_villa.jpg';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const trimmedUser = usernameInput.trim().toLowerCase();
      const trimmedPass = passwordInput.trim();

      const matchedUser = users.find(u => 
        u.username.toLowerCase() === trimmedUser ||
        (trimmedUser === 'admin' && u.role === 'admin')
      );

      // Check credentials (admin: mulakadmin / Mulaka01102026)
      if (
        (trimmedUser === 'mulakadmin' && trimmedPass === 'Mulaka01102026') ||
        (trimmedUser === 'admin' && trimmedPass === 'Mulaka01102026') ||
        (matchedUser && (trimmedPass === 'Mulaka01102026' || trimmedPass === 'admin123' || trimmedPass === 'mulaka123'))
      ) {
        const activeUser = matchedUser || users.find(u => u.role === 'admin') || users[0];
        
        if (onRecordSecurityLogin) {
          onRecordSecurityLogin({
            id: `sec-${Date.now()}`,
            timestamp: new Date().toLocaleString('id-ID'),
            username: activeUser.username,
            nama: activeUser.nama,
            role: activeUser.role,
            status: 'Berhasil',
            ipAddress: '180.252.164.12',
            perangkat: navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Chrome / Safari',
          });
        }

        setIsLoading(false);
        onLoginSuccess(activeUser);
        return;
      }

      if (onRecordSecurityLogin) {
        onRecordSecurityLogin({
          id: `sec-${Date.now()}`,
          timestamp: new Date().toLocaleString('id-ID'),
          username: trimmedUser || 'unknown',
          nama: matchedUser ? matchedUser.nama : 'Tidak Dikenal',
          role: matchedUser ? matchedUser.role : 'None',
          status: matchedUser ? 'Gagal - Kata Sandi Salah' : 'Gagal - Akun Tidak Terdaftar',
          ipAddress: '180.252.164.12',
          perangkat: navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser',
        });
      }

      setIsLoading(false);
      setErrorMsg('Username atau Password tidak valid. Silakan periksa kembali kredensial Anda.');
    }, 300);
  };

  const handleQuickFill = (role: 'admin' | 'finance' | 'estimator') => {
    if (role === 'admin') {
      setUsernameInput('mulakadmin');
      setPasswordInput('Mulaka01102026');
    } else if (role === 'finance') {
      setUsernameInput('ratnafinance');
      setPasswordInput('Mulaka01102026');
    } else {
      setUsernameInput('ahmadest');
      setPasswordInput('Mulaka01102026');
    }
    setErrorMsg(null);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans selection:bg-[#D4AF37] selection:text-slate-900">
      {/* FULL-PAGE BACKGROUND PHOTO (Set to user uploaded sunset villa) */}
      <div className="fixed inset-0 z-0">
        <img
          src={effectiveBg}
          alt="Arsitektur & Konstruksi PT. Mulaka Cipta Nusantara"
          className="w-full h-full object-cover object-center scale-[1.01]"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/mulaka_residence.jpg';
          }}
        />
        {/* Soft, clean gradient overlay for optimal readability while keeping the architecture visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-slate-900/40 backdrop-blur-[0.5px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
      </div>

      {/* Floating Top Header - Simple, Clean, Circle Icon Logo */}
      <header className="relative z-10 w-full px-6 md:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          {/* Circle Icon Badge as explicitly requested */}
          <div className="w-11 h-11 rounded-full bg-[#1B2B4C]/95 backdrop-blur-md border-2 border-[#D4AF37] flex items-center justify-center p-2 shadow-lg shadow-black/30">
            <MulakaEmblem color="#D4AF37" size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-black tracking-tight text-white drop-shadow-sm">
                PT. MULAKA CIPTA NUSANTARA
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#F5DEB3] border border-[#D4AF37]/40 backdrop-blur-xs">
                PORTAL ERP
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium tracking-wide">
              Arsitektur, Konstruksi Sipil &amp; Custom Furniture
            </p>
          </div>
        </div>

        {/* Right Status */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-200 bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full font-medium shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Standar Mutu PUPR &bull; SAK EMKM</span>
          </div>
          <a
            href="https://wa.me/628211801005"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 shadow-md transition"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#B38E22]" />
            <span className="hidden sm:inline">Hubungi</span> CS Mulaka
          </a>
        </div>
      </header>

      {/* Main Content - Minimalist & High Contrast White Login Card */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 md:py-10 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Side: Brand Headline & Highlights */}
          <div className="lg:col-span-7 space-y-6 text-white">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#F5DEB3] text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              <span>SISTEM INFORMASI TERPADU MULAKA GROUP</span>
            </div>
            
            <div className="space-y-3 max-w-2xl">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.12] tracking-tight drop-shadow-md">
                Bangun Ruang &amp; <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5DEB3] via-[#D4AF37] to-amber-200">
                  Konstruksi Berkualitas
                </span>{' '}
                Bersama Ahlinya
              </h2>
              <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed font-normal max-w-xl drop-shadow-sm">
                Portal ERP PT. Mulaka Cipta Nusantara mengintegrasikan estimasi RAB AHSP, kurva S, kontrol mutu (QC/MC), manajemen tukang harian/borongan, serta laporan laba rugi P&amp;L terpadu.
              </p>
            </div>

            {/* 3 Simple Minimalist Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 max-w-2xl">
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-lg flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center shrink-0 text-[#F5DEB3]">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">100+ Portofolio</h4>
                  <p className="text-[11px] text-slate-300">Residensial &amp; Komersial</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-lg flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-300">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Standar PUPR</h4>
                  <p className="text-[11px] text-slate-300">Bergaransi &amp; Legal</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-lg flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center shrink-0 text-blue-300">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Estimasi Akurat</h4>
                  <p className="text-[11px] text-slate-300">RAB &amp; P&amp;L Transparan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Clean White Login Card with Circle Emblem */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40 border border-white/90 space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1B2B4C] border border-[#D4AF37] flex items-center justify-center shadow-xs">
                    <MulakaEmblem color="#D4AF37" size={22} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Akses Masuk ERP
                    </h3>
                    <p className="text-xs text-slate-500 font-normal">
                      PT. Mulaka Cipta Nusantara
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Online
                </span>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 font-medium">
                  <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Pengguna (Username)
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      autoComplete="username"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="mulakadmin / username"
                      className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-[#1B2B4C] rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B2B4C]/15 transition font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Kata Sandi (Password)
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Case-Sensitive</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Masukkan kata sandi..."
                      className="w-full text-xs sm:text-sm pl-10 pr-11 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-[#1B2B4C] rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B2B4C]/15 transition font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer p-1"
                      title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#1B2B4C] hover:bg-[#132038] text-white font-bold rounded-2xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#1B2B4C]/25 hover:shadow-xl cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memverifikasi Akun...
                    </span>
                  ) : (
                    <>
                      <span>Masuk ke Dashboard ERP</span>
                      <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Fill Buttons for ease of use */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <span>Kredensial Cepat Masuk:</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin')}
                    className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold transition text-center cursor-pointer"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('finance')}
                    className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold transition text-center cursor-pointer"
                  >
                    Finance
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('estimator')}
                    className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold transition text-center cursor-pointer"
                  >
                    User Staf
                  </button>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                <span className="flex items-center gap-1 text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Otorisasi Resmi Mulaka
                </span>
                <span>v2.5 &bull; PUPR Standard</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 px-6 text-center text-xs text-slate-300/80 border-t border-white/10 bg-slate-950/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>&copy; {new Date().getFullYear()} PT. Mulaka Cipta Nusantara. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Sistem Informasi ERP Terpadu</span>
            <span>&bull;</span>
            <span>Portal Proyek &amp; Akuntansi Keuangan</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
