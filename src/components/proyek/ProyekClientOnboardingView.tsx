import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Send, 
  Download, 
  CheckCircle2, 
  Building2, 
  User as UserIcon, 
  Camera, 
  Upload, 
  Phone, 
  MapPin, 
  Coins, 
  PenTool, 
  Check, 
  Trash2,
  FolderKanban,
  FileCheck2,
  Plus
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { 
  ClientOnboardingForm, 
  Project, 
  CompanyProfile, 
  KopSuratTemplate, 
  CoverSuratTemplate 
} from '../../types';
import { 
  formatRupiahDisplay, 
  formatRupiahInputValue, 
  parseRupiahInput, 
  formatIndonesianPhone,
  cleanPhoneForWhatsApp,
  PROYEK_JENIS_PEKERJAAN_OPTIONS 
} from '../../utils/formatters';
import { renderPDFKopSurat, renderPDFCover } from '../../utils/pdfHelpers';

interface ProyekClientOnboardingViewProps {
  onboardings: ClientOnboardingForm[];
  onSaveOnboarding: (item: ClientOnboardingForm) => void;
  onConvertToProject: (project: Project) => void;
  companyProfile: CompanyProfile;
  kopTemplates: KopSuratTemplate[];
  coverTemplate: CoverSuratTemplate;
}

