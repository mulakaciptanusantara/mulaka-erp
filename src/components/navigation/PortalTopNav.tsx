import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  Calculator, 
  Search, 
  Cloud, 
  LogOut, 
  Moon, 
  Sun, 
  ShieldCheck, 
  RotateCcw, 
  Menu, 
  ChevronDown, 
  User as UserIcon, 
  MessageCircle, 
  CreditCard, 
  Settings, 
  ExternalLink,
  Lock,
  Activity,
  HardHat
} from 'lucide-react';
import { User, CompanyProfile } from '../../types';
import { cleanPhoneForWhatsApp } from '../../utils/formatters';

interface PortalTopNavProps {
  currentPortal: 'proyek' | 'akuntansi';
  onSwitchPortal: (portal: 'proyek' | 'akuntansi') => void;
  currentUser: User;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenDriveSettings: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onResetAllDataToEmpty?: () => void;
  onLoadSampleData?: () => void;
  onOpenMobileMenu?: () => void;
  onOpenProfileModal?: () => void;
  onOpenSecurityLogs?: () => void;
  companyProfile?: CompanyProfile;
}

export const PortalTopNav: React.FC<PortalTopNavProps> = ({
  currentPortal,
  onSwitchPortal,
  currentUser,
  onLogout,
  searchQuery,
  onSearchChange,
  onOpenDriveSettings,
  isDarkMode,
  onToggleDarkMode,
  onResetAllDataToEmpty,
  onLoadSampleData,
  onOpenMobileMenu,
  onOpenProfileModal,
  onOpenSecurityLogs,
  companyProfile,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const canAccessAccounting = currentUser.role === 'admin' || currentUser.role === 'finance' || (currentUser.permissions?.portalAkuntansi ?? false);
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const waNumber = cleanPhoneForWhatsApp(currentUser.telepon);

  return (
    <header className="h-16 bg-white dark:bg-[#0A1220] border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30 select-none shadow-xs transition-colors duration-200">
      {/* Left: Mobile Menu Trigger + Portal Switcher Tabs */}
      <div className="flex items-center gap-2">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            title="Buka Menu Navigasi"
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-2xs"
          >
            <Menu className="w-5 h-5 text-[#1B2B4C] dark:text-[#D4AF37]" />
          </button>
        )}

        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <button
            onClick={() => onSwitchPortal('proyek')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              currentPortal === 'proyek'
                ? 'bg-[#1B2B4C] text-white shadow-2xs dark:bg-blue-600'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#1B2B4C] dark:hover:text-white'
            }`}
          >
            <Building2 className={`w-3.5 h-3.5 ${currentPortal === 'proyek' ? 'text-[#D4AF37]' : ''}`} />
            <span className="hidden xs:inline">Portal</span> Proyek
          </button>

          <button
            onClick={() => {
              if (canAccessAccounting) {
                onSwitchPortal('akuntansi');
              } else {
                alert('Akses Dibatasi: Portal Akuntansi hanya untuk Administrator dan Divisi Finance.');
              }
            }}
            title={canAccessAccounting ? 'Buka Portal Akuntansi' : 'Akses Dibatasi (Finance/Admin Only)'}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              currentPortal === 'akuntansi'
                ? 'bg-[#1B2B4C] text-white shadow-2xs dark:bg-blue-600'
                : canAccessAccounting
                ? 'text-slate-600 dark:text-slate-300 hover:text-[#1B2B4C] dark:hover:text-white'
                : 'text-slate-400 dark:text-slate-500 opacity-60 cursor-not-allowed'
            }`}
          >
            <Calculator className={`w-3.5 h-3.5 ${currentPortal === 'akuntansi' ? 'text-[#D4AF37]' : ''}`} />
            <span className="hidden xs:inline">Portal</span> Akuntansi
            {!canAccessAccounting && (
              <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-500 px-1.5 py-0.2 rounded font-mono">
                Lock
              </span>
            )}
          </button>
        </div>

        {/* Live sync status badge */}
        <div className="hidden xl:flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Realtime DB Cache</span>
        </div>
      </div>

      {/* Middle: Search Box */}
      <div className="relative flex-1 max-w-xs md:max-w-md hidden md:block">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={
            currentPortal === 'proyek'
              ? 'Cari proyek, RAB, tukang, onboarding...'
              : 'Cari jurnal, COA, budget P&L, buku besar...'
          }
          className="w-full text-xs pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-[#1B2B4C] dark:focus:ring-blue-500 transition"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Security & Audit Log for Admin */}
        {isAdmin && onOpenSecurityLogs && (
          <button
            onClick={onOpenSecurityLogs}
            title="Buka Log Keamanan & Histori Perubahan Database"
            className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1.5 rounded-xl hover:bg-indigo-100 transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Log Keamanan</span>
          </button>
        )}

        {/* 1-Time Initial Launch Reset (Requested by User) */}
        {isAdmin && onResetAllDataToEmpty && (
          <button
            onClick={onResetAllDataToEmpty}
            title="Reset Data 1x Pakai Awal Launching Web (Proyek & Akuntansi Dari Nol)"
            className="hidden lg:flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-2.5 py-1.5 rounded-xl hover:bg-rose-100 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-rose-500" />
            <span>Reset 1x Launch</span>
          </button>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          title={isDarkMode ? 'Ganti ke Mode Terang (Light Mode)' : 'Ganti ke Mode Gelap (Dark Mode)'}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-amber-400 transition cursor-pointer flex items-center justify-center shadow-2xs"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Google Drive Status */}
        <button
          onClick={onOpenDriveSettings}
          title="Sinkronisasi Google Drive & Spreadsheet / AppScript"
          className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl transition cursor-pointer"
        >
          <Cloud className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden md:inline">Drive &amp; Cloud</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        </button>

        {/* Direct Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          title="Keluar dari Sesi ERP (Log Out)"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 transition cursor-pointer shadow-2xs"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span className="hidden sm:inline">Keluar</span>
        </button>

        {/* User Profile Avatar with Interactive Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            title="Menu Akun & Profil Pengguna"
            className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <img
              src={currentUser.foto}
              alt={currentUser.nama}
              className="w-8 h-8 rounded-full object-cover border-2 border-[#D4AF37] shrink-0"
            />
            <div className="hidden lg:block text-left leading-tight">
              <h4 className="text-xs font-bold text-[#1B2B4C] dark:text-white truncate max-w-[120px]">
                {currentUser.nama}
              </h4>
              <span className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider block">
                {currentUser.role} &bull; {currentUser.divisi.split(' ')[0]}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Interactive User Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <img
                  src={currentUser.foto}
                  alt={currentUser.nama}
                  className="w-11 h-11 rounded-full object-cover border-2 border-[#D4AF37] shadow-sm"
                />
                <div className="overflow-hidden">
                  <h4 className="font-extrabold text-sm text-[#1B2B4C] dark:text-white truncate">
                    {currentUser.nama}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser.email}
                  </p>
                  <span className="inline-block mt-0.5 text-[9px] bg-[#1B2B4C] text-[#D4AF37] dark:bg-blue-900/60 font-bold px-2 py-0.2 rounded-full uppercase tracking-wider">
                    {currentUser.role} &bull; {currentUser.divisi}
                  </span>
                </div>
              </div>

              <div className="p-2 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    if (onOpenProfileModal) onOpenProfileModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition text-left cursor-pointer font-medium"
                >
                  <UserIcon className="w-4 h-4 text-[#D4AF37]" />
                  <div className="flex-1">
                    <span className="block font-bold">Profil Lengkap Pribadi</span>
                    <span className="text-[10px] text-slate-400">NIK, WhatsApp &amp; Rekening Bank</span>
                  </div>
                </button>

                {isAdmin && onOpenSecurityLogs && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenSecurityLogs();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 transition text-left cursor-pointer font-medium"
                  >
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <div className="flex-1">
                      <span className="block font-bold">Log Keamanan &amp; Aktivitas</span>
                      <span className="text-[10px] text-slate-400">Riwayat Login &amp; Transaksi DB</span>
                    </div>
                  </button>
                )}

                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 transition text-left cursor-pointer font-medium"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                  <div className="flex-1">
                    <span className="block font-bold">WhatsApp Pribadi</span>
                    <span className="text-[10px] opacity-75">{currentUser.telepon}</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-emerald-500" />
                </a>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 px-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition text-left cursor-pointer font-bold"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Keluar / Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
