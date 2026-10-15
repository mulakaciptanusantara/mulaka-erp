import React from 'react';
import { 
  Home, 
  Users, 
  FolderKanban, 
  Calculator, 
  Receipt, 
  HardHat, 
  TrendingUp, 
  FileCheck, 
  Truck, 
  Settings, 
  Plus, 
  BadgeDollarSign, 
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  FileText,
  X
} from 'lucide-react';
import { MulakaEmblem } from '../common/MulakaLogo';
import { User } from '../../types';

export type ProyekMenuKey = 
  | 'dashboard'
  | 'team-akses'
  | 'proyek'
  | 'onboarding-klien'
  | 'estimasi-anggaran'
  | 'keuangan'
  | 'operasional'
  | 'planning-progress'
  | 'mutual-check-qc'
  | 'dokumen'
  | 'vendor-supplier'
  | 'daftar-tukang'
  | 'penggajian'
  | 'pengaturan';

interface ProjectSidebarProps {
  currentMenu: ProyekMenuKey;
  onSelectMenu: (menu: ProyekMenuKey) => void;
  currentUser: User;
  onOpenQuickNewProject: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  currentMenu,
  onSelectMenu,
  currentUser,
  onOpenQuickNewProject,
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const allMenuItems: { key: ProyekMenuKey; label: string; icon: React.ElementType; badge?: string; permKey?: string }[] = [
    { key: 'dashboard', label: 'Dashboard Proyek', icon: Home, permKey: 'dashboardProyek' },
    { key: 'team-akses', label: 'Team & Akses', icon: Users, permKey: 'teamAkses' },
    { key: 'proyek', label: 'Proyek & Klien', icon: FolderKanban, permKey: 'proyekKlien' },
    { key: 'onboarding-klien', label: 'Form Onboarding Klien', icon: FileText, badge: 'A-H', permKey: 'onboardingKlien' },
    { key: 'estimasi-anggaran', label: 'Estimasi Anggaran (RAB)', icon: Calculator, permKey: 'estimasiAnggaran' },
    { key: 'keuangan', label: 'Keuangan Proyek', icon: Receipt, badge: 'Sync', permKey: 'keuanganProyek' },
    { key: 'operasional', label: 'Operasional Lapangan', icon: HardHat, permKey: 'operasionalLapangan' },
    { key: 'planning-progress', label: 'Kurva S & Planning', icon: TrendingUp, permKey: 'planningProgress' },
    { key: 'mutual-check-qc', label: 'Mutual Check & QC', icon: ClipboardCheck, badge: 'Pre-BAST', permKey: 'mutualCheckQC' },
    { key: 'dokumen', label: 'Dokumen & Arsip', icon: FileCheck, permKey: 'dokumenArsip' },
    { key: 'vendor-supplier', label: 'Vendor & Supplier', icon: Truck, permKey: 'vendorSupplier' },
    { key: 'daftar-tukang', label: 'Daftar Tukang & Upah', icon: UserCheck, badge: 'Mulaka', permKey: 'daftarTukang' },
    { key: 'penggajian', label: 'Penggajian Karyawan', icon: BadgeDollarSign, badge: 'Payroll', permKey: 'penggajianKaryawan' },
    { key: 'pengaturan', label: 'Pengaturan & Template', icon: Settings, permKey: 'pengaturanTemplate' },
  ];

  // Dynamic permission filter for user role
  const menuItems = allMenuItems.filter(item => {
    if (currentUser.role === 'admin') return true;
    if (!currentUser.permissions) return true;
    const key = item.permKey as keyof typeof currentUser.permissions;
    return currentUser.permissions[key] !== false;
  });

  const handleItemClick = (key: ProyekMenuKey) => {
    onSelectMenu(key);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className={`h-full bg-[#1B2B4C] dark:bg-[#0A1222] text-white flex flex-col justify-between select-none shadow-2xl transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Top Branding Section with Circular Emblem */}
      <div>
        <div className="p-4 flex items-center justify-between border-b border-white/10 bg-black/15">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border-2 border-[#D4AF37] shadow-md">
              <MulakaEmblem color="#D4AF37" size={24} />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h2 className="text-xs font-black tracking-wider text-white uppercase leading-tight truncate">
                  MULAKA ERP
                </h2>
                <span className="text-[10px] text-[#D4AF37] font-semibold tracking-widest uppercase block">
                  Portal Proyek
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
                title="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
                title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Quick Add Project Button */}
        {!isCollapsed && (
          <div className="p-3">
            <button
              onClick={() => {
                onOpenQuickNewProject();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#D4AF37] text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:brightness-105 transition cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Input Proyek Baru</span>
            </button>
          </div>
        )}

        {/* Navigation Menu Items List */}
        <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentMenu === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleItemClick(item.key)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-[#111C33] text-white border-l-4 border-[#D4AF37] shadow-inner font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-[#D4AF37] border border-[#D4AF37]/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Mini Card with Circular border */}
      <div className="p-3 border-t border-white/10 bg-black/10">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5">
            <img
              src={currentUser.foto}
              alt={currentUser.nama}
              className="w-8 h-8 rounded-full object-cover border border-[#D4AF37] shrink-0"
            />
            <div className="overflow-hidden">
              <h5 className="text-xs font-bold text-white truncate">{currentUser.nama}</h5>
              <span className="text-[10px] text-slate-400 truncate block capitalize">
                {currentUser.role} &bull; {currentUser.divisi.split(' ')[0]}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <img
              src={currentUser.foto}
              alt={currentUser.nama}
              className="w-8 h-8 rounded-full object-cover border border-[#D4AF37]"
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen z-20">
        {sidebarContent}
      </aside>
    </>
  );
};
