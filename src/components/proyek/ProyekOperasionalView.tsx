import React, { useState } from 'react';
import { 
  HardHat, 
  FileText, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  ShoppingBag, 
  X 
} from 'lucide-react';
import { DailyReport, Project, WeeklyMaterialPO, WeeklyMaterialPOItem } from '../../types';
import { requestAIImageAnalysis } from '../../services/geminiService';
import { formatRupiahDisplay } from '../../utils/formatters';

interface ProyekOperasionalViewProps {
  dailyReports: DailyReport[];
  projects: Project[];
  weeklyPOs: WeeklyMaterialPO[];
  onAddDailyReport: (report: DailyReport) => void;
  onMarkPOPurchased: (id: string) => void;
  onAddWeeklyPO?: (po: WeeklyMaterialPO) => void;
}

export const ProyekOperasionalView: React.FC<ProyekOperasionalViewProps> = ({
  dailyReports,
  projects,
  weeklyPOs,
  onAddDailyReport,
  onMarkPOPurchased,
  onAddWeeklyPO,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'laporan-harian' | 'po-mingguan' | 'progress-lapangan'>('laporan-harian');
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form Daily Report
  const [proyekId, setProyekId] = useState(projects[0]?.id || '');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [cuacaPagi, setCuacaPagi] = useState<'Cerah' | 'Hujan' | 'Mendung'>('Cerah');
  const [cuacaSiang, setCuacaSiang] = useState<'Cerah' | 'Hujan' | 'Mendung'>('Cerah');
  const [mandor, setMandor] = useState(1);
  const [tukang, setTukang] = useState(6);
  const [kenek, setKenek] = useState(8);
  const [pekerjaanList, setPekerjaanList] = useState<string[]>([
    'Pengecoran plat lantai 2 selesai 100%',
    'Pabrikasi pembesian kolom dan balok',
  ]);
  const [inputPekerjaan, setInputPekerjaan] = useState('');
  const [materialMasuk, setMaterialMasuk] = useState('Semen Gresik 40 sak, Besi D13 SNI 50 btg');
  const [kendala, setKendala] = useState('Nihil / Pekerjaan lancar sesuai instruksi.');
  const [progresKumulatif, setProgresKumulatif] = useState<number>(68.5);
  const [pengawas, setPengawas] = useState('Budi Santoso, S.T.');

  const handleAddPekerjaanRow = () => {
    if (!inputPekerjaan.trim()) return;
    setPekerjaanList([...pekerjaanList, inputPekerjaan.trim()]);
    setInputPekerjaan('');
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === proyekId) || projects[0];
    const newReport: DailyReport = {
      id: `dr-${Date.now()}`,
      tanggal,
      proyekId: proj?.id || 'proj-1',
      namaProyek: proj?.nama_proyek || 'Proyek Umum',
      cuacaPagi,
      cuacaSiang,
      tenagaKerja: { mandor, tukang, kenek },
      pekerjaanHariIni: pekerjaanList,
      kendala: kendala || 'Nihil',
      materialMasuk: materialMasuk || 'Tidak ada material masuk',
      progresKumulatif,
      pengawas,
    };
    onAddDailyReport(newReport);
    setShowAddModal(false);
    setNotification('Laporan Harian (Daily Report) berhasil disimpan!');
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-5">
      {/* Subtab Navigator */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('laporan-harian')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'laporan-harian' ? 'bg-[#1B2B4C] text-white shadow-2xs dark:bg-blue-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Laporan Harian ({dailyReports.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('po-mingguan')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'po-mingguan' ? 'bg-[#1B2B4C] text-white shadow-2xs dark:bg-blue-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
            <span>Daftar Pembelian Barang ({weeklyPOs.length})</span>
          </button>
        </div>
        {activeSubTab === 'laporan-harian' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-blue-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>+ Buat Laporan Harian</span>
          </button>
        )}
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. LAPORAN HARIAN */}
      {activeSubTab === 'laporan-harian' && (
        <div className="space-y-4">
          {dailyReports.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-10 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs">Belum ada Laporan Harian</h4>
              <p className="text-[11px] text-slate-400">Klik "+ Buat Laporan Harian" untuk menginput absensi pekerja &amp; progres lapangan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dailyReports.map((dr) => (
                <div
                  key={dr.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[11px] font-bold text-slate-400">{dr.tanggal}</span>
                      <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full font-mono">
                        Progress: {dr.progresKumulatif}%
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-[#1B2B4C] dark:text-white line-clamp-1">{dr.namaProyek}</h4>
                    <p className="text-xs text-slate-500">Pengawas: {dr.pengawas}</p>
                    <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
                      <p><strong>Cuaca:</strong> Pagi ({dr.cuacaPagi}), Siang ({dr.cuacaSiang})</p>
                      <p><strong>Pekerja:</strong> {dr.tenagaKerja.mandor} Mandor, {dr.tenagaKerja.tukang} Tukang, {dr.tenagaKerja.kenek} Kenek</p>
                      <p className="line-clamp-2"><strong>Item:</strong> {dr.pekerjaanHariIni.join(', ')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. PO MINGGUAN */}
      {activeSubTab === 'po-mingguan' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weeklyPOs.map((po) => (
              <div key={po.id} className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-2xs flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1B2B4C] dark:text-white">{po.nomorPO}</span>
                    <span className="text-[10px] bg-[#1B2B4C] text-[#D4AF37] px-2 py-0.5 rounded font-bold">
                      Minggu ke-{po.mingguKe}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-blue-700 dark:text-blue-400 mt-1">{po.namaProyek}</h4>
                  <p className="text-[11px] text-slate-500">Supplier: {po.supplier}</p>
                </div>
                <div className="text-right">
                  <strong className="text-xs font-mono font-bold text-[#1B2B4C] dark:text-white block">
                    {formatRupiahDisplay(po.totalBiaya)}
                  </strong>
                  <button
                    onClick={() => onMarkPOPurchased(po.id)}
                    className={`mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded ${
                      po.sudahTerbeli ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {po.sudahTerbeli ? 'Sudah Terbeli' : 'Tandai Selesai'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL BUAT LAPORAN HARIAN */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-[#1B2B4C] dark:text-white">Buat Laporan Harian (Daily Report)</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 text-lg cursor-pointer">
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveReport} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Proyek</label>
                  <select
                    value={proyekId}
                    onChange={(e) => setProyekId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.nama_proyek}</option>
                    ))}
                    {projects.length === 0 && <option value="">(Belum ada proyek)</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-800 dark:text-white text-[11px] block">Jumlah Tenaga Kerja Lapangan:</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500">Mandor</span>
                    <input
                      type="number"
                      min="0"
                      value={mandor}
                      onChange={(e) => setMandor(Number(e.target.value))}
                      className="w-full text-xs p-1.5 border border-slate-200 dark:border-slate-700 rounded font-mono bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Tukang</span>
                    <input
                      type="number"
                      min="0"
                      value={tukang}
                      onChange={(e) => setTukang(Number(e.target.value))}
                      className="w-full text-xs p-1.5 border border-slate-200 dark:border-slate-700 rounded font-mono bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Kenek</span>
                    <input
                      type="number"
                      min="0"
                      value={kenek}
                      onChange={(e) => setKenek(Number(e.target.value))}
                      className="w-full text-xs p-1.5 border border-slate-200 dark:border-slate-700 rounded font-mono bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Pekerjaan Hari Ini</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={inputPekerjaan}
                    onChange={(e) => setInputPekerjaan(e.target.value)}
                    placeholder="Ketik uraian pekerjaan..."
                    className="flex-1 text-xs px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddPekerjaanRow}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold"
                  >
                    + Tambah
                  </button>
                </div>
                <div className="space-y-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl max-h-24 overflow-y-auto">
                  {pekerjaanList.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px] bg-white dark:bg-slate-900 p-1 rounded border border-slate-100 dark:border-slate-800">
                      <span>{idx + 1}. {p}</span>
                      <button
                        type="button"
                        onClick={() => setPekerjaanList(pekerjaanList.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Progres Kumulatif (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={progresKumulatif}
                    onChange={(e) => setProgresKumulatif(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-emerald-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Pengawas Site</label>
                  <input
                    type="text"
                    value={pengawas}
                    onChange={(e) => setPengawas(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-blue-600 text-white rounded-xl font-semibold shadow-md"
                >
                  Simpan Laporan Harian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
