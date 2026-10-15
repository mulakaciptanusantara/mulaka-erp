import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Phone, 
  Send, 
  Receipt, 
  Download, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  DollarSign, 
  ExternalLink,
  MessageCircle,
  FileCheck2,
  HardHat,
  X
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { 
  TukangMulakaItem, 
  InvoiceGajiTukang, 
  SpesialisasiTukang, 
  TipeUpahTukang, 
  Project, 
  CompanyProfile, 
  KopSuratTemplate,
  CoverSuratTemplate,
  CashflowItem
} from '../../types';
import { 
  formatRupiahDisplay, 
  formatRupiahInputValue, 
  parseRupiahInput, 
  formatIndonesianPhone,
  cleanPhoneForWhatsApp 
} from '../../utils/formatters';
import { renderPDFKopSurat, renderPDFCover } from '../../utils/pdfHelpers';
import { generateWhatsAppSalaryNotification } from '../../services/databaseService';

interface ProyekDaftarTukangViewProps {
  daftarTukang: TukangMulakaItem[];
  onSaveDaftarTukang: (list: TukangMulakaItem[]) => void;
  invoicesTukang: InvoiceGajiTukang[];
  onSaveInvoicesTukang: (invoices: InvoiceGajiTukang[]) => void;
  projects: Project[];
  companyProfile: CompanyProfile;
  kopTemplates: KopSuratTemplate[];
  coverTemplate: CoverSuratTemplate;
  onPostSalaryCashflow: (cf: CashflowItem) => void;
}

const SPESIALISASI_OPTIONS: SpesialisasiTukang[] = [
  'Tukang Batu / Sipil',
  'Tukang Besi & Pembesian',
  'Tukang Kayu / Mebel Furniture',
  'Tukang Cat & Finishing',
  'Tukang Plafon & Partisi Gypsum',
  'Tukang Listrik & Plumbing',
  'Mandor Proyek',
  'Kenek / Pembantu Tukang',
];

