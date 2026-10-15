import React from 'react';
import { 
  BarChart3, 
  ListTree, 
  BookOpen, 
  Layers, 
  Scale, 
  WalletCards, 
  CreditCard, 
  Building, 
  FileEdit, 
  FileText, 
  Lock, 
  History, 
  Plus, 
  Target, 
  Hammer,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { MulakaEmblem } from '../common/MulakaLogo';
import { User } from '../../types';

export type AkuntansiMenuKey = 
  | 'dashboard'
  | 'daftar-akun'
  | 'jurnal-umum'
  | 'buku-besar'
  | 'neraca-saldo'
  | 'budget-pnl'
  | 'budget-divisi'
  | 'kas-bank'
  | 'hutang-piutang'
  | 'aset-tetap'
  | 'jurnal-penyesuaian'
  | 'laporan-keuangan'
  | 'tutup-buku'
  | 'audit-trail';

interface AccountingSidebarProps {
  currentMenu: AkuntansiMenuKey;
  onSelectMenu: (menu: AkuntansiMenuKey) => void;
  currentUser: User;
  onOpenQuickJournalModal: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AccountingSidebar: React.FC<AccountingSidebarProps> = ({
  currentMenu,
  onSelectMenu,
  currentUser,
  onOpenQuickJournalModal,
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const menuItems: { key: AkuntansiMenuKey; label: string; icon: React.ElementType; badge?: string }[] = [
    { key: 'dashboard', label: 'Dashboard Akuntansi', icon: BarChart3 },
    { key: 'budget-pnl', label: 'Budget P&L & Gaji (image.png)', icon: Target, badge: 'P&L Mulaka' },
    { key: 'daftar-akun', label: 'Daftar Akun (COA)', icon: ListTree },
    { key: 'jurnal-umum', label: 'Jurnal Umum', icon: BookOpen, badge: 'Balance' },
    { key: 'buku-besar', label: 'Buku Besar Akun', icon: Layers },
    { key: 'neraca-saldo', label: 'Neraca Saldo', icon: Scale },
    { key: 'budget-divisi', label: 'Budget Divisi & Mulaka Livin', icon: Hammer, badge: 'Costing' },
    { key: 'kas-bank', label: 'Kas & Rekening Bank', icon: WalletCards },
    { key: 'hutang-piutang', label: 'Hutang & Piutang', icon: CreditCard },
    { key: 'aset-tetap', label: 'Aset Tetap & Depresiasi', icon: Building },
    { key: 'jurnal-penyesuaian', label: 'Jurnal Penyesuaian', icon: FileEdit },
    { key: 'laporan-keuangan', label: 'Laporan Keuangan', icon: FileText, badge: 'Export' },
    { key: 'tutup-buku', label: 'Tutup Buku Periode', icon: Lock },
    { key: 'audit-trail', label: 'Audit Trail Sistem', icon: History },
  ];

  const handleItemClick = (key: AkuntansiMenuKey) => {
    onSelectMenu(key);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className={`h-full bg-[#111C33] dark:bg-[#070D18] text-white flex flex-col justify-between select-none shadow-2xl transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Top Branding Section */}
      <div>
        <div className="p-4 flex items-center justify-between border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Circle Logo Badge */}
            <div className="w-10 h-10 rounded-full bg-blue-600/30 flex items-center justify-center shrink-0 border-2 border-[#D4AF37] shadow-md">
              <MulakaEmblem color="#D4AF37" size={24} />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h2 className="text-xs font-black tracking-wider text-white uppercase leading-tight truncate">
                  MULAKA ERP
                </h2>
                <span className="text-[10px] text-blue-400 font-semibold tracking-widest uppercase block">
                  Portal Akuntansi
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

        {/* Quick Add Journal Button */}
        {!isCollapsed && (
          <div className="p-3">
            <button
              onClick={() => {
                onOpenQuickJournalModal();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 transition cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Input Jurnal Umum</span>
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
                    ? 'bg-blue-600/30 text-white border-l-4 border-blue-400 font-bold shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-400/20 text-blue-300 border border-blue-400/30">
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

      {/* Bottom User Mini Card */}
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
              <span className="text-[10px] text-blue-400 truncate block capitalize">
                {currentUser.role} &bull; Keuangan
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
