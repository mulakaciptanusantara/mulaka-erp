import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Send, 
  Download, 
  Trash2, 
  Building2, 
  Check, 
  ShoppingBag, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp,
  Phone,
  FileSpreadsheet,
  MessageCircle,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Project, SubDivisiPelaksana, WeeklyMaterialPO, WeeklyMaterialPOItem } from '../../types';
import { GoogleMapPicker } from '../common/GoogleMapPicker';
import { 
  formatRupiahDisplay, 
  formatRupiahInputValue, 
  parseRupiahInput, 
  formatIndonesianPhone, 
  cleanPhoneForWhatsApp,
  PROYEK_JENIS_PEKERJAAN_OPTIONS 
} from '../../utils/formatters';

interface ProyekManagementViewProps {
  projects: Project[];
  weeklyPOs: WeeklyMaterialPO[];
  onAddProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onUpdateProjectProgress: (id: string, progress: number) => void;
  onMarkPOPurchased: (poId: string) => void;
  onAddWeeklyPO: (po: WeeklyMaterialPO) => void;
}

export const ProyekManagementView: React.FC<ProyekManagementViewProps> = ({
  projects,
  weeklyPOs,
  onAddProject,
  onDeleteProject,
  onUpdateProjectProgress,
  onMarkPOPurchased,
  onAddWeeklyPO,
}) => {
  const [activeTab, setActiveTab] = useState<'input-baru' | 'daftar-carousel' | 'po-mingguan'>('input-baru');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Form Input Proyek Baru
  const [subDivisi, setSubDivisi] = useState<SubDivisiPelaksana>('General Contractor');
  const [statusProyek, setStatusProyek] = useState<'Aktif' | 'Selesai'>('Aktif');
  const [jenisPekerjaan, setJenisPekerjaan] = useState<string>(PROYEK_JENIS_PEKERJAAN_OPTIONS[0]);
  const [namaProyek, setNamaProyek] = useState('');
  const [namaKlien, setNamaKlien] = useState('');
  const [kontakWa, setKontakWa] = useState('');
  const [alamatProyek, setAlamatProyek] = useState('Jl. Gedebage Selatan No.70a, Bandung');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | undefined>({ lat: -6.9532, lng: 107.6912 });
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  // Financial Termin
  const [nilaiKontrak, setNilaiKontrak] = useState<number>(0);
  const [uangMukaDP, setUangMukaDP] = useState<number>(0);
  const [termin1, setTermin1] = useState<number>(0);
  const [termin2, setTermin2] = useState<number>(0);
  const [termin3, setTermin3] = useState<number>(0);
  const sisaPiutang = Math.max(0, nilaiKontrak - (uangMukaDP + termin1 + termin2 + termin3));

  // Modal PO Belanja Baru
  const [showAddPoModal, setShowAddPoModal] = useState(false);
  const [poProyekId, setPoProyekId] = useState(projects[0]?.id || '');
  const [poSupplier, setPoSupplier] = useState('TB. Makmur Sentosa');
  const [poMingguKe, setPoMingguKe] = useState(1);
  const [poTanggal, setPoTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [poItems, setPoItems] = useState<WeeklyMaterialPOItem[]>([
    { id: '1', namaMaterial: 'Semen Gresik 50kg', volume: 40, satuan: 'Sak', estimasiHarga: 64000, total: 2560000 },
  ]);
  const [newPoItemNama, setNewPoItemNama] = useState('');
  const [newPoItemVol, setNewPoItemVol] = useState(10);
  const [newPoItemSat, setNewPoItemSat] = useState('Sak');
  const [newPoItemHarga, setNewPoItemHarga] = useState(64000);

  const handleKontakChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatIndonesianPhone(e.target.value);
    setKontakWa(formatted);
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setThumbnailUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaProyek.trim() || !namaKlien.trim()) {
      alert('Nama Proyek dan Nama Klien wajib diisi!');
      return;
    }

    const cleanPhone = cleanPhoneForWhatsApp(kontakWa);
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      nama_proyek: namaProyek.trim(),
      nama_klien: namaKlien.trim(),
      kontak: cleanPhone,
      alamat: alamatProyek.trim() || 'Bandung, Jawa Barat',
      sub_divisi: subDivisi,
      jenis: jenisPekerjaan,
      status: statusProyek,
      thumbnail: thumbnailUrl || '/images/mulaka_residence.jpg',
      nilai: nilaiKontrak,
      dp: uangMukaDP,
      t1: termin1,
      t2: termin2,
      t3: termin3,
      sisa: sisaPiutang,
      tanggal_mulai: new Date().toISOString().split('T')[0],
      estimasi_selesai: '2027-03-31',
      progress: statusProyek === 'Selesai' ? 100 : 0,
      driveFolderId: `folder-${Date.now()}`,
    };

    onAddProject(newProj);
    
    let msg = `Proyek "${newProj.nama_proyek}" berhasil disimpan!`;
    if (uangMukaDP > 0) {
      msg += ` Uang Muka (DP) ${formatRupiahDisplay(uangMukaDP)} OTOMATIS dimasukkan ke Jurnal Cashflow & Kas Bank!`;
    }
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);

    // Reset Form
    setNamaProyek('');
    setNamaKlien('');
    setKontakWa('');
    setNilaiKontrak(0);
    setUangMukaDP(0);
    setTermin1(0);
    setTermin2(0);
    setTermin3(0);
    setThumbnailUrl('');
  };

  const handleAddPoItemRow = () => {
    if (!newPoItemNama.trim()) return;
    const itemTotal = Number(newPoItemVol) * Number(newPoItemHarga);
    const newItem: WeeklyMaterialPOItem = {
      id: `poi-${Date.now()}`,
      namaMaterial: newPoItemNama.trim(),
      volume: Number(newPoItemVol) || 1,
      satuan: newPoItemSat.trim() || 'Pcs',
      estimasiHarga: Number(newPoItemHarga) || 0,
      total: itemTotal,
    };
    setPoItems([...poItems, newItem]);
    setNewPoItemNama('');
  };

  const handleSaveWeeklyPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (poItems.length === 0) {
      alert('Tambahkan minimal 1 item material pada daftar PO!');
      return;
    }

    const proj = projects.find(p => p.id === poProyekId) || projects[0];
    const totalBiaya = poItems.reduce((acc, it) => acc + it.total, 0);
    const newPO: WeeklyMaterialPO = {
      id: `po-${Date.now()}`,
      nomorPO: `PO-MLK/${new Date().getFullYear()}/W${poMingguKe}-${Math.floor(Math.random() * 900 + 100)}`,
      proyekId: proj?.id || 'proj-1',
      namaProyek: proj?.nama_proyek || 'Proyek Umum',
      mingguKe: Number(poMingguKe) || 1,
      tanggalRencana: poTanggal,
      supplier: poSupplier.trim() || 'Supplier Rekanan',
      status: 'PO Terbit',
      items: poItems,
      totalBiaya,
      sudahTerbeli: false,
    };

    onAddWeeklyPO(newPO);
    setShowAddPoModal(false);
    setNotification(`PO Belanja ${newPO.nomorPO} (${formatRupiahDisplay(totalBiaya)}) berhasil diterbitkan!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleExportOnBoardingPDF = (proj: Project) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Kop Surat
    doc.setFillColor(27, 43, 76);
    doc.rect(0, 0, pageWidth, 26, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('PT. MULAKA CIPTA NUSANTARA', 14, 12);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(212, 175, 55);
    doc.text('LEMBAR DATA ON-BOARDING PROYEK & KLIEN RESMI', 14, 18);
    doc.setTextColor(230, 230, 230);
    doc.setFontSize(8);
    doc.text('Konstruksi &bull; Custom Furniture &bull; Arsitektur &bull; Properti', 14, 22);

    doc.setTextColor(27, 43, 76);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('FORMULIR PENDAFTARAN & KONTRAK KLIEN', 14, 38);
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.8);
    doc.line(14, 41, pageWidth - 14, 41);

    // Information Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 46, pageWidth - 28, 48, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 46, pageWidth - 28, 48, 2, 2, 'D');

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Nama Proyek', 18, 54);
    doc.text('Nama Klien / Pemilik', 18, 62);
    doc.text('Kontak WhatsApp', 18, 70);
    doc.text('Sub-Divisi Pelaksana', 18, 78);
    doc.text('Alamat Lokasi Proyek', 18, 86);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`: ${proj.nama_proyek}`, 60, 54);
    doc.text(`: ${proj.nama_klien}`, 60, 62);
    doc.text(`: +${proj.kontak}`, 60, 70);
    doc.text(`: ${proj.sub_divisi} (${proj.jenis})`, 60, 78);
    doc.text(`: ${proj.alamat}`, 60, 86);

    // Financial Breakdown
    doc.setFontSize(11);
    doc.setTextColor(27, 43, 76);
    doc.setFont('helvetica', 'bold');
    doc.text('SKEMA KEUANGAN KONTRAK & TERMIN PEMBAYARAN', 14, 104);

    doc.setFillColor(241, 245, 249);
    doc.rect(14, 108, pageWidth - 28, 8, 'F');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Uraian Pembayaran', 18, 113.5);
    doc.text('Nominal (Rp)', 155, 113.5);

    let y = 122;
    const lines = [
      { uraian: 'Nilai Total Kontrak', val: proj.nilai },
      { uraian: 'Uang Muka (DP)', val: proj.dp },
      { uraian: 'Termin 1 (Pekerjaan Awal / Struktur)', val: proj.t1 },
      { uraian: 'Termin 2 (Pekerjaan Lanjutan / Dinding & Atap)', val: proj.t2 },
      { uraian: 'Termin 3 (Finishing & Instalasi)', val: proj.t3 },
      { uraian: 'Sisa Piutang Kontrak', val: proj.sisa },
    ];

    lines.forEach((l) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(l.uraian, 18, y);
      doc.setFont('helvetica', 'bold');
      doc.text(formatRupiahDisplay(l.val), 155, y);
      doc.setDrawColor(241, 245, 249);
      doc.line(14, y + 2.5, pageWidth - 14, y + 2.5);
      y += 8;
    });

    const signY = 220;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('Disetujui oleh Klien,', 30, signY);
    doc.text('Diterima oleh Manajemen Mulaka,', pageWidth - 80, signY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`( ${proj.nama_klien} )`, 24, signY + 30);
    doc.text('( Rio Bertian, S.T. - Direksi )', pageWidth - 86, signY + 30);

    doc.save(`OnBoarding_Klien_${proj.nama_klien.replace(/\s+/g, '_')}.pdf`);
    setNotification(`PDF On-Boarding Klien ${proj.nama_klien} berhasil diunduh!`);
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredProjects = projects.filter(p => {
    const q = search.toLowerCase();
    return (
      p.nama_proyek.toLowerCase().includes(q) ||
      p.nama_klien.toLowerCase().includes(q) ||
      p.sub_divisi.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Subtab Selector */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('input-baru')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'input-baru'
                ? 'bg-[#1B2B4C] text-white shadow-2xs dark:bg-blue-600'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Form Input Data Proyek Baru</span>
          </button>
          <button
            onClick={() => setActiveTab('daftar-carousel')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'daftar-carousel'
                ? 'bg-[#1B2B4C] text-white shadow-2xs dark:bg-blue-600'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Daftar Proyek &amp; Detail ({projects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('po-mingguan')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'po-mingguan'
                ? 'bg-[#1B2B4C] text-white shadow-2xs dark:bg-blue-600'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
            <span>Pembelian Barang Minggu Ini ({weeklyPOs.filter(p => !p.sudahTerbeli).length})</span>
          </button>
        </div>
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold hidden md:inline">
          {projects.length} Proyek Terdaftar
        </span>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. FORM INPUT PROYEK BARU DENGAN DROPDOWN PERSIS SESUAI REQUEST */}
      {activeTab === 'input-baru' && (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-[#1B2B4C] dark:text-white">
                Form Input Data Proyek Baru
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pencatatan data proyek, kategori pekerjaan 9 pilihan resmi, peta alamat, serta DP &amp; termin pembayaran yang otomatis masuk ke jurnal cashflow.
              </p>
            </div>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full font-mono font-bold">
              ID: PROJ-{projects.length + 1}
            </span>
          </div>

          <form onSubmit={handleSubmitProject} className="space-y-5 text-xs">
            {/* Sub-Divisi Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                Sub-Divisi Pelaksana
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['General Contractor', 'Tempat Tinggal Studio', 'Mulaka Livin', 'Mulaka Property'] as SubDivisiPelaksana[]).map((div) => (
                  <button
                    key={div}
                    type="button"
                    onClick={() => setSubDivisi(div)}
                    className={`py-3 px-3 rounded-2xl font-bold text-xs transition cursor-pointer text-center ${
                      subDivisi === div
                        ? 'bg-[#1B2B4C] text-white dark:bg-blue-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {div}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Status Proyek</label>
                <select
                  value={statusProyek}
                  onChange={(e) => setStatusProyek(e.target.value as any)}
                  className="w-full text-xs px-3.5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                >
                  <option value="Aktif">Aktif (Sedang Berjalan)</option>
                  <option value="Selesai">Selesai (Serah Terima)</option>
                </select>
              </div>

              {/* DROPDOWN SESUAI PERMINTAAN USER PERSIS: */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Kategori Jenis Pekerjaan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={jenisPekerjaan}
                  onChange={(e) => setJenisPekerjaan(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none font-bold text-blue-700 dark:text-blue-400"
                >
                  <option>Jasa Desain Arsitektur</option>
                  <option>Jasa Desain Interior</option>
                  <option>Jasa Perhitungan RAB</option>
                  <option>Jasa Reovasi Kecil</option>
                  <option>Jasa Renovasi Besar</option>
                  <option>Jasa Pembangunan Rumah Sederhana</option>
                  <option>Jasa Pembangunan Rumah Mewah</option>
                  <option>Jasa Pembangunan Gedung & Kantor</option>
                  <option>Jasa Pembangunan Gudang & Pabrik</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nama Proyek</label>
                <input
                  type="text"
                  required
                  value={namaProyek}
                  onChange={(e) => setNamaProyek(e.target.value)}
                  placeholder="Contoh: Pembangunan Villa Modern Dago Resort"
                  className="w-full text-xs px-3.5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nama Klien / Pemilik</label>
                <input
                  type="text"
                  required
                  value={namaKlien}
                  onChange={(e) => setNamaKlien(e.target.value)}
                  placeholder="Nama Lengkap Klien / Pemilik"
                  className="w-full text-xs px-3.5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kontak WhatsApp Klien
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700 dark:text-emerald-400 font-bold font-mono text-xs flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" /> +62
                </span>
                <input
                  type="text"
                  required
                  value={kontakWa}
                  onChange={handleKontakChange}
                  placeholder="821 - 1801 - 005"
                  className="w-full text-xs pl-16 pr-3.5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                />
              </div>
            </div>

            <div>
              <GoogleMapPicker
                value={alamatProyek}
                onChange={(addr, c) => {
                  setAlamatProyek(addr);
                  if (c) setCoords(c);
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Foto / Thumbnail Proyek
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-[#1B2B4C] file:text-white cursor-pointer"
              />
            </div>

            {/* Skema Termin & Auto-Cashflow Integration Banner */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="font-bold text-xs md:text-sm text-[#1B2B4C] dark:text-white flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-[#D4AF37]" />
                  <span>Skema Pembayaran Kontrak &amp; Termin (Rp)</span>
                </h4>
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  DP / Termin Otomatis Masuk Jurnal Cashflow
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nilai Total Kontrak</label>
                  <input
                    type="text"
                    value={formatRupiahInputValue(nilaiKontrak)}
                    onChange={(e) => setNilaiKontrak(parseRupiahInput(e.target.value))}
                    placeholder="Rp 0"
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-800 dark:text-white font-bold bg-white dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                    Uang Muka (DP) - Auto-Masuk Kas
                  </label>
                  <input
                    type="text"
                    value={formatRupiahInputValue(uangMukaDP)}
                    onChange={(e) => setUangMukaDP(parseRupiahInput(e.target.value))}
                    placeholder="Rp 0"
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-white dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Termin 1</label>
                  <input
                    type="text"
                    value={formatRupiahInputValue(termin1)}
                    onChange={(e) => setTermin1(parseRupiahInput(e.target.value))}
                    placeholder="Rp 0"
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-800 dark:text-white font-bold bg-white dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Termin 2</label>
                  <input
                    type="text"
                    value={formatRupiahInputValue(termin2)}
                    onChange={(e) => setTermin2(parseRupiahInput(e.target.value))}
                    placeholder="Rp 0"
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-800 dark:text-white font-bold bg-white dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Termin 3</label>
                  <input
                    type="text"
                    value={formatRupiahInputValue(termin3)}
                    onChange={(e) => setTermin3(parseRupiahInput(e.target.value))}
                    placeholder="Rp 0"
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-800 dark:text-white font-bold bg-white dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-rose-600 dark:text-rose-400 mb-1">
                    Sisa Piutang Kontrak
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formatRupiahDisplay(sisaPiutang)}
                    className="w-full text-xs px-3 py-2.5 border border-rose-200 dark:border-rose-900 rounded-xl font-mono text-rose-700 dark:text-rose-400 font-extrabold bg-rose-50 dark:bg-rose-950/40"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-2xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <FolderKanban className="w-4 h-4 text-[#D4AF37]" />
                <span>Simpan Data Klien ke Database ERP</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. DAFTAR PROYEK */}
      {activeTab === 'daftar-carousel' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama proyek, klien, jenis pekerjaan..."
                className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-white"
              />
            </div>
            <span className="font-mono text-slate-500 dark:text-slate-400 font-semibold text-xs">{filteredProjects.length} Proyek Ditampilkan</span>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <FolderKanban className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Belum Ada Proyek Terdaftar</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Silakan input data proyek baru melalui formulir di atas untuk memulai.
              </p>
              <button
                onClick={() => setActiveTab('input-baru')}
                className="px-4 py-2 bg-[#1B2B4C] hover:bg-[#111C33] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                + Buka Form Input Proyek
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div>
                    <div className="h-44 bg-slate-100 dark:bg-slate-800 relative overflow-hidden group">
                      <img
                        src={p.thumbnail}
                        alt={p.nama_proyek}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-[#1B2B4C]/90 text-[#D4AF37] text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
                        {p.sub_divisi}
                      </span>
                      <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                        p.status === 'Aktif' ? 'bg-emerald-600' : 'bg-slate-700'
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-sm text-[#1B2B4C] dark:text-white line-clamp-1">{p.nama_proyek}</h4>
                      <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold">{p.jenis}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">Klien: <strong>{p.nama_klien}</strong></p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">📍 {p.alamat}</p>

                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          <span>Progress Lapangan</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-mono">{p.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100 dark:border-slate-800 mt-3">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Nilai Kontrak</span>
                          <strong className="text-xs font-mono text-slate-800 dark:text-slate-200">{formatRupiahDisplay(p.nilai)}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-rose-500 block font-semibold">Sisa Piutang</span>
                          <strong className="text-xs font-mono text-rose-600 dark:text-rose-400">{formatRupiahDisplay(p.sisa)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs mt-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${p.kontak}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg transition"
                        title="Kirim Pesan WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      </a>
                      <button
                        onClick={() => handleExportOnBoardingPDF(p)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                        title="Download Form On-Boarding Klien PDF"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>PDF Klien</span>
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus proyek "${p.nama_proyek}"?`)) {
                          onDeleteProject(p.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      title="Hapus Proyek"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. PO MINGGUAN */}
      {activeTab === 'po-mingguan' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <h3 className="font-bold text-sm md:text-base text-[#1B2B4C] dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                <span>Daftar Pembelian Barang Minggu Ini</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Rencana pengadaan material proyek &amp; PO mingguan.
              </p>
            </div>
            <button
              onClick={() => {
                if (projects.length > 0) setPoProyekId(projects[0].id);
                setShowAddPoModal(true);
              }}
              className="bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>+ Tambah PO Belanja</span>
            </button>
          </div>

          {weeklyPOs.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-850 p-10 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">Belum ada PO Belanja diterbitkan</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Klik "+ Tambah PO Belanja" untuk mencatat kebutuhan material lapangan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weeklyPOs.map((po) => (
                <div
                  key={po.id}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                    po.sudahTerbeli
                      ? 'bg-slate-50/70 dark:bg-slate-850/50 border-slate-200 dark:border-slate-800 opacity-70'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 shadow-2xs'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#1B2B4C] dark:text-white">{po.nomorPO}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        po.sudahTerbeli
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {po.sudahTerbeli ? 'Sudah Terbeli' : `Minggu ke-${po.mingguKe} (Aktif)`}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-blue-800 dark:text-blue-400">{po.namaProyek}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Supplier: {po.supplier} &bull; Tgl: {po.tanggalRencana}</p>

                    <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                      {po.items.map((it, idx) => (
                        <div key={it.id || idx} className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>{idx + 1}. {it.namaMaterial} ({it.volume} {it.satuan})</span>
                          <strong className="font-mono">{formatRupiahDisplay(it.total)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Total Estimasi</span>
                      <strong className="text-xs font-mono font-bold text-[#1B2B4C] dark:text-white">
                        {formatRupiahDisplay(po.totalBiaya)}
                      </strong>
                    </div>

                    {!po.sudahTerbeli ? (
                      <button
                        onClick={() => onMarkPOPurchased(po.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tandai Sudah Terbeli</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Terbeli
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: TAMBAH PO BELANJA */}
      {showAddPoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-[#1B2B4C] dark:text-white">
                  Penerbitan PO Belanja Material Baru
                </h3>
              </div>
              <button onClick={() => setShowAddPoModal(false)} className="text-slate-400 text-lg cursor-pointer">
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveWeeklyPO} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Proyek</label>
                  <select
                    value={poProyekId}
                    onChange={(e) => setPoProyekId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    {projects.length === 0 ? (
                      <option value="">(Belum ada proyek terdaftar)</option>
                    ) : (
                      projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.nama_proyek}</option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Minggu</label>
                  <select
                    value={poMingguKe}
                    onChange={(e) => setPoMingguKe(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(w => (
                      <option key={w} value={w}>Minggu ke-{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Supplier / Toko Rekanan</label>
                  <input
                    type="text"
                    required
                    value={poSupplier}
                    onChange={(e) => setPoSupplier(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Rencana Kirim</label>
                  <input
                    type="date"
                    required
                    value={poTanggal}
                    onChange={(e) => setPoTanggal(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-800 dark:text-white text-[11px] block">Tambah Item Material:</span>
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Nama Material (e.g. Hebel 10cm)"
                      value={newPoItemNama}
                      onChange={(e) => setNewPoItemNama(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Vol"
                      value={newPoItemVol}
                      onChange={(e) => setNewPoItemVol(Number(e.target.value))}
                      className="w-full p-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Satuan"
                      value={newPoItemSat}
                      onChange={(e) => setNewPoItemSat(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="col-span-3 flex gap-1">
                    <input
                      type="number"
                      placeholder="Harga"
                      value={newPoItemHarga}
                      onChange={(e) => setNewPoItemHarga(Number(e.target.value))}
                      className="w-full p-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddPoItemRow}
                      className="px-2 py-2 bg-emerald-600 text-white rounded-xl font-bold cursor-pointer shrink-0"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-32 overflow-y-auto pt-2">
                  {poItems.map((it, idx) => (
                    <div key={it.id || idx} className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px]">
                      <span>{idx + 1}. {it.namaMaterial} ({it.volume} {it.satuan})</span>
                      <div className="flex items-center gap-2">
                        <strong className="font-mono">{formatRupiahDisplay(it.total)}</strong>
                        <button
                          type="button"
                          onClick={() => setPoItems(poItems.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#1B2B4C] dark:bg-slate-950 text-white rounded-xl flex justify-between items-center text-xs">
                <span>Total Estimasi Biaya PO:</span>
                <strong className="font-mono text-sm text-[#D4AF37]">
                  {formatRupiahDisplay(poItems.reduce((acc, it) => acc + it.total, 0))}
                </strong>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPoModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-blue-600 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Terbitkan PO Belanja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
