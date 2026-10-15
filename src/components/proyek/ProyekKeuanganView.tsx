import React, { useState } from 'react';
import { 
  Receipt, 
  Wallet, 
  CreditCard, 
  Scale, 
  Layers, 
  CheckCircle2, 
  Plus, 
  Trash2 
} from 'lucide-react';
import { CashflowItem, Project, KasBankItem, HutangPiutangRecord } from '../../types';
import { 
  formatRupiahDisplay, 
  formatRupiahInputValue, 
  parseRupiahInput, 
  TRANSACTION_CATEGORIES 
} from '../../utils/formatters';

interface ProyekKeuanganViewProps {
  cashflow: CashflowItem[];
  projects: Project[];
  kasBankList: KasBankItem[];
  hutangPiutang: HutangPiutangRecord[];
  onAddCashflow: (item: CashflowItem) => void;
  onAddKasAccount?: (account: KasBankItem) => void;
  onDeleteKasAccount?: (id: string) => void;
}

export const ProyekKeuanganView: React.FC<ProyekKeuanganViewProps> = ({
  cashflow,
  projects,
  kasBankList,
  hutangPiutang,
  onAddCashflow,
  onAddKasAccount,
  onDeleteKasAccount,
}) => {
  const [subTab, setSubTab] = useState<'input-cashflow' | 'rekap-kategori' | 'saldo-kas' | 'hutang-piutang'>('input-cashflow');
  const [selectedProyekFilter, setSelectedProyekFilter] = useState('Semua');
  const [notification, setNotification] = useState<string | null>(null);

  // Form Input Jurnal Cashflow
  const [hari, setHari] = useState('Senin');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [proyek, setProyek] = useState('Non-Proyek / Operasional Umum');
  const [kategori, setKategori] = useState('Bahan Material Konstruksi');
  const [toko, setToko] = useState('');
  const [qty, setQty] = useState<number>(1);
  const [satuan, setSatuan] = useState('');
  const [pemasukan, setPemasukan] = useState<number>(0);
  const [pengeluaran, setPengeluaran] = useState<number>(0);
  const [keterangan, setKeterangan] = useState('');
  const [selectedKasAkun, setSelectedKasAkun] = useState(kasBankList[0]?.nama || 'Kas Besar');

  // Modal Tambah Rekening
  const [showAddRekeningModal, setShowAddRekeningModal] = useState(false);
  const [rekNama, setRekNama] = useState('');
  const [rekTipe, setRekTipe] = useState<KasBankItem['tipe']>('Bank BCA');
  const [rekNomor, setRekNomor] = useState('');
  const [rekAtasNama, setRekAtasNama] = useState('PT Mulaka Cipta Nusantara');
  const [rekSaldoAwal, setRekSaldoAwal] = useState<number>(0);
  const [rekCatatan, setRekCatatan] = useState('');

  const saldoBerjalanSekarang = cashflow.length > 0 ? cashflow[0].saldo : 0;
  const estimasiSaldoBaru = saldoBerjalanSekarang + (pemasukan || 0) - (pengeluaran || 0);

  const handleSubmitCashflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (pemasukan === 0 && pengeluaran === 0) {
      alert('Masukkan nominal pemasukan atau pengeluaran!');
      return;
    }

    const newItem: CashflowItem = {
      id: `cf-${Date.now()}`,
      hari,
      tanggal,
      proyek,
      kategori,
      toko: toko.trim() || 'Internal Mulaka',
      qty: Number(qty) || 1,
      satuan: satuan.trim() || 'Unit',
      pemasukan: Number(pemasukan) || 0,
      pengeluaran: Number(pengeluaran) || 0,
      saldo: estimasiSaldoBaru,
      keterangan: keterangan.trim() || `${kategori} (${toko || proyek})`,
      akunKasBank: selectedKasAkun,
      syncToAccounting: true,
    };

    onAddCashflow(newItem);
    setNotification('Data transaksi cashflow berhasil dicatat dan OTOMATIS TERSINKRONISASI ke Portal Akuntansi!');
    setTimeout(() => setNotification(null), 4000);

    setToko('');
    setQty(1);
    setSatuan('');
    setPemasukan(0);
    setPengeluaran(0);
    setKeterangan('');
  };

  const handleSaveRekening = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rekNama.trim() || !rekNomor.trim()) {
      alert('Nama akun dan nomor rekening wajib diisi!');
      return;
    }

    const newAccount: KasBankItem = {
      id: `kb-${Date.now()}`,
      nama: rekNama.trim(),
      tipe: rekTipe,
      nomorRekening: rekNomor.trim(),
      atasNama: rekAtasNama.trim(),
      saldo: Number(rekSaldoAwal) || 0,
      catatan: rekCatatan.trim(),
    };

    if (onAddKasAccount) {
      onAddKasAccount(newAccount);
    }
    setShowAddRekeningModal(false);
    setRekNama('');
    setRekNomor('');
    setRekSaldoAwal(0);
    setNotification(`Rekening kas/bank "${newAccount.nama}" berhasil ditambahkan!`);
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredCashflow = cashflow.filter(c => {
    return selectedProyekFilter === 'Semua' ? true : c.proyek === selectedProyekFilter;
  });

  return (
    <div className="space-y-5">
      {/* Subtab Navigator */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setSubTab('input-cashflow')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              subTab === 'input-cashflow' ? 'bg-[#1B2B4C] text-white shadow-2xs dark:bg-blue-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Form Input Cashflow</span>
          </button>
          <button
            onClick={() => setSubTab('rekap-kategori')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              subTab === 'rekap-kategori' ? 'bg-[#1B2B4C] text-white shadow-2xs dark:bg-blue-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>Rekapitulasi Kategori</span>
          </button>
          <button
            onClick={() => setSubTab('saldo-kas')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              subTab === 'saldo-kas' ? 'bg-[#1B2B4C] text-white shadow-2xs dark:bg-blue-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Saldo Kas &amp; Bank ({kasBankList.length})</span>
          </button>
          <button
            onClick={() => setSubTab('hutang-piutang')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              subTab === 'hutang-piutang' ? 'bg-[#1B2B4C] text-white shadow-2xs dark:bg-blue-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-500" />
            <span>Hutang &amp; Piutang Proyek</span>
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sync Otomatis ke Akuntansi</span>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. FORM INPUT CASHFLOW */}
      {subTab === 'input-cashflow' && (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-[#1B2B4C] dark:text-white">
                Form Input Jurnal Cashflow
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pencatatan mutasi kas masuk, biaya bahan material, upah tukang, &amp; beban operasional.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-medium">Saldo Kas Berjalan</span>
              <strong className="text-sm md:text-base text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                {formatRupiahDisplay(saldoBerjalanSekarang)}
              </strong>
            </div>
          </div>

          <form onSubmit={handleSubmitCashflow} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Hari</label>
                <select
                  value={hari}
                  onChange={(e) => setHari(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                >
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tanggal Transaksi</label>
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Alokasi Proyek Terkait</label>
              <select
                value={proyek}
                onChange={(e) => setProyek(e.target.value)}
                className="w-full text-xs px-3.5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
              >
                <option value="Non-Proyek / Operasional Umum">Non-Proyek / Operasional Umum</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.nama_proyek}>{p.nama_proyek}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Kategori Transaksi</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                >
                  {TRANSACTION_CATEGORIES.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Toko / Vendor / Penerima</label>
                <input
                  type="text"
                  value={toko}
                  onChange={(e) => setToko(e.target.value)}
                  placeholder="Nama Toko atau Penerima"
                  className="w-full text-xs px-3.5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Volume (Qty)</label>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Satuan</label>
                <input
                  type="text"
                  value={satuan}
                  onChange={(e) => setSatuan(e.target.value)}
                  placeholder="Sak, m3, btg, lembar, unit, orang/hari"
                  className="w-full text-xs px-3.5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                  Pemasukan / Kas Masuk (Rp)
                </label>
                <input
                  type="text"
                  value={formatRupiahInputValue(pemasukan)}
                  onChange={(e) => setPemasukan(parseRupiahInput(e.target.value))}
                  placeholder="Rp 0"
                  className="w-full text-xs px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-white dark:bg-slate-800 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-rose-700 dark:text-rose-400 mb-1">
                  Pengeluaran / Biaya (Rp)
                </label>
                <input
                  type="text"
                  value={formatRupiahInputValue(pengeluaran)}
                  onChange={(e) => setPengeluaran(parseRupiahInput(e.target.value))}
                  placeholder="Rp 0"
                  className="w-full text-xs px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-rose-700 dark:text-rose-400 font-bold bg-white dark:bg-slate-800 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimasi Saldo Baru
                </label>
                <input
                  type="text"
                  readOnly
                  value={formatRupiahDisplay(estimasiSaldoBaru)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold bg-slate-50 dark:bg-slate-800 text-[#1B2B4C] dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Buku Kas / Rekening Terkait (Otomatis Masuk ke Akuntansi)
              </label>
              <select
                value={selectedKasAkun}
                onChange={(e) => setSelectedKasAkun(e.target.value)}
                className="w-full text-xs px-3.5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
              >
                {kasBankList.map(kb => (
                  <option key={kb.id} value={kb.nama}>{kb.nama} ({formatRupiahDisplay(kb.saldo)})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Keterangan Tambahan</label>
              <textarea
                rows={2}
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Catatan detail mengenai item transaksi atau nomor nota/kwitansi..."
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-[#059669] hover:bg-[#047857] text-white rounded-2xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-white" />
                <span>Simpan ke Jurnal Keuangan</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. REKAPITULASI KATEGORI */}
      {subTab === 'rekap-kategori' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <h3 className="font-bold text-sm md:text-base text-[#1B2B4C] dark:text-white">
                Rekapitulasi Berdasarkan Kategori Transaksi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daftar mutasi pengeluaran dan pemasukan per kategori proyek secara rinci.
              </p>
            </div>
            <select
              value={selectedProyekFilter}
              onChange={(e) => setSelectedProyekFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-[#1B2B4C] dark:text-white cursor-pointer"
            >
              <option value="Semua">Semua Proyek &amp; Operasional</option>
              {projects.map((p) => (
                <option key={p.id} value={p.nama_proyek}>{p.nama_proyek}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#1B2B4C] dark:bg-slate-950 text-white text-[10px] uppercase font-bold">
                  <th className="py-2.5 px-3">Tanggal / Hari</th>
                  <th className="py-2.5 px-3">Alokasi Proyek</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Toko / Penerima</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Pemasukan</th>
                  <th className="py-2.5 px-3 text-right">Pengeluaran</th>
                  <th className="py-2.5 px-3 text-right">Saldo Kas</th>
                  <th className="py-2.5 px-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCashflow.map((cf) => (
                  <tr key={cf.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition">
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-[#1B2B4C] dark:text-white block">{cf.tanggal}</span>
                      <span className="text-[10px] text-slate-400">{cf.hari}</span>
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200 max-w-[160px] truncate" title={cf.proyek}>
                      {cf.proyek}
                    </td>
                    <td className="py-2 px-3">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {cf.kategori}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{cf.toko}</td>
                    <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-500">
                      {cf.qty} {cf.satuan}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {cf.pemasukan > 0 ? formatRupiahDisplay(cf.pemasukan) : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-rose-700 dark:text-rose-400">
                      {cf.pengeluaran > 0 ? formatRupiahDisplay(cf.pengeluaran) : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                      {formatRupiahDisplay(cf.saldo)}
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400 max-w-[200px] truncate" title={cf.keterangan}>
                      {cf.keterangan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SALDO KAS & TAMBAH / HAPUS REKENING */}
      {subTab === 'saldo-kas' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <h3 className="font-bold text-sm md:text-base text-[#1B2B4C] dark:text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <span>Buku Kas &amp; Rekening Bank (Bisa Tambah / Hapus Rekening)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kelola brankas kas kecil, kas besar proyek, serta rekening BCA, Mandiri, BRI, dll.
              </p>
            </div>
            <button
              onClick={() => setShowAddRekeningModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Akun Rekening Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kasBankList.map((kb) => (
              <div key={kb.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-2xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                      {kb.tipe}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[#1B2B4C] dark:text-white mt-2">{kb.nama}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{kb.nomorRekening}</p>
                  <p className="text-[10px] text-slate-400">A.n {kb.atasNama}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Saldo</span>
                    <strong className="text-sm font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {formatRupiahDisplay(kb.saldo)}
                    </strong>
                  </div>
                  {onDeleteKasAccount && kasBankList.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Hapus akun kas/bank "${kb.nama}"?`)) {
                          onDeleteKasAccount(kb.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      title="Hapus Rekening Ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. HUTANG PIUTANG */}
      {subTab === 'hutang-piutang' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm md:text-base text-[#1B2B4C] dark:text-white">
              Monitoring Hutang &amp; Piutang Proyek (AP &amp; AR)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pemantauan sisa termin pembayaran klien dan tagihan supplier jatuh tempo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hutangPiutang.map((hp) => (
              <div key={hp.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      hp.tipe === 'Piutang Klien' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {hp.tipe}
                    </span>
                    <h4 className="font-bold text-sm text-[#1B2B4C] dark:text-white mt-1">{hp.entitasNama}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{hp.proyekNama}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    {hp.status}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Jatuh Tempo:</span>
                    <strong className="font-mono text-slate-700 dark:text-slate-300">{hp.jatuhTempo}</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-700">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Sisa Nominal:</span>
                    <strong className={`font-mono text-sm ${hp.tipe === 'Piutang Klien' ? 'text-amber-700 dark:text-amber-400' : 'text-rose-700 dark:text-rose-400'}`}>
                      {formatRupiahDisplay(hp.sisa)}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL TAMBAH REKENING */}
      {showAddRekeningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-[#1B2B4C] dark:text-white">Tambah Rekening / Akun Kas Baru</h3>
              <button onClick={() => setShowAddRekeningModal(false)} className="text-slate-400 text-lg cursor-pointer">
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveRekening} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Akun Kas / Bank
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bank BCA Giro Proyek / Kas Workshop"
                  value={rekNama}
                  onChange={(e) => setRekNama(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipe Akun</label>
                  <select
                    value={rekTipe}
                    onChange={(e) => setRekTipe(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    <option value="Bank BCA">Bank BCA</option>
                    <option value="Bank Mandiri">Bank Mandiri</option>
                    <option value="Bank BRI">Bank BRI</option>
                    <option value="Kas Kecil">Kas Kecil (Petty Cash)</option>
                    <option value="Kas Besar">Kas Besar Proyek</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 8105-001-22"
                    value={rekNomor}
                    onChange={(e) => setRekNomor(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddRekeningModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Simpan Rekening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
