import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Wallet, 
  Receipt, 
  TrendingUp, 
  Clock, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Send, 
  Package, 
  ShoppingBag, 
  CheckCircle2, 
  Plus, 
  Filter, 
  ArrowUpRight,
  Layers,
  Table as TableIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Cell, 
  Legend 
} from 'recharts';
import { Project, CashflowItem, WeeklyMaterialPO, User } from '../../types';
import { formatRupiahDisplay, TRANSACTION_CATEGORIES } from '../../utils/formatters';

interface ProyekDashboardViewProps {
  projects: Project[];
  cashflow: CashflowItem[];
  weeklyPOs: WeeklyMaterialPO[];
  currentUser: User;
  onNavigateMenu: (menu: any) => void;
  onSelectProjectDetail: (p: Project) => void;
  onMarkPOPurchased: (poId: string) => void;
}

const CATEGORY_COLORS = [
  '#1B2B4C', '#D4AF37', '#10B981', '#3B82F6', '#8B5CF6', 
  '#EC4899', '#F59E0B', '#06B6D4', '#84CC16', '#64748B',
  '#E11D48', '#14B8A6', '#F97316', '#6366F1', '#A855F7', '#71717A'
];

export const ProyekDashboardView: React.FC<ProyekDashboardViewProps> = ({
  projects,
  cashflow,
  weeklyPOs,
  currentUser,
  onNavigateMenu,
  onSelectProjectDetail,
  onMarkPOPurchased,
}) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('Semua');
  const [rekapTimeframe, setRekapTimeframe] = useState<'minggu' | 'bulan' | 'tahun'>('bulan');
  const [activeChartMode, setActiveChartMode] = useState<'arus-kas' | 'kategori'>('arus-kas');

  const today = new Date();
  const dateStr = today.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const totalKontrak = projects.reduce((sum, p) => sum + (p.nilai || 0), 0);
  const totalPemasukan = cashflow.reduce((sum, c) => sum + (c.pemasukan || 0), 0);
  const totalPengeluaran = cashflow.reduce((sum, c) => sum + (c.pengeluaran || 0), 0);
  const saldoKas = cashflow.length > 0 ? cashflow[0].saldo : 0;
  const sisaPiutang = projects.reduce((sum, p) => sum + (p.sisa || 0), 0);
  const activeProjects = projects.filter(p => p.status === 'Aktif');

  const maxCarousel = Math.max(0, projects.length - 2);
  const prevSlide = () => setCarouselIndex(prev => (prev > 0 ? prev - 1 : maxCarousel));
  const nextSlide = () => setCarouselIndex(prev => (prev < maxCarousel ? prev + 1 : 0));

  const projectOptions = useMemo(() => {
    const list = Array.from(new Set(projects.map(p => p.nama_proyek))).filter(Boolean);
    return ['Semua', ...list, 'Non-Proyek / Operasional Umum'];
  }, [projects]);

  const scopedCashflow = useMemo(() => {
    if (selectedProjectFilter === 'Semua') return cashflow;
    return cashflow.filter(c => c.proyek === selectedProjectFilter);
  }, [cashflow, selectedProjectFilter]);

  const categoryRecap = useMemo(() => {
    const currentYear = today.getFullYear().toString();
    const currentMonth = today.toISOString().substring(0, 7);

    return TRANSACTION_CATEGORIES.map(cat => {
      const items = scopedCashflow.filter(c => c.kategori === cat);
      const totalKeluar = items.reduce((sum, i) => sum + (i.pengeluaran || 0), 0);
      const totalMasuk = items.reduce((sum, i) => sum + (i.pemasukan || 0), 0);

      const w1 = items.filter(c => {
        const d = parseInt((c.tanggal || '').split('-')[2] || '1', 10);
        return d >= 1 && d <= 7;
      }).reduce((sum, i) => sum + (i.pengeluaran || 0), 0);

      const w2 = items.filter(c => {
        const d = parseInt((c.tanggal || '').split('-')[2] || '1', 10);
        return d >= 8 && d <= 14;
      }).reduce((sum, i) => sum + (i.pengeluaran || 0), 0);

      const w3 = items.filter(c => {
        const d = parseInt((c.tanggal || '').split('-')[2] || '1', 10);
        return d >= 15 && d <= 21;
      }).reduce((sum, i) => sum + (i.pengeluaran || 0), 0);

      const w4 = items.filter(c => {
        const d = parseInt((c.tanggal || '').split('-')[2] || '1', 10);
        return d >= 22;
      }).reduce((sum, i) => sum + (i.pengeluaran || 0), 0);

      const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().substring(0, 7);
      const bLalu = items.filter(c => (c.tanggal || '').startsWith(prevMonth)).reduce((sum, i) => sum + (i.pengeluaran || 0), 0);
      const bIni = items.filter(c => (c.tanggal || '').startsWith(currentMonth)).reduce((sum, i) => sum + (i.pengeluaran || 0), 0);
      const thnIni = items.filter(c => (c.tanggal || '').startsWith(currentYear)).reduce((sum, i) => sum + (i.pengeluaran || 0), 0);

      return {
        kategori: cat,
        totalKeluar,
        totalMasuk,
        w1,
        w2,
        w3,
        w4,
        bLalu,
        bIni,
        thnIni,
        count: items.length,
      };
    });
  }, [scopedCashflow, today]);

  const weeklyPOsCurrent = useMemo(() => {
    return weeklyPOs.filter(p => !p.sudahTerbeli);
  }, [weeklyPOs]);

  const monthlyCashflowData = useMemo(() => {
    const map: { [m: string]: { bulan: string; masuk: number; keluar: number } } = {};
    scopedCashflow.forEach(c => {
      const m = (c.tanggal || '').substring(0, 7) || '2026-10';
      if (!map[m]) map[m] = { bulan: m, masuk: 0, keluar: 0 };
      map[m].masuk += c.pemasukan || 0;
      map[m].keluar += c.pengeluaran || 0;
    });
    const result = Object.values(map);
    if (result.length === 0) {
      return [
        { bulan: 'Agt 2026', masuk: 0, keluar: 0 },
        { bulan: 'Sep 2026', masuk: 0, keluar: 0 },
        { bulan: 'Okt 2026', masuk: 0, keluar: 0 },
      ];
    }
    return result;
  }, [scopedCashflow]);

  const topCategoryExpense = useMemo(() => {
    const valid = categoryRecap
      .filter(c => c.totalKeluar > 0)
      .map(c => ({ name: c.kategori, value: c.totalKeluar }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    if (valid.length === 0) {
      return [{ name: 'Belum Ada Transaksi', value: 0 }];
    }
    return valid;
  }, [categoryRecap]);

  return (
    <div className="space-y-5">
      {/* 1. Header Banner with Circular Avatar */}
      <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={currentUser.foto}
            alt={currentUser.nama}
            className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AF37] shadow-xs shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base md:text-lg text-[#1B2B4C] dark:text-white">
                Executive Dashboard &bull; {currentUser.nama}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-[#D4AF37]/20 text-[#1B2B4C] dark:text-amber-300">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              PT. Mulaka Cipta Nusantara &bull; {dateStr}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 self-start md:self-auto text-xs">
          <button
            onClick={() => onNavigateMenu('proyek')}
            className="bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Input Proyek Baru</span>
          </button>
          <button
            onClick={() => onNavigateMenu('keuangan')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Input Jurnal Kas</span>
          </button>
        </div>
      </div>

      {/* 2. 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Nilai Kontrak
          </span>
          <div className="mt-1.5">
            <h3 className="text-sm md:text-base font-bold font-mono text-[#1B2B4C] dark:text-white">
              {formatRupiahDisplay(totalKontrak)}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{projects.length} Proyek Portofolio</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Realisasi Kas Masuk
          </span>
          <div className="mt-1.5">
            <h3 className="text-sm md:text-base font-bold font-mono text-emerald-700 dark:text-emerald-400">
              {formatRupiahDisplay(totalPemasukan)}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">DP &amp; Termin Diterima</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Pengeluaran Riil
          </span>
          <div className="mt-1.5">
            <h3 className="text-sm md:text-base font-bold font-mono text-rose-700 dark:text-rose-400">
              {formatRupiahDisplay(totalPengeluaran)}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Material &amp; Upah Lapangan</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Saldo Kas Berjalan
          </span>
          <div className="mt-1.5">
            <h3 className="text-sm md:text-base font-bold font-mono text-blue-800 dark:text-blue-300">
              {formatRupiahDisplay(saldoKas)}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Kas &amp; Rekening Bank</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Sisa Piutang Klien
          </span>
          <div className="mt-1.5">
            <h3 className="text-sm md:text-base font-bold font-mono text-amber-700 dark:text-amber-300">
              {formatRupiahDisplay(sisaPiutang)}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Termin Belum Tertagih</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-[#1B2B4C] dark:text-slate-300 uppercase tracking-wider">
            Proyek Aktif
          </span>
          <div className="mt-1.5">
            <h3 className="text-sm md:text-base font-bold font-mono text-[#1B2B4C] dark:text-white">
              {activeProjects.length} Proyek
            </h3>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Sedang Berjalan</p>
          </div>
        </div>
      </div>

      {/* 3. DAFTAR PEMBELIAN BARANG MINGGU INI & PROYEK CAROUSEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-bold text-sm md:text-base text-[#1B2B4C] dark:text-white">
                  Daftar Pembelian Barang Minggu Ini
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Rencana pengadaan material proyek (Dapat di-reset setiap minggu jika sudah terbeli)
              </p>
            </div>
            <span className="text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-full font-bold">
              {weeklyPOsCurrent.length} PO Belum Terbeli
            </span>
          </div>

          {weeklyPOsCurrent.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-850 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Semua Pembelian Material Minggu Ini Sudah Terbeli!</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Jadwal belanja telah selesai. PO baru dapat ditambahkan di modul Operasional/Logistik.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {weeklyPOsCurrent.map((po) => (
                <div
                  key={po.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 transition bg-slate-50/50 dark:bg-slate-850 flex flex-col justify-between gap-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#1B2B4C] dark:text-white">{po.nomorPO}</span>
                        <span className="text-[9px] bg-[#1B2B4C] dark:bg-slate-900 text-[#D4AF37] px-2 py-0.2 rounded font-bold">
                          Minggu ke-{po.mingguKe}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          Supplier: <strong>{po.supplier}</strong>
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 mt-1">{po.namaProyek}</h4>
                    </div>
                    <div className="text-right sm:text-right">
                      <strong className="text-xs font-mono font-bold text-[#1B2B4C] dark:text-white block">
                        {formatRupiahDisplay(po.totalBiaya)}
                      </strong>
                      <span className="text-[10px] text-slate-400">{po.tanggalRencana}</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200/70 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                    {po.items.slice(0, 3).map((it, idx) => (
                      <div key={it.id || idx} className="flex justify-between">
                        <span>&bull; {it.namaMaterial} ({it.volume} {it.satuan})</span>
                        <span className="font-mono text-slate-500 dark:text-slate-400">{formatRupiahDisplay(it.total)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400">
                      Status: <strong className="text-amber-700 dark:text-amber-400">{po.status}</strong>
                    </span>
                    <button
                      onClick={() => onMarkPOPurchased(po.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Tandai Sudah Terbeli</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Carousel Daftar Proyek */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-bold text-sm md:text-base text-[#1B2B4C] dark:text-white">
                  Daftar Proyek ({projects.length})
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Pantauan progress &amp; kontrak</p>
            </div>
            {projects.length > 2 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={prevSlide}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-slate-600 dark:text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-slate-600 dark:text-slate-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {projects.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-850 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum Ada Proyek</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Klik "Input Proyek Baru" untuk memulai.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(carouselIndex, carouselIndex + 2).map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => onSelectProjectDetail(proj)}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#1B2B4C] dark:hover:border-blue-500 transition cursor-pointer bg-white dark:bg-slate-850 shadow-2xs hover:shadow-xs group"
                >
                  <div className="flex gap-3">
                    <img
                      src={proj.thumbnail}
                      alt={proj.nama_proyek}
                      className="w-16 h-16 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider truncate">
                          {proj.sub_divisi}
                        </span>
                        <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                          {proj.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-[#1B2B4C] dark:text-white truncate mt-0.5 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition">
                        {proj.nama_proyek}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Klien: {proj.nama_klien}</p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {formatRupiahDisplay(proj.nilai)}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          Progress: {proj.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2.5">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <button
              onClick={() => onNavigateMenu('proyek')}
              className="text-blue-700 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Seluruh Daftar Proyek</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. CASHFLOW REKAPITULASI BERDASARKAN KATEGORI */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden space-y-0">
        <div className="p-4 md:p-5 bg-slate-50/80 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-[#D4AF37]" />
              <h2 className="text-sm md:text-base font-bold text-[#1B2B4C] dark:text-white">
                Cashflow Rekapitulasi Berdasarkan Kategori Pengeluaran &amp; Pemasukan
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Mencakup per minggu / bulan / tahun &bull; Dapat di-filter berdasarkan Nama Proyek
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Filter Proyek:</span>
              <select
                value={selectedProjectFilter}
                onChange={(e) => setSelectedProjectFilter(e.target.value)}
                className="text-xs bg-transparent border-0 outline-none font-bold text-[#1B2B4C] dark:text-white max-w-[200px] truncate cursor-pointer"
              >
                {projectOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-xl shadow-2xs">
              <button
                onClick={() => setRekapTimeframe('minggu')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  rekapTimeframe === 'minggu' ? 'bg-[#1B2B4C] text-white dark:bg-blue-600 shadow-2xs' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Mingguan
              </button>
              <button
                onClick={() => setRekapTimeframe('bulan')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  rekapTimeframe === 'bulan' ? 'bg-[#1B2B4C] text-white dark:bg-blue-600 shadow-2xs' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Bulanan
              </button>
              <button
                onClick={() => setRekapTimeframe('tahun')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  rekapTimeframe === 'tahun' ? 'bg-[#1B2B4C] text-white dark:bg-blue-600 shadow-2xs' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Tahunan
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-3.5 w-10 text-center">No</th>
                <th className="py-3 px-3.5">Kategori Transaksi</th>
                
                {rekapTimeframe === 'minggu' && (
                  <>
                    <th className="py-3 px-3.5 text-right font-mono">Minggu 1 (Tgl 1-7)</th>
                    <th className="py-3 px-3.5 text-right font-mono">Minggu 2 (Tgl 8-14)</th>
                    <th className="py-3 px-3.5 text-right font-mono">Minggu 3 (Tgl 15-21)</th>
                    <th className="py-3 px-3.5 text-right font-mono">Minggu 4 (Tgl 22+)</th>
                  </>
                )}
                {rekapTimeframe === 'bulan' && (
                  <>
                    <th className="py-3 px-3.5 text-right font-mono">Bulan Lalu</th>
                    <th className="py-3 px-3.5 text-right font-mono">Bulan Ini</th>
                  </>
                )}
                {rekapTimeframe === 'tahun' && (
                  <>
                    <th className="py-3 px-3.5 text-right font-mono">Tahun Ini ({today.getFullYear()})</th>
                    <th className="py-3 px-3.5 text-center font-mono">Total Transaksi</th>
                  </>
                )}
                <th className="py-3 px-3.5 text-right font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20">Total Pemasukan</th>
                <th className="py-3 px-3.5 text-right font-mono text-rose-700 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20">Total Pengeluaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categoryRecap.map((row, idx) => (
                <tr key={row.kategori} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition">
                  <td className="py-2.5 px-3.5 text-center font-mono text-slate-400 text-[11px]">{idx + 1}</td>
                  <td className="py-2.5 px-3.5 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                    />
                    <span>{row.kategori}</span>
                  </td>
                  {rekapTimeframe === 'minggu' && (
                    <>
                      <td className="py-2.5 px-3.5 text-right font-mono text-slate-600 dark:text-slate-400">
                        {formatRupiahDisplay(row.w1)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono text-slate-600 dark:text-slate-400">
                        {formatRupiahDisplay(row.w2)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono text-slate-600 dark:text-slate-400">
                        {formatRupiahDisplay(row.w3)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono text-slate-600 dark:text-slate-400">
                        {formatRupiahDisplay(row.w4)}
                      </td>
                    </>
                  )}
                  {rekapTimeframe === 'bulan' && (
                    <>
                      <td className="py-2.5 px-3.5 text-right font-mono text-slate-600 dark:text-slate-400">
                        {formatRupiahDisplay(row.bLalu)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {formatRupiahDisplay(row.bIni)}
                      </td>
                    </>
                  )}
                  {rekapTimeframe === 'tahun' && (
                    <>
                      <td className="py-2.5 px-3.5 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {formatRupiahDisplay(row.thnIni)}
                      </td>
                      <td className="py-2.5 px-3.5 text-center font-mono text-slate-500 dark:text-slate-400">
                        {row.count} Transaksi
                      </td>
                    </>
                  )}
                  <td className="py-2.5 px-3.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/20">
                    {row.totalMasuk > 0 ? formatRupiahDisplay(row.totalMasuk) : '-'}
                  </td>
                  <td className={`py-2.5 px-3.5 text-right font-mono font-bold bg-rose-50/20 ${
                    row.totalKeluar > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-slate-400'
                  }`}>
                    {row.totalKeluar > 0 ? formatRupiahDisplay(row.totalKeluar) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Interactive Charts */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <h3 className="font-bold text-sm md:text-base text-[#1B2B4C] dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
              <span>Grafik Performa Arus Kas &amp; Alokasi Kategori</span>
            </h3>
            <p className="text-[11px] text-slate-400">Analisis visual arus kas masuk vs keluar secara berkala</p>
          </div>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveChartMode('arus-kas')}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                activeChartMode === 'arus-kas' ? 'bg-white dark:bg-slate-900 text-[#1B2B4C] dark:text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Tren Kas Bulanan
            </button>
            <button
              onClick={() => setActiveChartMode('kategori')}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                activeChartMode === 'kategori' ? 'bg-white dark:bg-slate-900 text-[#1B2B4C] dark:text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Komposisi Pengeluaran
            </button>
          </div>
        </div>

        <div className="h-64 w-full">
          {activeChartMode === 'arus-kas' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyCashflowData} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E11D48" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#E11D48" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94A3B822" />
                <XAxis dataKey="bulan" tick={{ fontSize: 11 }} stroke="#64748B" />
                <YAxis tick={{ fontSize: 10 }} stroke="#64748B" tickFormatter={(v) => `Rp ${(v / 1000000).toFixed(0)}Jt`} />
                <Tooltip formatter={(v: any) => formatRupiahDisplay(Number(v))} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="masuk" name="Kas Masuk (Rp)" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorMasuk)" />
                <Area type="monotone" dataKey="keluar" name="Pengeluaran (Rp)" stroke="#E11D48" strokeWidth={2} fillOpacity={1} fill="url(#colorKeluar)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCategoryExpense} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94A3B822" />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="#64748B" tickFormatter={(v) => `Rp ${(v / 1000000).toFixed(0)}Jt`} />
                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 10 }} stroke="#64748B" />
                <Tooltip formatter={(v: any) => formatRupiahDisplay(Number(v))} />
                <Bar dataKey="value" name="Total Biaya" radius={[0, 6, 6, 0]}>
                  {topCategoryExpense.map((_, index) => (
                    <Cell key={`bar-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