export const ProyekDaftarTukangView: React.FC<ProyekDaftarTukangViewProps> = ({
  daftarTukang,
  onSaveDaftarTukang,
  invoicesTukang,
  onSaveInvoicesTukang,
  projects,
  companyProfile,
  kopTemplates,
  coverTemplate,
  onPostSalaryCashflow,
}) => {
  const [activeTab, setActiveTab] = useState<'daftar-tukang' | 'tabel-gaji' | 'invoices'>('daftar-tukang');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Tukang Modal Add / Edit
  const [showTukangModal, setShowTukangModal] = useState(false);
  const [editingTukang, setEditingTukang] = useState<TukangMulakaItem | null>(null);
  const [formNama, setFormNama] = useState('');
  const [formNik, setFormNik] = useState('');
  const [formNoHp, setFormNoHp] = useState('');
  const [formAlamat, setFormAlamat] = useState('');
  const [formSpesialisasi, setFormSpesialisasi] = useState<SpesialisasiTukang>('Tukang Batu / Sipil');
  const [formTipeUpah, setFormTipeUpah] = useState<TipeUpahTukang>('Harian');
  const [formTarifHarian, setFormTarifHarian] = useState<number>(165000);
  const [formBank, setFormBank] = useState('Bank BCA');
  const [formRekening, setFormRekening] = useState('');
  const [formAtasNama, setFormAtasNama] = useState('');
  const [formProyekAktif, setFormProyekAktif] = useState('');
  const [formCatatan, setFormCatatan] = useState('');

  // Invoice / Gaji Modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invTukang, setInvTukang] = useState<TukangMulakaItem | null>(null);
  const [invNomor, setInvNomor] = useState('');
  const [invTanggal, setInvTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [invProyek, setInvProyek] = useState(projects[0]?.nama_proyek || 'Pembangunan Villa Modern Dago Resort');
  const [invTipeUpah, setInvTipeUpah] = useState<TipeUpahTukang>('Harian');
  
  // Harian states
  const [invHariKerja, setInvHariKerja] = useState<number>(6);
  const [invTarifHarian, setInvTarifHarian] = useState<number>(165000);
  const [invJamLembur, setInvJamLembur] = useState<number>(0);
  const [invTarifLembur, setInvTarifLembur] = useState<number>(30000);

  // Borongan states
  const [invTahapBorongan, setInvTahapBorongan] = useState<'DP (Uang Muka)' | 'Termin 1 (Progress 50%)' | 'Termin 2' | 'Pelunasan (100% Selesai)'>('DP (Uang Muka)');
  const [invUraianBorongan, setInvUraianBorongan] = useState('Pekerjaan Borongan Struktur / Finishing');
  const [invNominalBoronganTotal, setInvNominalBoronganTotal] = useState<number>(10000000);
  const [invPersenTermin, setInvPersenTermin] = useState<number>(30);

  // Deductions & Bonus
  const [invPotonganKasbon, setInvPotonganKasbon] = useState<number>(0);
  const [invBonusKerapian, setInvBonusKerapian] = useState<number>(0);
  const [invMetodeBayar, setInvMetodeBayar] = useState<'Transfer Bank BCA' | 'Transfer Bank Mandiri' | 'Kas Tunai Lapangan'>('Transfer Bank BCA');
  const [invCatatan, setInvCatatan] = useState('');

  // WhatsApp Notification Modal / Quick Action
  const [whatsAppModalData, setWhatsAppModalData] = useState<{
    link: string;
    namaTukang: string;
    noHp: string;
    nominal: number;
    nomorInv: string;
  } | null>(null);

  const triggerNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenAddTukang = () => {
    setEditingTukang(null);
    setFormNama('');
    setFormNik('');
    setFormNoHp('');
    setFormAlamat('');
    setFormSpesialisasi('Tukang Batu / Sipil');
    setFormTipeUpah('Harian');
    setFormTarifHarian(165000);
    setFormBank('Bank BCA');
    setFormRekening('');
    setFormAtasNama('');
    setFormProyekAktif(projects[0]?.nama_proyek || '');
    setFormCatatan('');
    setShowTukangModal(true);
  };

  const handleEditTukang = (t: TukangMulakaItem) => {
    setEditingTukang(t);
    setFormNama(t.nama);
    setFormNik(t.nikKtp);
    setFormNoHp(formatIndonesianPhone(t.noHp));
    setFormAlamat(t.alamatAsal);
    setFormSpesialisasi(t.spesialisasi);
    setFormTipeUpah(t.tipeUpah);
    setFormTarifHarian(t.tarifHarianStandar);
    setFormBank(t.namaBank);
    setFormRekening(t.nomorRekening);
    setFormAtasNama(t.atasNamaRekening);
    setFormProyekAktif(t.proyekAktifNama || '');
    setFormCatatan(t.catatanKeahlian || '');
    setShowTukangModal(true);
  };

  const handleDeleteTukang = (id: string) => {
    if (confirm('Hapus data tukang ini dari database Mulaka?')) {
      const updated = daftarTukang.filter(t => t.id !== id);
      onSaveDaftarTukang(updated);
      triggerNotify('Data tukang berhasil dihapus.');
    }
  };

  const handleSaveTukang = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) {
      alert('Nama Tukang wajib diisi!');
      return;
    }

    const cleanNumber = cleanPhoneForWhatsApp(formNoHp);
    if (editingTukang) {
      const updated = daftarTukang.map(t => {
        if (t.id === editingTukang.id) {
          return {
            ...t,
            nama: formNama.trim(),
            nikKtp: formNik.trim(),
            noHp: cleanNumber,
            alamatAsal: formAlamat.trim(),
            spesialisasi: formSpesialisasi,
            tipeUpah: formTipeUpah,
            tarifHarianStandar: formTarifHarian,
            namaBank: formBank,
            nomorRekening: formRekening.trim(),
            atasNamaRekening: formAtasNama.trim() || formNama.trim(),
            proyekAktifNama: formProyekAktif,
            catatanKeahlian: formCatatan.trim(),
          };
        }
        return t;
      });
      onSaveDaftarTukang(updated);
      triggerNotify(`Data tukang "${formNama}" berhasil diperbarui!`);
    } else {
      const newT: TukangMulakaItem = {
        id: `tk-${Date.now()}`,
        nama: formNama.trim(),
        nikKtp: formNik.trim() || '3200000000000000',
        noHp: cleanNumber,
        alamatAsal: formAlamat.trim() || 'Bandung Raya',
        spesialisasi: formSpesialisasi,
        tipeUpah: formTipeUpah,
        tarifHarianStandar: formTarifHarian,
        namaBank: formBank,
        nomorRekening: formRekening.trim() || 'KAS TUNAI',
        atasNamaRekening: formAtasNama.trim() || formNama.trim(),
        status: 'Aktif Bekerja',
        proyekAktifNama: formProyekAktif,
        catatanKeahlian: formCatatan.trim(),
      };
      onSaveDaftarTukang([newT, ...daftarTukang]);
      triggerNotify(`Tukang baru "${newT.nama}" berhasil didaftarkan ke sistem Mulaka!`);
    }

    setShowTukangModal(false);
  };

  // Open Invoice Generation for a Tukang
  const handleOpenInvoiceModal = (tukang: TukangMulakaItem) => {
    setInvTukang(tukang);
    const no = `INV-TK/${new Date().getFullYear()}/${new Date().getMonth() + 1}-${Math.floor(100 + Math.random() * 900)}`;
    setInvNomor(no);
    setInvTanggal(new Date().toISOString().split('T')[0]);
    setInvProyek(tukang.proyekAktifNama || projects[0]?.nama_proyek || 'Proyek Lapangan Mulaka');
    setInvTipeUpah(tukang.tipeUpah);
    setInvTarifHarian(tukang.tarifHarianStandar || 165000);
    setInvHariKerja(6);
    setInvJamLembur(0);
    setInvTarifLembur(30000);
    setInvTahapBorongan('DP (Uang Muka)');
    setInvPersenTermin(30);
    setInvNominalBoronganTotal(10000000);
    setInvUraianBorongan(`Pekerjaan ${tukang.spesialisasi}`);
    setInvPotonganKasbon(0);
    setInvBonusKerapian(0);
    setInvMetodeBayar(tukang.namaBank.includes('Mandiri') ? 'Transfer Bank Mandiri' : 'Transfer Bank BCA');
    setInvCatatan(`Penggajian ${tukang.tipeUpah} atas nama ${tukang.nama}`);
    setShowInvoiceModal(true);
  };

  const calculateInvoiceSubtotal = (): number => {
    if (invTipeUpah === 'Harian') {
      return (invHariKerja * invTarifHarian) + (invJamLembur * invTarifLembur);
    } else {
      return (invNominalBoronganTotal * invPersenTermin) / 100;
    }
  };

  const handleSaveInvoiceAndDisburse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invTukang) return;

    const subtotal = calculateInvoiceSubtotal();
    const totalGajiBersih = Math.max(0, subtotal - invPotonganKasbon + invBonusKerapian);

    const newInvoice: InvoiceGajiTukang = {
      id: `inv-tk-${Date.now()}`,
      nomorInvoice: invNomor,
      tanggal: invTanggal,
      tukangId: invTukang.id,
      namaTukang: invTukang.nama,
      noHp: invTukang.noHp,
      spesialisasi: invTukang.spesialisasi,
      proyekNama: invProyek,
      tipeUpah: invTipeUpah,
      hariKerja: invTipeUpah === 'Harian' ? invHariKerja : undefined,
      tarifHarian: invTipeUpah === 'Harian' ? invTarifHarian : undefined,
      jamLembur: invTipeUpah === 'Harian' ? invJamLembur : undefined,
      tarifLembur: invTipeUpah === 'Harian' ? invTarifLembur : undefined,
      tahapPembayaran: invTipeUpah === 'Borongan' ? invTahapBorongan : undefined,
      uraianPekerjaanBorongan: invTipeUpah === 'Borongan' ? invUraianBorongan : undefined,
      nominalBoronganTotal: invTipeUpah === 'Borongan' ? invNominalBoronganTotal : undefined,
      persentaseTermin: invTipeUpah === 'Borongan' ? invPersenTermin : undefined,
      subtotal,
      potonganKasbon: invPotonganKasbon,
      bonusKerapian: invBonusKerapian,
      totalGajiBersih,
      metodePembayaran: invMetodeBayar,
      status: 'Lunas Ditransfer',
      catatan: invCatatan,
      whatsappTerkirim: true,
    };

    onSaveInvoicesTukang([newInvoice, ...invoicesTukang]);

    // Automatically post to Cashflow & Journal as Upah Tukang
    const salaryCashflow: CashflowItem = {
      id: `cf-tk-${Date.now()}`,
      hari: new Date(invTanggal).toLocaleDateString('id-ID', { weekday: 'long' }),
      tanggal: invTanggal,
      proyek: invProyek,
      kategori: invTukang.spesialisasi.includes('Furniture') || invTukang.spesialisasi.includes('Kayu') ? 'Upah Pekerja - Furniture' : 'Upah Pekerja - Konstruksi',
      toko: invTukang.nama,
      qty: invTipeUpah === 'Harian' ? invHariKerja : 1,
      satuan: invTipeUpah === 'Harian' ? 'Hari Kerja' : invTahapBorongan,
      pemasukan: 0,
      pengeluaran: totalGajiBersih,
      saldo: 0,
      keterangan: `Pembayaran ${invTipeUpah} Tukang: ${invTukang.nama} (${invTukang.spesialisasi}) - Proyek ${invProyek} [${invNomor}]`,
      akunKasBank: invMetodeBayar.includes('BCA') ? 'Bank Central Asia (BCA)' : invMetodeBayar.includes('Mandiri') ? 'Bank Mandiri (Giro)' : 'Kas Besar Operasional Proyek',
      syncToAccounting: true,
    };
    onPostSalaryCashflow(salaryCashflow);

    // Prepare WhatsApp Notification Link
    const waLink = generateWhatsAppSalaryNotification({
      noHp: invTukang.noHp,
      namaPenerima: invTukang.nama,
      namaProyek: invProyek,
      nominalGaji: totalGajiBersih,
      tipeUpah: invTipeUpah,
      periodeAtauTermin: invTipeUpah === 'Harian' ? `${invHariKerja} Hari Kerja` : invTahapBorongan,
      nomorBukti: invNomor,
      namaPerusahaan: companyProfile.nama,
    });

    setShowInvoiceModal(false);

    // Pop up WhatsApp confirmation modal
    setWhatsAppModalData({
      link: waLink,
      namaTukang: invTukang.nama,
      noHp: invTukang.noHp,
      nominal: totalGajiBersih,
      nomorInv: invNomor,
    });

    triggerNotify(`Invoice ${invNomor} berhasil dibuat & otomatis tercatat di Cashflow Keuangan!`);
  };

  // Export PDF Invoice / Kwitansi Gaji Tukang
  const handleExportInvoicePDF = (inv: InvoiceGajiTukang) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Cover
    if (coverTemplate && coverTemplate.enableCover) {
      renderPDFCover(doc, coverTemplate, companyProfile, {
        judulDokumen: `BUKTI PEMBAYARAN UPAH TUKANG (${inv.tipeUpah.toUpperCase()})`,
        nomorDokumen: inv.nomorInvoice,
        namaProyek: inv.proyekNama,
        namaKlien: `${inv.namaTukang} (${inv.spesialisasi})`,
        tanggal: inv.tanggal,
        disusunOleh: 'Manajemen Proyek & Logistik PT. Mulaka Cipta Nusantara',
      });
    }

    // 2. Kop Surat
    const kop = kopTemplates.find(k => k.jenisDokumen === 'Slip Gaji' || k.jenisDokumen === 'Invoice') || kopTemplates[0];
    let y = renderPDFKopSurat(doc, kop, companyProfile);

    doc.setTextColor(27, 43, 76);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`INVOICE & KWITANSI PEMBAYARAN UPAH TUKANG`, pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Sistem: Upah ${inv.tipeUpah}  |  Nomor: ${inv.nomorInvoice}  |  Tanggal: ${inv.tanggal}`, pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.6);
    doc.line(14, y, pageWidth - 14, y);
    y += 7;

    // Box Biodata Tukang
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, pageWidth - 28, 32, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, pageWidth - 28, 32, 2, 2, 'D');

    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Nama Tukang / Penerima', 18, y + 7);
    doc.text('Keahlian / Spesialisasi', 18, y + 14);
    doc.text('Alokasi Proyek', 18, y + 21);
    doc.text('Metode Pembayaran', 18, y + 28);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`: ${inv.namaTukang}`, 65, y + 7);
    doc.text(`: ${inv.spesialisasi}`, 65, y + 14);
    doc.text(`: ${inv.proyekNama}`, 65, y + 21);
    doc.text(`: ${inv.metodePembayaran}`, 65, y + 28);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('No. WhatsApp / HP', 125, y + 7);
    doc.text('Status Pembayaran', 125, y + 14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`: +${inv.noHp}`, 162, y + 7);
    doc.setTextColor(16, 185, 129);
    doc.text(`: ${inv.status}`, 162, y + 14);

    y += 40;

    // Table Header
    doc.setFillColor(27, 43, 76);
    doc.rect(14, y, pageWidth - 28, 7.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('NO', 18, y + 5);
    doc.text('RINCIAN PEKERJAAN & PERHITUNGAN', 32, y + 5);
    doc.text('JUMLAH (RP)', 160, y + 5, { align: 'right' });
    y += 11;

    // Items
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    
    if (inv.tipeUpah === 'Harian') {
      doc.text('1.', 18, y);
      doc.text(`Upah Pokok Harian: ${inv.hariKerja} Hari Kerja @ Rp ${inv.tarifHarian?.toLocaleString('id-ID')}`, 32, y);
      doc.setFont('helvetica', 'bold');
      doc.text(formatRupiahDisplay((inv.hariKerja || 0) * (inv.tarifHarian || 0)), 160, y, { align: 'right' });
      y += 7;

      if ((inv.jamLembur || 0) > 0) {
        doc.setFont('helvetica', 'normal');
        doc.text('2.', 18, y);
        doc.text(`Upah Lembur: ${inv.jamLembur} Jam @ Rp ${inv.tarifLembur?.toLocaleString('id-ID')}`, 32, y);
        doc.setFont('helvetica', 'bold');
        doc.text(formatRupiahDisplay((inv.jamLembur || 0) * (inv.tarifLembur || 0)), 160, y, { align: 'right' });
        y += 7;
      }
    } else {
      doc.text('1.', 18, y);
      doc.text(`Pekerjaan Borongan: ${inv.uraianPekerjaanBorongan || 'Borongan'}`, 32, y);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: ${formatRupiahDisplay(inv.nominalBoronganTotal || 0)}`, 160, y, { align: 'right' });
      y += 7;

      doc.setFont('helvetica', 'normal');
      doc.text('2.', 18, y);
      doc.text(`Tahapan Pencairan: ${inv.tahapPembayaran} (${inv.persentaseTermin}%)`, 32, y);
      doc.setFont('helvetica', 'bold');
      doc.text(formatRupiahDisplay(inv.subtotal), 160, y, { align: 'right' });
      y += 7;
    }

    if (inv.bonusKerapian > 0) {
      doc.setFont('helvetica', 'normal');
      doc.text('3.', 18, y);
      doc.text('Bonus Prestasi & Kerapian Pekerjaan', 32, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text(`+${formatRupiahDisplay(inv.bonusKerapian)}`, 160, y, { align: 'right' });
      y += 7;
    }

    if (inv.potonganKasbon > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(225, 29, 72);
      doc.text('4.', 18, y);
      doc.text('Potongan Kasbon / Pinjaman Harian', 32, y);
      doc.setFont('helvetica', 'bold');
      doc.text(`-${formatRupiahDisplay(inv.potonganKasbon)}`, 160, y, { align: 'right' });
      y += 7;
    }

    y += 5;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    // Total Grand
    doc.setFillColor(27, 43, 76);
    doc.roundedRect(pageWidth - 95, y, 81, 14, 2, 2, 'F');
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(8.5);
    doc.text('TOTAL BERSIH DITERIMA:', pageWidth - 91, y + 9);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(formatRupiahDisplay(inv.totalGajiBersih), pageWidth - 18, y + 9.5, { align: 'right' });

    // Signatures
    const signY = 220;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Tukang / Penerima Pembayaran,', 25, signY);
    doc.text('Mandor / Pengawas Lapangan Mulaka,', pageWidth - 85, signY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`( ${inv.namaTukang} )`, 20, signY + 28);
    doc.text('( Rio Bertian, S.T. / Pengawas PM )', pageWidth - 88, signY + 28);

    doc.save(`Invoice_Tukang_${inv.nomorInvoice.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    triggerNotify(`Invoice / Kwitansi tukang ${inv.nomorInvoice} berhasil diekspor ke PDF!`);
  };

  const filteredTukang = daftarTukang.filter(t => {
    const q = searchTerm.toLowerCase();
    return (
      t.nama.toLowerCase().includes(q) ||
      t.spesialisasi.toLowerCase().includes(q) ||
      t.alamatAsal.toLowerCase().includes(q) ||
      t.tipeUpah.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HardHat className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-base md:text-lg font-bold text-[#1B2B4C] dark:text-white">
              Tabel Daftar Tukang Mulaka &amp; Penggajian (Harian / Borongan)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola data tukang, upah mingguan harian, SPK borongan (DP, Termin 1, Pelunasan), pembuatan invoice, dan notifikasi WhatsApp otomatis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddTukang}
            className="px-4 py-2.5 bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>+ Tambah Tukang Baru</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('daftar-tukang')}
            className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'daftar-tukang'
                ? 'bg-[#1B2B4C] text-white dark:bg-blue-600 shadow-2xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Daftar Tukang Milik Mulaka ({daftarTukang.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'invoices'
                ? 'bg-[#1B2B4C] text-white dark:bg-blue-600 shadow-2xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-500" />
            <span>Invoice &amp; Bukti Pembayaran ({invoicesTukang.length})</span>
          </button>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari tukang, spesialisasi..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* 1. TABEL DAFTAR TUKANG MILIK MULAKA */}
      {activeTab === 'daftar-tukang' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#1B2B4C] dark:bg-slate-950 text-white text-[10px] uppercase font-bold">
                  <th className="py-3 px-3.5">Nama Tukang</th>
                  <th className="py-3 px-3">Keahlian &amp; Spesialisasi</th>
                  <th className="py-3 px-3">Sistem Upah</th>
                  <th className="py-3 px-3 text-right">Tarif Dasar / OH</th>
                  <th className="py-3 px-3">Rekening Pembayaran</th>
                  <th className="py-3 px-3">WhatsApp</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Buat Invoice / Upah</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredTukang.map((t) => {
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition">
                      <td className="py-3 px-3.5">
                        <div>
                          <strong className="text-slate-800 dark:text-white font-bold block">{t.nama}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">NIK: {t.nikKtp}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700 dark:text-slate-200 block">{t.spesialisasi}</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[160px] block" title={t.catatanKeahlian}>
                          {t.catatanKeahlian || t.alamatAsal}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.tipeUpah === 'Harian' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        }`}>
                          {t.tipeUpah}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formatRupiahDisplay(t.tarifHarianStandar)} / OH
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 block">{t.nomorRekening}</span>
                        <span className="text-[10px] text-slate-400">{t.namaBank} ({t.atasNamaRekening})</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <a
                          href={`https://wa.me/${t.noHp}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold hover:bg-emerald-100 transition"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>+{t.noHp}</span>
                        </a>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.status === 'Aktif Bekerja' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenInvoiceModal(t)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer mx-auto"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Buat Invoice Upah</span>
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditTukang(t)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg cursor-pointer"
                            title="Edit Data Tukang"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTukang(t.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                            title="Hapus Tukang"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. TABEL DAFTAR INVOICE & BUKTI BAYAR TUKANG */}
      {activeTab === 'invoices' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-0">
          <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800 dark:text-white">
              Riwayat Pembayaran &amp; Invoice Upah Tukang ({invoicesTukang.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Setiap pencairan otomatis memotong kas dan mencatat beban upah proyek
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#1B2B4C] dark:bg-slate-950 text-white text-[10px] uppercase font-bold">
                  <th className="py-3 px-3.5">No. Invoice &amp; Tgl</th>
                  <th className="py-3 px-3">Tukang / Penerima</th>
                  <th className="py-3 px-3">Alokasi Proyek</th>
                  <th className="py-3 px-3">Sistem / Tahap</th>
                  <th className="py-3 px-3 text-right">Subtotal</th>
                  <th className="py-3 px-3 text-right text-rose-300">Pot. Kasbon</th>
                  <th className="py-3 px-3.5 text-right font-bold text-[#D4AF37]">Total Bersih</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Cetak PDF</th>
                  <th className="py-3 px-3 text-center">Kirim WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-mono">
                {invoicesTukang.map((inv) => {
                  const waLink = generateWhatsAppSalaryNotification({
                    noHp: inv.noHp,
                    namaPenerima: inv.namaTukang,
                    namaProyek: inv.proyekNama,
                    nominalGaji: inv.totalGajiBersih,
                    tipeUpah: inv.tipeUpah,
                    periodeAtauTermin: inv.tipeUpah === 'Harian' ? `${inv.hariKerja} Hari` : (inv.tahapPembayaran || 'Termin'),
                    nomorBukti: inv.nomorInvoice,
                    namaPerusahaan: companyProfile.nama,
                  });

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition">
                      <td className="py-3 px-3.5 font-sans">
                        <strong className="text-blue-700 dark:text-blue-400 block font-mono text-xs">{inv.nomorInvoice}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{inv.tanggal}</span>
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <strong className="text-slate-800 dark:text-white block">{inv.namaTukang}</strong>
                        <span className="text-[10px] text-slate-400">{inv.spesialisasi}</span>
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-700 dark:text-slate-300">
                        {inv.proyekNama}
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 block">
                          {inv.tipeUpah}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {inv.tipeUpah === 'Harian' ? `${inv.hariKerja} Hari (${inv.jamLembur || 0} Jam Lembur)` : inv.tahapPembayaran}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-700 dark:text-slate-300">
                        {formatRupiahDisplay(inv.subtotal)}
                      </td>
                      <td className="py-3 px-3 text-right text-rose-600 font-semibold">
                        {inv.potonganKasbon > 0 ? `-${formatRupiahDisplay(inv.potonganKasbon)}` : '-'}
                      </td>
                      <td className="py-3 px-3.5 text-right font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                        {formatRupiahDisplay(inv.totalGajiBersih)}
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleExportInvoicePDF(inv)}
                          className="p-2 bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-slate-800 text-white rounded-xl text-xs transition cursor-pointer"
                          title="Download Bukti Pembayaran / Invoice PDF"
                        >
                          <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition shadow-xs"
                          title="Kirim Notifikasi Slip ke WhatsApp Tukang"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Kirim WA</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: TAMBAH / EDIT TUKANG MULAKA */}
      {showTukangModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <HardHat className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-base text-[#1B2B4C] dark:text-white">
                  {editingTukang ? 'Edit Data Tukang Mulaka' : 'Tambah Tukang Baru Mulaka'}
                </h3>
              </div>
              <button onClick={() => setShowTukangModal(false)} className="text-slate-400 text-lg cursor-pointer">
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveTukang} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap Tukang <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pak Supardi"
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor Induk KTP (NIK)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="3200..."
                    value={formNik}
                    onChange={(e) => setFormNik(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Keahlian / Spesialisasi
                  </label>
                  <select
                    value={formSpesialisasi}
                    onChange={(e) => setFormSpesialisasi(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                  >
                    {SPESIALISASI_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sistem Upah
                  </label>
                  <select
                    value={formTipeUpah}
                    onChange={(e) => setFormTipeUpah(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                  >
                    <option value="Harian">Harian (Hitungan Hari &amp; Lembur)</option>
                    <option value="Borongan">Borongan (Per Tahap DP &amp; Termin)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tarif Harian Standar (Rp / OH)
                  </label>
                  <input
                    type="text"
                    value={formatRupiahInputValue(formTarifHarian)}
                    onChange={(e) => setFormTarifHarian(parseRupiahInput(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-emerald-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor WhatsApp Tukang <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="821 - 9999 - 9999"
                    value={formNoHp}
                    onChange={(e) => setFormNoHp(formatIndonesianPhone(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Bank / Wallet</label>
                  <input
                    type="text"
                    placeholder="BCA / BRI / DANA"
                    value={formBank}
                    onChange={(e) => setFormBank(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    placeholder="No. Rek / No. HP"
                    value={formRekening}
                    onChange={(e) => setFormRekening(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Atas Nama</label>
                  <input
                    type="text"
                    placeholder="Nama Pemilik Rek"
                    value={formAtasNama}
                    onChange={(e) => setFormAtasNama(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alokasi Proyek Aktif
                </label>
                <select
                  value={formProyekAktif}
                  onChange={(e) => setFormProyekAktif(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  <option value="">(Belum ditugaskan / Standby)</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.nama_proyek}>{p.nama_proyek}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Asal / Catatan Keahlian
                </label>
                <textarea
                  rows={2}
                  placeholder="Keahlian spesifik, riwayat kerja, atau domisili asal..."
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTukangModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-blue-600 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Simpan Data Tukang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FORM PEMBUATAN INVOICE / BUKTI BAYAR UPAH TUKANG */}
      {showInvoiceModal && invTukang && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-base text-[#1B2B4C] dark:text-white">
                    Buat Invoice &amp; Kwitansi Upah Tukang
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Penerima: <strong>{invTukang.nama}</strong> ({invTukang.spesialisasi})
                  </p>
                </div>
              </div>
              <button onClick={() => setShowInvoiceModal(false)} className="text-slate-400 text-lg cursor-pointer">
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveInvoiceAndDisburse} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">No. Invoice</label>
                  <input
                    type="text"
                    required
                    value={invNomor}
                    onChange={(e) => setInvNomor(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={invTanggal}
                    onChange={(e) => setInvTanggal(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Alokasi Proyek</label>
                <select
                  value={invProyek}
                  onChange={(e) => setInvProyek(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.nama_proyek}>{p.nama_proyek}</option>
                  ))}
                  {projects.length === 0 && (
                    <option value="Proyek Konstruksi Lapangan">Proyek Konstruksi Lapangan</option>
                  )}
                </select>
              </div>

              {/* Tipe Upah Switch */}
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 dark:text-white">Pilih Sistem Pembayaran:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setInvTipeUpah('Harian')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        invTipeUpah === 'Harian' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Harian (Mingguan)
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvTipeUpah('Borongan')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        invTipeUpah === 'Borongan' ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Borongan (DP/Termin)
                    </button>
                  </div>
                </div>

                {invTipeUpah === 'Harian' ? (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Jumlah Hari Kerja
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={invHariKerja}
                        onChange={(e) => setInvHariKerja(Number(e.target.value))}
                        className="w-full text-xs p-2 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Tarif / Hari (Rp)
                      </label>
                      <input
                        type="text"
                        value={formatRupiahInputValue(invTarifHarian)}
                        onChange={(e) => setInvTarifHarian(parseRupiahInput(e.target.value))}
                        className="w-full text-xs p-2 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold bg-white dark:bg-slate-800 text-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Jam Lembur
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={invJamLembur}
                        onChange={(e) => setInvJamLembur(Number(e.target.value))}
                        className="w-full text-xs p-2 border border-slate-200 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Tarif Lembur / Jam (Rp)
                      </label>
                      <input
                        type="text"
                        value={formatRupiahInputValue(invTarifLembur)}
                        onChange={(e) => setInvTarifLembur(parseRupiahInput(e.target.value))}
                        className="w-full text-xs p-2 border border-slate-200 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Tahapan Pencairan Borongan
                        </label>
                        <select
                          value={invTahapBorongan}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setInvTahapBorongan(val);
                            if (val.includes('DP')) setInvPersenTermin(30);
                            else if (val.includes('Termin 1')) setInvPersenTermin(40);
                            else if (val.includes('Termin 2')) setInvPersenTermin(20);
                            else setInvPersenTermin(10);
                          }}
                          className="w-full text-xs p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-bold"
                        >
                          <option value="DP (Uang Muka)">Tahap DP (Uang Muka)</option>
                          <option value="Termin 1 (Progress 50%)">Termin 1 (Progress 50%)</option>
                          <option value="Termin 2">Termin 2</option>
                          <option value="Pelunasan (100% Selesai)">Pelunasan (100% Selesai)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Persentase Termin (%)
                        </label>
                        <input
                          type="number"
                          value={invPersenTermin}
                          onChange={(e) => setInvPersenTermin(Number(e.target.value))}
                          className="w-full text-xs p-2 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold bg-white dark:bg-slate-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Total Nilai Kontrak Borongan (Rp)
                      </label>
                      <input
                        type="text"
                        value={formatRupiahInputValue(invNominalBoronganTotal)}
                        onChange={(e) => setInvNominalBoronganTotal(parseRupiahInput(e.target.value))}
                        className="w-full text-xs p-2 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-purple-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Uraian Lingkup Pekerjaan Borongan
                      </label>
                      <input
                        type="text"
                        value={invUraianBorongan}
                        onChange={(e) => setInvUraianBorongan(e.target.value)}
                        placeholder="Contoh: Pekerjaan Cor Balok & Plat Lantai 2"
                        className="w-full text-xs p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Deductions & Bonus */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-rose-700 dark:text-rose-400 mb-1">
                    Potongan Kasbon / Pinjaman (Rp)
                  </label>
                  <input
                    type="text"
                    value={formatRupiahInputValue(invPotonganKasbon)}
                    onChange={(e) => setInvPotonganKasbon(parseRupiahInput(e.target.value))}
                    placeholder="Rp 0"
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-rose-600 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                    Bonus Kerapian / Lembur Khusus (Rp)
                  </label>
                  <input
                    type="text"
                    value={formatRupiahInputValue(invBonusKerapian)}
                    onChange={(e) => setInvBonusKerapian(parseRupiahInput(e.target.value))}
                    placeholder="Rp 0"
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-emerald-600 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="p-4 bg-[#1B2B4C] text-white rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#D4AF37] font-bold block uppercase tracking-wider">
                    Total Gaji Bersih Ditransfer:
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Rekening: {invTukang.namaBank} - {invTukang.nomorRekening}
                  </span>
                </div>
                <strong className="text-base sm:text-lg font-mono font-black text-emerald-400">
                  {formatRupiahDisplay(
                    Math.max(0, calculateInvoiceSubtotal() - invPotonganKasbon + invBonusKerapian)
                  )}
                </strong>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Cairkan &amp; Buat Invoice Lunas</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: WHATSAPP NOTIFICATION CONFIRMATION POPUP */}
      {whatsAppModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 border border-emerald-500/50">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <MessageCircle className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-[#1B2B4C] dark:text-white">
                Kirim Bukti Pembayaran ke WhatsApp Tukang?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data pembayaran upah <strong>{whatsAppModalData.namaTukang}</strong> sejumlah{' '}
                <strong className="text-emerald-600">{formatRupiahDisplay(whatsAppModalData.nominal)}</strong> telah berhasil dicatat.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-600 dark:text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span>Penerima:</span>
                <strong className="text-slate-900 dark:text-white">{whatsAppModalData.namaTukang}</strong>
              </div>
              <div className="flex justify-between">
                <span>No. WhatsApp:</span>
                <strong className="text-emerald-600">+{whatsAppModalData.noHp}</strong>
              </div>
              <div className="flex justify-between">
                <span>No. Referensi:</span>
                <strong>{whatsAppModalData.nomorInv}</strong>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWhatsAppModalData(null)}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
              >
                Nanti Saja
              </button>
              <a
                href={whatsAppModalData.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setWhatsAppModalData(null)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-center flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <Send className="w-4 h-4" />
                <span>Buka WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