export const ProyekClientOnboardingView: React.FC<ProyekClientOnboardingViewProps> = ({
  onboardings,
  onSaveOnboarding,
  onConvertToProject,
  companyProfile,
  kopTemplates,
  coverTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'form-baru' | 'riwayat'>('form-baru');
  const [notification, setNotification] = useState<string | null>(null);

  // A. Informasi Klien
  const [namaLengkap, setNamaLengkap] = useState('');
  const [noWhatsApp, setNoWhatsApp] = useState('');
  const [email, setEmail] = useState('');
  const [alamatDomisili, setAlamatDomisili] = useState('');
  const [pekerjaanInstansi, setPekerjaanInstansi] = useState('');

  // B. Informasi Proyek
  const [namaProyek, setNamaProyek] = useState('');
  const [alamatLokasiProyek, setAlamatLokasiProyek] = useState('');
  const [kotaProyek, setKotaProyek] = useState('Bandung');
  const [luasTanahM2, setLuasTanahM2] = useState<number>(120);
  const [luasBangunanM2, setLuasBangunanM2] = useState<number>(180);

  // C. Kebutuhan Renov/Bangun/Desain
  const [jenisPekerjaan, setJenisPekerjaan] = useState<string>(PROYEK_JENIS_PEKERJAAN_OPTIONS[0]);
  const [detailKebutuhanRuangan, setDetailKebutuhanRuangan] = useState('3 Kamar Tidur, 2 Kamar Mandi, Ruang Keluarga Terbuka, Kitchen Set & Dapur Bersih');
  const [gayaArsitekturFavorit, setGayaArsitekturFavorit] = useState('Modern Tropical Minimalist');

  // D. Referensi Foto
  const [fotoLamaUrl, setFotoLamaUrl] = useState<string>('');
  const [fotoReferensiUrl, setFotoReferensiUrl] = useState<string>('');

  // E. Pilihan Jasa
  const [pilihanJasa, setPilihanJasa] = useState<ClientOnboardingForm['pilihanJasa']>('Design & Build (All-In Terpadu)');

  // F. Budget
  const [kisaranBudget, setKisaranBudget] = useState('Rp 500 Juta - Rp 1 Miliar');
  const [nominalBudgetAngka, setNominalBudgetAngka] = useState<number>(750000000);

  // G. Informasi Tambahan
  const [targetMulai, setTargetMulai] = useState(new Date().toISOString().split('T')[0]);
  const [catatanKhusus, setCatatanKhusus] = useState('Mengutamakan pencahayaan alami dan sirkulasi udara silang yang sejuk.');

  // H. Tanda Tangan (Canvas)
  const clientCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isClientSigned, setIsClientSigned] = useState(false);

  const clearCanvas = () => {
    const canvas = clientCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsClientSigned(false);
      }
    }
  };

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = clientCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1B2B4C';

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);

    const handleDrawMove = (moveEv: MouseEvent | TouchEvent) => {
      const mx = 'touches' in moveEv ? moveEv.touches[0].clientX - rect.left : moveEv.clientX - rect.left;
      const my = 'touches' in moveEv ? moveEv.touches[0].clientY - rect.top : moveEv.clientY - rect.top;
      ctx.lineTo(mx, my);
      ctx.stroke();
      setIsClientSigned(true);
    };

    const handleDrawEnd = () => {
      window.removeEventListener('mousemove', handleDrawMove);
      window.removeEventListener('mouseup', handleDrawEnd);
      window.removeEventListener('touchmove', handleDrawMove);
      window.removeEventListener('touchend', handleDrawEnd);
    };

    window.addEventListener('mousemove', handleDrawMove);
    window.addEventListener('mouseup', handleDrawEnd);
    window.addEventListener('touchmove', handleDrawMove);
    window.addEventListener('touchend', handleDrawEnd);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'lama' | 'referensi') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'lama') setFotoLamaUrl(reader.result as string);
        else setFotoReferensiUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim() || !namaProyek.trim()) {
      alert('Nama Klien dan Nama Proyek wajib diisi!');
      return;
    }

    const canvas = clientCanvasRef.current;
    const signatureBase64 = canvas ? canvas.toDataURL('image/png') : undefined;

    const newOnboarding: ClientOnboardingForm = {
      id: `onb-${Date.now()}`,
      tanggal: new Date().toISOString().split('T')[0],
      namaLengkap: namaLengkap.trim(),
      noWhatsApp: cleanPhoneForWhatsApp(noWhatsApp),
      email: email.trim(),
      alamatDomisili: alamatDomisili.trim(),
      pekerjaanInstansi: pekerjaanInstansi.trim(),
      namaProyek: namaProyek.trim(),
      alamatLokasiProyek: alamatLokasiProyek.trim() || 'Bandung',
      kotaProyek: kotaProyek.trim() || 'Bandung',
      luasTanahM2: Number(luasTanahM2) || 0,
      luasBangunanM2: Number(luasBangunanM2) || 0,
      jenisPekerjaan,
      detailKebutuhanRuangan,
      gayaArsitekturFavorit,
      fotoLamaUrl,
      fotoReferensiUrl,
      pilihanJasa,
      kisaranBudget,
      nominalBudgetAngka: Number(nominalBudgetAngka) || 0,
      targetMulai,
      catatanKhusus,
      tandaTanganKlienBase64: signatureBase64,
      status: 'Diproses Menjadi Proyek',
    };

    onSaveOnboarding(newOnboarding);

    // Auto-create Project in Project Database
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      nama_proyek: newOnboarding.namaProyek,
      nama_klien: newOnboarding.namaLengkap,
      kontak: newOnboarding.noWhatsApp,
      alamat: newOnboarding.alamatLokasiProyek,
      kota: newOnboarding.kotaProyek,
      sub_divisi: newOnboarding.pilihanJasa.includes('Furniture') ? 'Mulaka Livin' : 'General Contractor',
      jenis: newOnboarding.jenisPekerjaan,
      status: 'Aktif',
      thumbnail: newOnboarding.fotoReferensiUrl || '/images/mulaka_residence.jpg',
      nilai: newOnboarding.nominalBudgetAngka,
      dp: Math.round(newOnboarding.nominalBudgetAngka * 0.2),
      t1: Math.round(newOnboarding.nominalBudgetAngka * 0.3),
      t2: Math.round(newOnboarding.nominalBudgetAngka * 0.3),
      t3: Math.round(newOnboarding.nominalBudgetAngka * 0.2),
      sisa: 0,
      tanggal_mulai: newOnboarding.targetMulai,
      estimasi_selesai: '2027-04-30',
      progress: 0,
      luasTanah: newOnboarding.luasTanahM2,
      luasBangunan: newOnboarding.luasBangunanM2,
      referensiFotoLama: newOnboarding.fotoLamaUrl,
      referensiFotoImpian: newOnboarding.fotoReferensiUrl,
      pilihanJasa: newOnboarding.pilihanJasa,
      tandaTanganKlien: signatureBase64,
    };

    onConvertToProject(newProject);

    setNotification(`Formulir Onboarding Klien berhasil disubmit dan OTOMATIS TERSIMPAN ke Database Proyek "${newProject.nama_proyek}"!`);
    setTimeout(() => setNotification(null), 5000);

    setActiveTab('riwayat');
  };

  const handleExportPDF = (item: ClientOnboardingForm) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    if (coverTemplate && coverTemplate.enableCover) {
      renderPDFCover(doc, coverTemplate, companyProfile, {
        judulDokumen: 'FORMULIR ONBOARDING KLIEN & KAJIAN KEBUTUHAN PROYEK',
        nomorDokumen: `ONB-MLK/${item.id.slice(-6).toUpperCase()}`,
        namaProyek: item.namaProyek,
        namaKlien: item.namaLengkap,
        tanggal: item.tanggal,
        disusunOleh: 'Divisi Arsitektur & Perencanaan PT. Mulaka Cipta Nusantara',
      });
    }

    const kop = kopTemplates.find(k => k.jenisDokumen === 'PKS' || k.jenisDokumen === 'BoQ') || kopTemplates[0];
    let y = renderPDFKopSurat(doc, kop, companyProfile);

    doc.setTextColor(27, 43, 76);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('FORMULIR ONBOARDING & KEBUTUHAN PROYEK KLIEN', pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`ID Berkas: ${item.id}  |  Tanggal Terbit: ${item.tanggal}  |  Status: Terdaftar di Database`, pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.6);
    doc.line(14, y, pageWidth - 14, y);
    y += 7;

    const sections = [
      { title: 'A. INFORMASI KLIEN', fields: [
        ['Nama Lengkap', item.namaLengkap],
        ['No. WhatsApp', `+${item.noWhatsApp}`],
        ['Email', item.email || '-'],
        ['Alamat Domisili', item.alamatDomisili || '-'],
        ['Pekerjaan / Instansi', item.pekerjaanInstansi || '-'],
      ]},
      { title: 'B. INFORMASI PROYEK', fields: [
        ['Nama Proyek', item.namaProyek],
        ['Lokasi / Alamat', item.alamatLokasiProyek],
        ['Kota', item.kotaProyek],
        ['Luas Tanah / Bangunan', `${item.luasTanahM2} m2 / ${item.luasBangunanM2} m2`],
      ]},
      { title: 'C. KEBUTUHAN RENOVASI / BANGUN / DESAIN', fields: [
        ['Jenis Pekerjaan', item.jenisPekerjaan],
        ['Gaya Arsitektur', item.gayaArsitekturFavorit],
        ['Detail Ruangan', item.detailKebutuhanRuangan],
      ]},
      { title: 'E. PILIHAN JASA & F. BUDGET ANGGARAN', fields: [
        ['Paket Jasa', item.pilihanJasa],
        ['Alokasi Anggaran', `${formatRupiahDisplay(item.nominalBudgetAngka)} (${item.kisaranBudget})`],
        ['Target Mulai', item.targetMulai],
        ['Catatan Khusus', item.catatanKhusus || '-'],
      ]},
    ];

    sections.forEach(sec => {
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, pageWidth - 28, 6, 'F');
      doc.setTextColor(27, 43, 76);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(sec.title, 17, y + 4.2);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      sec.fields.forEach(([k, v]) => {
        doc.text(k, 18, y);
        doc.text(`: ${v}`, 65, y);
        y += 5;
      });
      y += 2;
    });

    // Signature Area
    const signY = 225;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Klien / Pemilik Proyek,', 25, signY);
    doc.text('Konsultan Arsitektur Mulaka,', pageWidth - 80, signY);

    if (item.tandaTanganKlienBase64) {
      try {
        doc.addImage(item.tandaTanganKlienBase64, 'PNG', 20, signY + 3, 35, 18);
      } catch (err) {
        // fallback
      }
    }

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`( ${item.namaLengkap} )`, 20, signY + 28);
    doc.text('( Rio Bertian, S.T. )', pageWidth - 84, signY + 28);

    doc.save(`Onboarding_Klien_${item.namaLengkap.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-base md:text-lg font-bold text-[#1B2B4C] dark:text-white">
              Form Onboarding Klien Terpadu (A s/d H)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Templat formulir pendaftaran klien lengkap dengan tanda tangan digital, terintegrasi langsung ke database proyek dan cashflow Mulaka.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('form-baru')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'form-baru' ? 'bg-[#1B2B4C] text-white dark:bg-blue-600 shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Isi Form Baru</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('riwayat')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'riwayat' ? 'bg-[#1B2B4C] text-white dark:bg-blue-600 shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <FolderKanban className="w-4 h-4 text-emerald-500" />
            <span>Riwayat Onboarding ({onboardings.length})</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. FORM ONBOARDING KLIEN LENGKAP A S/D H */}
      {activeTab === 'form-baru' && (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-4xl mx-auto space-y-6">
          <form onSubmit={handleSubmitOnboarding} className="space-y-6 text-xs">
            
            {/* A> INFORMASI KLIEN */}
            <div className="p-5 bg-slate-50/70 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5">
              <h3 className="font-extrabold text-sm text-[#1B2B4C] dark:text-[#D4AF37] flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#1B2B4C] text-[#D4AF37] flex items-center justify-center text-xs">A</span>
                <span>Informasi Klien</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap Klien <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Bpk. Ir. Hendrawan Wicaksono"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="821 - 1801 - 005"
                    value={noWhatsApp}
                    onChange={(e) => setNoWhatsApp(formatIndonesianPhone(e.target.value))}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alamat Email (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="hendrawan@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Pekerjaan / Instansi
                  </label>
                  <input
                    type="text"
                    placeholder="Wiraswasta / PT..."
                    value={pekerjaanInstansi}
                    onChange={(e) => setPekerjaanInstansi(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alamat Domisili Klien Saat Ini
                  </label>
                  <input
                    type="text"
                    placeholder="Jl. Buahbatu Regency No. 18, Bandung"
                    value={alamatDomisili}
                    onChange={(e) => setAlamatDomisili(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* B> INFORMASI PROYEK */}
            <div className="p-5 bg-slate-50/70 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5">
              <h3 className="font-extrabold text-sm text-[#1B2B4C] dark:text-[#D4AF37] flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#1B2B4C] text-[#D4AF37] flex items-center justify-center text-xs">B</span>
                <span>Informasi Proyek</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Rencana Proyek <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pembangunan Villa Modern Dago Resort"
                    value={namaProyek}
                    onChange={(e) => setNamaProyek(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alamat Lokasi Proyek
                  </label>
                  <input
                    type="text"
                    placeholder="Komplek Resor Dago Pakar Kav. 18"
                    value={alamatLokasiProyek}
                    onChange={(e) => setAlamatLokasiProyek(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kota / Wilayah
                  </label>
                  <input
                    type="text"
                    value={kotaProyek}
                    onChange={(e) => setKotaProyek(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Luas Tanah (m2)
                  </label>
                  <input
                    type="number"
                    value={luasTanahM2}
                    onChange={(e) => setLuasTanahM2(Number(e.target.value))}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rencana Luas Bangunan (m2)
                  </label>
                  <input
                    type="number"
                    value={luasBangunanM2}
                    onChange={(e) => setLuasBangunanM2(Number(e.target.value))}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* C> KEBUTUHAN RENOV/BANGUN/DESAIN */}
            <div className="p-5 bg-slate-50/70 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5">
              <h3 className="font-extrabold text-sm text-[#1B2B4C] dark:text-[#D4AF37] flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#1B2B4C] text-[#D4AF37] flex items-center justify-center text-xs">C</span>
                <span>Kebutuhan Renov / Bangun / Desain</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Jenis Pekerjaan (Dropdown Standar Mulaka)
                  </label>
                  <select
                    value={jenisPekerjaan}
                    onChange={(e) => setJenisPekerjaan(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                  >
                    {PROYEK_JENIS_PEKERJAAN_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Gaya Arsitektur yang Diinginkan
                  </label>
                  <input
                    type="text"
                    value={gayaArsitekturFavorit}
                    onChange={(e) => setGayaArsitekturFavorit(e.target.value)}
                    placeholder="Modern Tropical, Japandi, Industrial, Classic Luxury"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Detail Kebutuhan Ruangan &amp; Fungsi Khusus
                  </label>
                  <textarea
                    rows={2}
                    value={detailKebutuhanRuangan}
                    onChange={(e) => setDetailKebutuhanRuangan(e.target.value)}
                    placeholder="Jumlah kamar, void, ruang kerja, kolam renang, rooftop, mushola..."
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* D> REFERENSI : FOTO LAMA - FOTO REFERENSI YANG DIINGINKAN */}
            <div className="p-5 bg-slate-50/70 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5">
              <h3 className="font-extrabold text-sm text-[#1B2B4C] dark:text-[#D4AF37] flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#1B2B4C] text-[#D4AF37] flex items-center justify-center text-xs">D</span>
                <span>Referensi : Foto Lama &amp; Foto Referensi Impian</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Foto Lama */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2">
                  <span className="font-bold text-xs text-slate-700 dark:text-slate-300 block">
                    1. Foto Kondisi Lama / Lahan Saat Ini
                  </span>
                  <label className="w-full py-3 bg-slate-50 dark:bg-slate-700/60 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition">
                    <Camera className="w-4 h-4 text-slate-500" />
                    <span>Upload Foto Eksisting</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'lama')} className="hidden" />
                  </label>
                  {fotoLamaUrl && (
                    <img src={fotoLamaUrl} alt="Eksisting" className="w-full h-32 object-cover rounded-xl border border-slate-200" />
                  )}
                </div>

                {/* Foto Referensi Impian */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2">
                  <span className="font-bold text-xs text-slate-700 dark:text-slate-300 block">
                    2. Foto Referensi yang Diinginkan
                  </span>
                  <label className="w-full py-3 bg-slate-50 dark:bg-slate-700/60 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition">
                    <Upload className="w-4 h-4 text-[#D4AF37]" />
                    <span>Upload Foto Referensi Impian</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'referensi')} className="hidden" />
                  </label>
                  {fotoReferensiUrl && (
                    <img src={fotoReferensiUrl} alt="Referensi" className="w-full h-32 object-cover rounded-xl border border-slate-200" />
                  )}
                </div>
              </div>
            </div>

            {/* E> PILIHAN JASA */}
            <div className="p-5 bg-slate-50/70 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5">
              <h3 className="font-extrabold text-sm text-[#1B2B4C] dark:text-[#D4AF37] flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#1B2B4C] text-[#D4AF37] flex items-center justify-center text-xs">E</span>
                <span>Pilihan Jasa Pelaksanaan Mulaka</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  'Desain Arsitektur / Interior Saja',
                  'Konstruksi / Pembangunan Saja',
                  'Design & Build (All-In Terpadu)',
                  'Custom Furniture Mulaka Livin',
                ].map((jasa) => (
                  <button
                    key={jasa}
                    type="button"
                    onClick={() => setPilihanJasa(jasa as any)}
                    className={`p-3 rounded-2xl text-xs font-bold transition text-left cursor-pointer border ${
                      pilihanJasa === jasa
                        ? 'bg-[#1B2B4C] text-white border-[#D4AF37] shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block">{jasa}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* F> BUDGET DESAIN / RENOV / PEMBANGUNAN */}
            <div className="p-5 bg-slate-50/70 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5">
              <h3 className="font-extrabold text-sm text-[#1B2B4C] dark:text-[#D4AF37] flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#1B2B4C] text-[#D4AF37] flex items-center justify-center text-xs">F</span>
                <span>Budget Desain / Renovasi / Pembangunan</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kisaran Anggaran Klien
                  </label>
                  <select
                    value={kisaranBudget}
                    onChange={(e) => {
                      const val = e.target.value;
                      setKisaranBudget(val);
                      if (val.includes('< 100')) setNominalBudgetAngka(75000000);
                      else if (val.includes('100 - 300')) setNominalBudgetAngka(250000000);
                      else if (val.includes('300 - 750')) setNominalBudgetAngka(550000000);
                      else if (val.includes('750 - 1.5')) setNominalBudgetAngka(950000000);
                      else setNominalBudgetAngka(1850000000);
                    }}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                  >
                    <option value="Di Bawah Rp 100 Juta">&lt; Rp 100 Juta (Renovasi Kecil / Interior)</option>
                    <option value="Rp 100 - 300 Juta">Rp 100 - 300 Juta</option>
                    <option value="Rp 300 - 750 Juta">Rp 300 - 750 Juta</option>
                    <option value="Rp 750 Juta - Rp 1.5 Miliar">Rp 750 Juta - Rp 1.5 Miliar</option>
                    <option value="Di Atas Rp 1.5 Miliar">&gt; Rp 1.5 Miliar (Rumah Mewah / Komersial)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nominal Anggaran Target (Rp)
                  </label>
                  <input
                    type="text"
                    value={formatRupiahInputValue(nominalBudgetAngka)}
                    onChange={(e) => setNominalBudgetAngka(parseRupiahInput(e.target.value))}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-emerald-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* G> INFORMASI TAMBAHAN */}
            <div className="p-5 bg-slate-50/70 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5">
              <h3 className="font-extrabold text-sm text-[#1B2B4C] dark:text-[#D4AF37] flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#1B2B4C] text-[#D4AF37] flex items-center justify-center text-xs">G</span>
                <span>Informasi Tambahan</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rencana Target Waktu Mulai
                  </label>
                  <input
                    type="date"
                    value={targetMulai}
                    onChange={(e) => setTargetMulai(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Catatan Khusus / Permintaan Spesifik
                  </label>
                  <textarea
                    rows={2}
                    value={catatanKhusus}
                    onChange={(e) => setCatatanKhusus(e.target.value)}
                    placeholder="Kendala akses jalan, jadwal kerja, material khusus..."
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* H> TANDA TANGAN DIGITAL */}
            <div className="p-5 bg-slate-50/70 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                <h3 className="font-extrabold text-sm text-[#1B2B4C] dark:text-[#D4AF37] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1B2B4C] text-[#D4AF37] flex items-center justify-center text-xs">H</span>
                  <span>Tanda Tangan Digital Klien</span>
                </h3>
                {isClientSigned && (
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-xs text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Tanda Tangan</span>
                  </button>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500">
                  Goreskan tanda tangan Anda pada bidang kanvas di bawah ini menggunakan mouse atau layar sentuh.
                </p>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden bg-white max-w-md mx-auto shadow-inner touch-none">
                  <canvas
                    ref={clientCanvasRef}
                    width={400}
                    height={140}
                    onMouseDown={handleStartDraw}
                    onTouchStart={handleStartDraw}
                    className="w-full h-32 cursor-crosshair block"
                  />
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400">
                    {isClientSigned ? '✓ Tanda tangan tersimpan' : 'Bidang tanda tangan interaktif'}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-blue-600 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg transition"
              >
                <Send className="w-4 h-4 text-[#D4AF37]" />
                <span>Simpan Formulir &amp; Sinkronkan ke Database Proyek</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. RIWAYAT ONBOARDING KLIEN */}
      {activeTab === 'riwayat' && (
        <div className="space-y-4">
          {onboardings.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <FileCheck2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Belum Ada Formulir Onboarding</h3>
              <p className="text-xs text-slate-500">Silakan isi formulir di tab "Isi Form Baru" untuk mendaftarkan klien.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {onboardings.map((onb) => (
                <div
                  key={onb.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {onb.id}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{onb.tanggal}</span>
                    </div>

                    <h4 className="font-bold text-sm text-[#1B2B4C] dark:text-white line-clamp-1">{onb.namaProyek}</h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300">Klien: <strong>{onb.namaLengkap}</strong> (+{onb.noWhatsApp})</p>
                    <p className="text-[11px] text-slate-500">Paket: {onb.pilihanJasa} &bull; {onb.jenisPekerjaan}</p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold font-mono">
                      Anggaran: {formatRupiahDisplay(onb.nominalBudgetAngka)}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {onb.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleExportPDF(onb)}
                      className="px-3 py-1.5 bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                    >
                      <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
