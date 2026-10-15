import React, { useState, useMemo } from 'react';
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
  Download, 
  CheckCircle2, 
  TrendingUp, 
  Sliders, 
  Trash2, 
  Target, 
  Hammer,
  Send,
  MessageCircle,
  X
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { 
  ChartOfAccount, 
  JournalEntry, 
  KasBankItem, 
  HutangPiutangRecord, 
  AsetTetapItem, 
  User, 
  CompanyProfile,
  TutupBukuPeriod,
  KopSuratTemplate,
  CoverSuratTemplate,
  PnLBudgetAnnual,
  DivisionBudgetItem,
  DivisionFurnitureUnitBudget
} from '../../types';
import { formatRupiahDisplay, formatRupiahInputValue, parseRupiahInput } from '../../utils/formatters';
import { AkuntansiMenuKey } from '../navigation/AccountingSidebar';
import { initialAnnualBudget, initialDivisionBudgets, initialMulakaOperationalExpenses } from '../../data/mockData';
import { renderPDFCover, renderPDFKopSurat } from '../../utils/pdfHelpers';
import { generateWhatsAppInvoiceNotification } from '../../services/databaseService';

interface AkuntansiMasterViewProps {
  currentMenu: AkuntansiMenuKey;
  coaList: ChartOfAccount[];
  journalEntries: JournalEntry[];
  kasBankList: KasBankItem[];
  hutangPiutangList: HutangPiutangRecord[];
  asetTetapList: AsetTetapItem[];
  companyProfile: CompanyProfile;
  currentUser: User;
  users: User[];
  onAddJournalEntry: (entry: JournalEntry) => void;
  onAddCOA: (coa: ChartOfAccount) => void;
  onTransferKas: (fromId: string, toId: string, nominal: number, catatan: string) => void;
  onAddAdjustingEntry: (entry: JournalEntry) => void;
  onClosePeriod: (period: TutupBukuPeriod) => void;
  onNavigateMenu: (menu: AkuntansiMenuKey) => void;
  onAddKasAccount?: (account: KasBankItem) => void;
  onDeleteKasAccount?: (id: string) => void;
  kopTemplates?: KopSuratTemplate[];
  coverTemplate?: CoverSuratTemplate;
}

export const AkuntansiMasterView: React.FC<AkuntansiMasterViewProps> = ({
  currentMenu,
  coaList,
  journalEntries,
  kasBankList,
  hutangPiutangList,
  asetTetapList,
  companyProfile,
  currentUser,
  users = [],
  onAddJournalEntry,
  onAddCOA,
  onTransferKas,
  onAddAdjustingEntry,
  onClosePeriod,
  onNavigateMenu,
  onAddKasAccount,
  onDeleteKasAccount,
  kopTemplates = [],
  coverTemplate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Selected Account for Ledger
  const [selectedLedgerAccountId, setSelectedLedgerAccountId] = useState<string>(coaList[0]?.id || 'coa-103');

  // Modal Jurnal Manual Form
  const [showManualJournalModal, setShowManualJournalModal] = useState(false);
  const [noBuktiManual, setNoBuktiManual] = useState(`JU-2026/10-${Math.floor(Math.random() * 900 + 100)}`);
  const [tanggalManual, setTanggalManual] = useState(new Date().toISOString().split('T')[0]);
  const [keteranganManual, setKeteranganManual] = useState('');
  const [debitAkunId, setDebitAkunId] = useState(coaList[0]?.id || '');
  const [kreditAkunId, setKreditAkunId] = useState(coaList[1]?.id || '');
  const [nominalManual, setNominalManual] = useState<number>(0);

  // Modal Tambah Rekening Kas/Bank
  const [showAddKasModal, setShowAddKasModal] = useState(false);
  const [kasFormNama, setKasFormNama] = useState('');
  const [kasFormTipe, setKasFormTipe] = useState<KasBankItem['tipe']>('Bank BCA');
  const [kasFormNomor, setKasFormNomor] = useState('');
  const [kasFormAtasNama, setKasFormAtasNama] = useState(companyProfile.nama);
  const [kasFormSaldo, setKasFormSaldo] = useState<number>(0);
  const [kasFormCatatan, setKasFormCatatan] = useState('');

  // Transfer Kas Modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [fromKasId, setFromKasId] = useState(kasBankList[0]?.id || '');
  const [toKasId, setToKasId] = useState(kasBankList[1]?.id || '');
  const [transferNominal, setTransferNominal] = useState<number>(0);
  const [transferCatatan, setTransferCatatan] = useState('');

  // Modal Tambah COA Baru
  const [showAddCoaModal, setShowAddCoaModal] = useState(false);
  const [coaFormKode, setCoaFormKode] = useState('');
  const [coaFormNama, setCoaFormNama] = useState('');
  const [coaFormKategori, setCoaFormKategori] = useState<any>('Aset Lancar');
  const [coaFormTipe, setCoaFormTipe] = useState<any>('Aset');
  const [coaFormNormal, setCoaFormNormal] = useState<'Debit' | 'Kredit'>('Debit');

  // Budget P&L Bulanan & Tahunan State
  const [annualBudget, setAnnualBudget] = useState<PnLBudgetAnnual>(() => {
    const saved = localStorage.getItem('mulaka_annual_budget');
    return saved ? JSON.parse(saved) : initialAnnualBudget;
  });

  // Calculate dynamic employee expenses from actual registered users
  const dynamicEmployeeSalaryAnnual = useMemo(() => {
    const monthlyTotal = users
      .filter(u => u.statusKepegawaian !== 'Direksi')
      .reduce((sum, u) => sum + (u.gaji?.gajiPokok || 0) + (u.gaji?.tunjanganJabatan || 0), 0);
    return monthlyTotal * 12;
  }, [users]);

  const dynamicDireksiSalaryAnnual = useMemo(() => {
    const monthlyTotal = users
      .filter(u => u.statusKepegawaian === 'Direksi')
      .reduce((sum, u) => sum + (u.gaji?.gajiPokok || 0) + (u.gaji?.tunjanganJabatan || 0), 0);
    return (monthlyTotal || 22000000) * 12;
  }, [users]);

  const dynamicBpjsAnnual = useMemo(() => {
    const monthlyTotal = users.reduce((sum, u) => 
      sum + (u.gaji?.potonganBpjsKetenagakerjaan || 0) + (u.gaji?.potonganBpjsKesehatan || 0), 0);
    return monthlyTotal * 12;
  }, [users]);

  // Invoice State & WhatsApp popup
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invKlien, setInvKlien] = useState('');
  const [invWaKlien, setInvWaKlien] = useState('');
  const [invProyek, setInvProyek] = useState('');
  const [invNomor, setInvNomor] = useState(`INV-MLK/${new Date().getFullYear()}/001`);
  const [invTanggal, setInvTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [invJatuhTempo, setInvJatuhTempo] = useState('2026-11-15');
  const [invUraian, setInvUraian] = useState('Penagihan Termin 1 Pekerjaan Struktur');
  const [invNominal, setInvNominal] = useState<number>(0);
  const [invPpn, setInvPpn] = useState<number>(11);

  const [whatsAppInvoicePopup, setWhatsAppInvoicePopup] = useState<{
    link: string;
    klien: string;
    nominal: number;
    invNomor: string;
  } | null>(null);

  // Aggregate Calculations
  const totalAset = useMemo(() => {
    return coaList.filter(c => c.tipe === 'Aset').reduce((sum, c) => sum + c.saldo, 0);
  }, [coaList]);

  const totalKewajiban = useMemo(() => {
    return coaList.filter(c => c.tipe === 'Kewajiban').reduce((sum, c) => sum + c.saldo, 0);
  }, [coaList]);

  const totalEkuitas = useMemo(() => {
    return coaList.filter(c => c.tipe === 'Ekuitas').reduce((sum, c) => sum + c.saldo, 0);
  }, [coaList]);

  const totalPendapatan = useMemo(() => {
    return coaList.filter(c => c.tipe === 'Pendapatan').reduce((sum, c) => sum + c.saldo, 0);
  }, [coaList]);

  const totalHPP = useMemo(() => {
    return coaList.filter(c => c.tipe === 'HPP').reduce((sum, c) => sum + c.saldo, 0);
  }, [coaList]);

  // Operational expenses merged with dynamic employee salaries
  const totalBebanOperasional = useMemo(() => {
    let opex = 0;
    initialMulakaOperationalExpenses.forEach(pos => {
      if (pos.nama === 'Beban Gaji Karyawan') {
        opex += dynamicEmployeeSalaryAnnual > 0 ? dynamicEmployeeSalaryAnnual : pos.targetTahunan;
      } else if (pos.nama === 'Beban Gaji Direksi') {
        opex += dynamicDireksiSalaryAnnual > 0 ? dynamicDireksiSalaryAnnual : pos.targetTahunan;
      } else if (pos.nama === 'Beban BPJS KS') {
        opex += dynamicBpjsAnnual > 0 ? dynamicBpjsAnnual : pos.targetTahunan;
      } else {
        opex += pos.targetTahunan;
      }
    });
    return opex;
  }, [dynamicEmployeeSalaryAnnual, dynamicDireksiSalaryAnnual, dynamicBpjsAnnual]);

  const labaKotor = totalPendapatan - totalHPP;
  const labaBersih = labaKotor - (totalBebanOperasional / 12); // Realized monthly or annual

  // Handle Save Manual Journal Entry
  const handleSaveManualJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (nominalManual <= 0) {
      alert('Nominal harus lebih besar dari 0!');
      return;
    }
    if (debitAkunId === kreditAkunId) {
      alert('Akun Debit dan Kredit tidak boleh sama!');
      return;
    }

    const dAkun = coaList.find(c => c.id === debitAkunId);
    const kAkun = coaList.find(c => c.id === kreditAkunId);
    if (!dAkun || !kAkun) return;

    const newEntry: JournalEntry = {
      id: `je-${Date.now()}`,
      noBukti: noBuktiManual,
      tanggal: tanggalManual,
      keterangan: keteranganManual || `Jurnal Umum Manual (${dAkun.nama} / ${kAkun.nama})`,
      status: 'Posted',
      source: 'Manual',
      lines: [
        { akunId: dAkun.id, akunKode: dAkun.kode, akunNama: dAkun.nama, debit: nominalManual, kredit: 0 },
        { akunId: kAkun.id, akunKode: kAkun.kode, akunNama: kAkun.nama, debit: 0, kredit: nominalManual },
      ],
    };

    onAddJournalEntry(newEntry);
    setShowManualJournalModal(false);
    triggerNotify(`Jurnal ${noBuktiManual} berhasil diposting ke Buku Besar & Neraca Saldo!`);
    setKeteranganManual('');
    setNominalManual(0);
    setNoBuktiManual(`JU-2026/10-${Math.floor(Math.random() * 900 + 100)}`);
  };

  // Export Invoice and trigger WhatsApp
  const handleExportOfficialInvoicePDF = () => {
    if (!invKlien.trim() || invNominal <= 0) {
      alert('Nama Klien dan Nominal Tagihan wajib diisi!');
      return;
    }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    if (coverTemplate && coverTemplate.enableCover) {
      renderPDFCover(doc, coverTemplate, companyProfile, {
        judulDokumen: 'FAKTUR INVOICE PENAGIHAN RESMI (OFFICIAL INVOICE)',
        nomorDokumen: invNomor,
        namaProyek: invProyek || 'Proyek Klien',
        namaKlien: invKlien,
        tanggal: invTanggal,
        disusunOleh: 'Departemen Keuangan & Penagihan PT. Mulaka Cipta Nusantara',
      });
    }

    const matchedKop = kopTemplates.find(k => k.jenisDokumen === 'Invoice') || kopTemplates[0];
    let y = renderPDFKopSurat(doc, matchedKop, companyProfile);

    doc.setTextColor(27, 43, 76);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('FAKTUR PENAGIHAN TERMIN PEMBAYARAN', 14, y);
    y += 5.5;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Nomor Faktur: ${invNomor}  |  Tanggal Terbit: ${invTanggal}  |  Jatuh Tempo: ${invJatuhTempo}`, 14, y);
    y += 4;
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.6);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, pageWidth - 28, 32, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, pageWidth - 28, 32, 2, 2, 'D');

    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('Ditujukan Kepada', 18, y + 8);
    doc.text('Nama Proyek Terkait', 18, y + 16);
    doc.text('Keterangan Tagihan', 18, y + 24);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`: ${invKlien}`, 60, y + 8);
    doc.text(`: ${invProyek || 'Proyek Mulaka'}`, 60, y + 16);
    doc.text(`: ${invUraian}`, 60, y + 24);

    y += 42;

    doc.setFillColor(27, 43, 76);
    doc.rect(14, y, pageWidth - 28, 7.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('NO', 18, y + 5);
    doc.text('DESKRIPSI TERMIN / PEKERJAAN', 32, y + 5);
    doc.text('JUMLAH (RP)', 160, y + 5, { align: 'right' });

    y += 11;
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('1.', 18, y);
    doc.text(invUraian, 32, y);
    doc.setFont('helvetica', 'bold');
    doc.text(formatRupiahDisplay(invNominal), 160, y, { align: 'right' });
    y += 12;

    const ppnAmount = (invNominal * invPpn) / 100;
    const totalTagihan = invNominal + ppnAmount;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(pageWidth - 95, y, 81, 26, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(pageWidth - 95, y, 81, 26, 2, 2, 'D');

    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Subtotal:', pageWidth - 91, y + 6);
    doc.text(formatRupiahDisplay(invNominal), pageWidth - 18, y + 6, { align: 'right' });
    doc.text(`PPN (${invPpn}%):`, pageWidth - 91, y + 12);
    doc.text(formatRupiahDisplay(ppnAmount), pageWidth - 18, y + 12, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(27, 43, 76);
    doc.text('Total Pembayaran:', pageWidth - 91, y + 20);
    doc.text(formatRupiahDisplay(totalTagihan), pageWidth - 18, y + 20, { align: 'right' });

    const primaryBank = (companyProfile.bankAccounts && companyProfile.bankAccounts[0]) || {
      namaBank: 'Bank Central Asia (BCA)',
      nomorRekening: '8105-8829-1002',
      atasNama: companyProfile.nama,
    };

    y += 34;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, y, pageWidth - 28, 26, 2, 2, 'F');
    doc.setFontSize(8.5);
    doc.setTextColor(27, 43, 76);
    doc.setFont('helvetica', 'bold');
    doc.text('INSTRUKSI PEMBAYARAN REKENING RESMI PERUSAHAAN:', 18, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`Bank: ${primaryBank.namaBank}`, 18, y + 13);
    doc.text(`Nomor Rekening: ${primaryBank.nomorRekening}`, 18, y + 18);
    doc.text(`Atas Nama: ${primaryBank.atasNama}`, 18, y + 23);

    doc.save(`Invoice_${invNomor.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    setShowInvoiceModal(false);

    // If client WhatsApp is provided, prepare WhatsApp link
    if (invWaKlien) {
      const waLink = generateWhatsAppInvoiceNotification({
        noHpKlien: invWaKlien,
        namaKlien: invKlien,
        namaProyek: invProyek,
        nomorInvoice: invNomor,
        uraianTagihan: invUraian,
        nominalTotal: totalTagihan,
        jatuhTempo: invJatuhTempo,
        namaBank: primaryBank.namaBank,
        nomorRekening: primaryBank.nomorRekening,
        atasNama: primaryBank.atasNama,
        namaPerusahaan: companyProfile.nama,
      });

      setWhatsAppInvoicePopup({
        link: waLink,
        klien: invKlien,
        nominal: totalTagihan,
        invNomor,
      });
    }

    triggerNotify(`Faktur ${invNomor} berhasil diekspor ke PDF dengan Kop & Cover resmi!`);
  };

  return (
    <div className="space-y-5">
      {/* 1. DASHBOARD AKUNTANSI */}
      {currentMenu === 'dashboard' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-base md:text-lg font-bold text-[#1B2B4C] dark:text-white">
                  Executive Dashboard Akuntansi &amp; Finance
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Struktur Laporan Laba Rugi P&amp;L terintegrasi dengan penambahan gaji karyawan &amp; operasional sesuai standar Mulaka.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Terbitkan Faktur / Invoice</span>
              </button>
              <button
                onClick={() => onNavigateMenu('budget-pnl')}
                className="bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-blue-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Target className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Buka Tabel P&amp;L (image.png)</span>
              </button>
            </div>
          </div>

          {/* 6 KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 block uppercase">Total Aset</span>
              <strong className="text-sm md:text-base font-mono text-slate-900 dark:text-white block mt-1">
                {formatRupiahDisplay(totalAset)}
              </strong>
              <span className="text-[10px] text-slate-400">Kas &amp; Piutang</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 block uppercase">Total Kewajiban</span>
              <strong className="text-sm md:text-base font-mono text-rose-700 dark:text-rose-400 block mt-1">
                {formatRupiahDisplay(totalKewajiban)}
              </strong>
              <span className="text-[10px] text-slate-400">Hutang Supplier</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 block uppercase">Ekuitas &amp; Modal</span>
              <strong className="text-sm md:text-base font-mono text-purple-800 dark:text-purple-300 block mt-1">
                {formatRupiahDisplay(totalEkuitas)}
              </strong>
              <span className="text-[10px] text-slate-400">Modal Disetor</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block uppercase">Pendapatan Usaha</span>
              <strong className="text-sm md:text-base font-mono text-emerald-700 dark:text-emerald-400 block mt-1">
                {formatRupiahDisplay(totalPendapatan)}
              </strong>
              <span className="text-[10px] text-slate-400">3 Kategori Usaha</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 block uppercase">Beban Operasional</span>
              <strong className="text-sm md:text-base font-mono text-slate-800 dark:text-slate-200 block mt-1">
                {formatRupiahDisplay(totalBebanOperasional)}
              </strong>
              <span className="text-[10px] text-slate-400">Termasuk Gaji &amp; BPJS</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs bg-emerald-50/40 dark:bg-emerald-950/30">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block uppercase">Laba Bersih</span>
              <strong className="text-sm md:text-base font-mono text-emerald-800 dark:text-emerald-300 font-extrabold block mt-1">
                {formatRupiahDisplay(labaBersih)}
              </strong>
              <span className="text-[10px] text-emerald-700 font-medium">Net Profit</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. LAPORAN LABA RUGI (PROFIT & LOSS) EXACT SESUAI CONTOH GAMBAR image.png */}
      {currentMenu === 'budget-pnl' && (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-extrabold text-base md:text-lg text-[#1B2B4C] dark:text-white">
                  PT. MULAKA CIPTA NUSANTARA &bull; LAPORAN LABA RUGI (PROFIT &amp; LOSS)
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Format resmi persis sesuai lampiran (image.png). Beban Gaji Karyawan &amp; BPJS KS otomatis terintegrasi saat ada penambahan karyawan.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full">
                Periode: Tahun Berjalan 2026
              </span>
            </div>
          </div>

          {/* Exact P&L Table from image.png */}
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden font-mono text-xs shadow-xs">
            {/* Header Sheet Title */}
            <div className="bg-[#1B2B4C] text-white p-4 flex justify-between items-center font-sans border-b-2 border-[#D4AF37]">
              <div>
                <h4 className="font-bold text-sm tracking-wide">PT. MULAKA CIPTA NUSANTARA</h4>
                <h5 className="font-extrabold text-xs text-[#D4AF37] uppercase tracking-wider">
                  LAPORAN LABA RUGI (PROFIT &amp; LOSS)
                </h5>
                <span className="text-[10px] text-slate-300 italic">Periode: Tahun Berjalan</span>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="text-[10px] text-slate-300 block">Karyawan Terintegrasi:</span>
                <span className="font-bold text-emerald-400">{users.length} Orang</span>
              </div>
            </div>

            <table className="w-full text-left border-collapse bg-white dark:bg-slate-900">
              <tbody>
                {/* 1. PENDAPATAN */}
                <tr className="bg-blue-50/60 dark:bg-blue-950/40 font-bold text-[#1B2B4C] dark:text-white font-sans text-xs border-b border-slate-200 dark:border-slate-700">
                  <td colSpan={2} className="py-2.5 px-4 tracking-wider uppercase">PENDAPATAN</td>
                  <td className="py-2.5 px-4 text-right">Nominal (Rp)</td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850">
                  <td className="py-2 px-4 pl-8 font-sans text-slate-700 dark:text-slate-300" colSpan={2}>
                    Jasa Penjualan Desain Arsitektur &amp; Interior
                  </td>
                  <td className="py-2 px-4 text-right font-bold text-slate-800 dark:text-slate-200">
                    {formatRupiahDisplay(coaList.find(c => c.kode === '4-1100')?.saldo || 450000000)}
                  </td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850">
                  <td className="py-2 px-4 pl-8 font-sans text-slate-700 dark:text-slate-300" colSpan={2}>
                    Jasa Custom Furniture
                  </td>
                  <td className="py-2 px-4 text-right font-bold text-slate-800 dark:text-slate-200">
                    {formatRupiahDisplay(coaList.find(c => c.kode === '4-1200')?.saldo || 850000000)}
                  </td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850">
                  <td className="py-2 px-4 pl-8 font-sans text-slate-700 dark:text-slate-300" colSpan={2}>
                    Jasa Konstruksi
                  </td>
                  <td className="py-2 px-4 text-right font-bold text-slate-800 dark:text-slate-200">
                    {formatRupiahDisplay(coaList.find(c => c.kode === '4-1300')?.saldo || 3700000000)}
                  </td>
                </tr>
                <tr className="bg-emerald-50 dark:bg-emerald-950/40 font-bold border-b-2 border-slate-300 dark:border-slate-700 text-emerald-900 dark:text-emerald-300">
                  <td className="py-2.5 px-4 font-sans uppercase" colSpan={2}>TOTAL PENDAPATAN</td>
                  <td className="py-2.5 px-4 text-right text-sm">
                    {formatRupiahDisplay(5000000000)}
                  </td>
                </tr>

                {/* 2. BEBAN POKOK PENDAPATAN (HPP) */}
                <tr className="bg-amber-50/60 dark:bg-amber-950/40 font-bold text-[#1B2B4C] dark:text-white font-sans text-xs border-b border-slate-200 dark:border-slate-700">
                  <td colSpan={2} className="py-2.5 px-4 tracking-wider uppercase">BEBAN POKOK PENDAPATAN (HPP)</td>
                  <td className="py-2.5 px-4 text-right"></td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850">
                  <td className="py-2 px-4 pl-8 font-sans text-slate-700 dark:text-slate-300" colSpan={2}>
                    Potongan Komisi Fee % Marketing
                  </td>
                  <td className="py-2 px-4 text-right text-slate-800 dark:text-slate-200">
                    {formatRupiahDisplay(150000000)}
                  </td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850">
                  <td className="py-2 px-4 pl-8 font-sans text-slate-700 dark:text-slate-300" colSpan={2}>
                    Biaya Material &amp; Upah Proyek Langsung
                  </td>
                  <td className="py-2 px-4 text-right text-slate-800 dark:text-slate-200">
                    {formatRupiahDisplay(3050000000)}
                  </td>
                </tr>
                <tr className="bg-amber-100/60 dark:bg-amber-950/60 font-bold border-b-2 border-slate-300 dark:border-slate-700 text-amber-900 dark:text-amber-300">
                  <td className="py-2.5 px-4 font-sans uppercase" colSpan={2}>TOTAL HPP</td>
                  <td className="py-2.5 px-4 text-right text-sm">
                    {formatRupiahDisplay(3200000000)}
                  </td>
                </tr>

                {/* 3. LABA KOTOR */}
                <tr className="bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-900 dark:text-white border-b-2 border-slate-300 dark:border-slate-700 text-sm">
                  <td className="py-3 px-4 font-sans uppercase" colSpan={2}>LABA KOTOR</td>
                  <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400">
                    {formatRupiahDisplay(1800000000)}
                  </td>
                </tr>

                {/* 4. BIAYA OPERASIONAL (17 Rows EXACT as image.png) */}
                <tr className="bg-rose-50/60 dark:bg-rose-950/40 font-bold text-[#1B2B4C] dark:text-white font-sans text-xs border-b border-slate-200 dark:border-slate-700">
                  <td colSpan={2} className="py-2.5 px-4 tracking-wider uppercase">BIAYA OPERASIONAL</td>
                  <td className="py-2.5 px-4 text-right"></td>
                </tr>

                {initialMulakaOperationalExpenses.map((pos) => {
                  let nominal = pos.targetTahunan;
                  let note = '';

                  // DYNAMIC INTEGRATION WHEN EMPLOYEES ARE ADDED
                  if (pos.nama === 'Beban Gaji Karyawan') {
                    nominal = dynamicEmployeeSalaryAnnual > 0 ? dynamicEmployeeSalaryAnnual : pos.targetTahunan;
                    note = `(Auto-Sync dari ${users.filter(u => u.statusKepegawaian !== 'Direksi').length} Karyawan Tetap)`;
                  } else if (pos.nama === 'Beban Gaji Direksi') {
                    nominal = dynamicDireksiSalaryAnnual > 0 ? dynamicDireksiSalaryAnnual : pos.targetTahunan;
                    note = `(Direksi)`;
                  } else if (pos.nama === 'Beban BPJS KS') {
                    nominal = dynamicBpjsAnnual > 0 ? dynamicBpjsAnnual : pos.targetTahunan;
                    note = `(BPJS TK & Kes)`;
                  }

                  return (
                    <tr key={pos.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850">
                      <td className="py-2 px-4 pl-8 font-sans text-slate-700 dark:text-slate-300" colSpan={2}>
                        <div className="flex items-center gap-2">
                          <span>{pos.nama}</span>
                          {note && (
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-normal">
                              {note}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-4 text-right text-slate-700 dark:text-slate-300 font-mono">
                        {formatRupiahDisplay(nominal)}
                      </td>
                    </tr>
                  );
                })}

                <tr className="bg-rose-100/60 dark:bg-rose-950/60 font-bold border-b-2 border-slate-300 dark:border-slate-700 text-rose-900 dark:text-rose-300">
                  <td className="py-2.5 px-4 font-sans uppercase" colSpan={2}>TOTAL BIAYA OPERASIONAL</td>
                  <td className="py-2.5 px-4 text-right text-sm text-rose-700 dark:text-rose-400">
                    {formatRupiahDisplay(totalBebanOperasional)}
                  </td>
                </tr>

                {/* 5. LABA BERSIH (NET PROFIT) */}
                <tr className="bg-[#1B2B4C] text-white font-black text-sm sm:text-base border-t-2 border-[#D4AF37]">
                  <td className="py-4 px-4 font-sans uppercase text-[#D4AF37]" colSpan={2}>
                    LABA BERSIH (NET PROFIT)
                  </td>
                  <td className="py-4 px-4 text-right text-emerald-400 font-mono">
                    {formatRupiahDisplay(1800000000 - totalBebanOperasional)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. KAS & BANK DENGAN TAMBAH / HAPUS REKENING */}
      {currentMenu === 'kas-bank' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <h3 className="font-bold text-sm md:text-base text-[#1B2B4C] dark:text-white flex items-center gap-2">
                <WalletCards className="w-5 h-5 text-emerald-600" />
                <span>Kas &amp; Bank Management (Tambah &amp; Hapus Rekening)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kelola rekening bank resmi perusahaan serta brankas kas operasional kantor &amp; lapangan.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddKasModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Rekening / Akun Kas</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kasBankList.map((kb) => (
              <div key={kb.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-2xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono">
                      {kb.tipe}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <h4 className="font-bold text-sm text-[#1B2B4C] dark:text-white mt-1">{kb.nama}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{kb.nomorRekening}</p>
                  <p className="text-[11px] text-slate-400">A.n {kb.atasNama}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Saldo Realtime</span>
                    <strong className="text-base font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {formatRupiahDisplay(kb.saldo)}
                    </strong>
                  </div>
                  {onDeleteKasAccount && kasBankList.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus akun rekening "${kb.nama}"?`)) {
                          onDeleteKasAccount(kb.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      title="Hapus Rekening"
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

      {/* 4. DAFTAR AKUN COA */}
      {currentMenu === 'daftar-akun' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <h3 className="font-bold text-sm md:text-base text-[#1B2B4C] dark:text-white">
                Daftar Akun (Chart of Accounts - COA) Standar PSAK
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Struktur klasifikasi akun keuangan (1-Aset, 2-Kewajiban, 3-Ekuitas, 4-Pendapatan, 5-HPP, 6-Beban Operasional).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#1B2B4C] dark:bg-slate-950 text-white text-[10px] uppercase font-bold">
                  <th className="py-2.5 px-3">Kode Akun</th>
                  <th className="py-2.5 px-3">Nama Akun</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3 text-center">Tipe</th>
                  <th className="py-2.5 px-3 text-center">Saldo Normal</th>
                  <th className="py-2.5 px-3 text-right">Saldo Terhitung (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
                {coaList.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition">
                    <td className="py-2 px-3 font-bold text-blue-700 dark:text-blue-400">{c.kode}</td>
                    <td className="py-2 px-3 font-semibold font-sans text-slate-800 dark:text-slate-200">{c.nama}</td>
                    <td className="py-2 px-3 font-sans text-slate-500 text-[11px]">{c.kategori}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-sans">
                        {c.tipe}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center text-slate-500">{c.saldoNormal}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatRupiahDisplay(c.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. JURNAL UMUM */}
      {currentMenu === 'jurnal-umum' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <h3 className="font-bold text-sm md:text-base text-[#1B2B4C] dark:text-white">
                Jurnal Umum (General Journal)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Buku jurnal kronologis. Seluruh transaksi kas proyek &amp; gaji otomatis masuk ke jurnal umum ini secara realtime.
              </p>
            </div>
            <button
              onClick={() => setShowManualJournalModal(true)}
              className="bg-[#10B981] hover:bg-[#059669] text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>+ Entri Jurnal Manual</span>
            </button>
          </div>

          <div className="space-y-3">
            {journalEntries.map((je) => (
              <div key={je.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-2xs space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1B2B4C] dark:text-white">{je.noBukti}</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.2 rounded font-mono">
                      {je.tanggal}
                    </span>
                    <span className="text-[9px] bg-[#1B2B4C] text-[#D4AF37] px-2 py-0.2 rounded font-bold">
                      {je.source}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                    {je.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{je.keterangan}</p>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[10px] text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                        <th className="py-1.5 px-3">Kode &amp; Akun</th>
                        <th className="py-1.5 px-3 text-right">Debit (Rp)</th>
                        <th className="py-1.5 px-3 text-right">Kredit (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                      {je.lines.map((line, lIdx) => (
                        <tr key={lIdx}>
                          <td className={`py-1.5 px-3 font-sans ${line.kredit > 0 ? 'pl-8 text-slate-600' : 'font-semibold text-slate-800 dark:text-slate-200'}`}>
                            <span className="font-mono text-[10px] text-slate-400 mr-2">{line.akunKode}</span>
                            <span>{line.akunNama}</span>
                          </td>
                          <td className="py-1.5 px-3 text-right font-bold text-slate-800 dark:text-white">
                            {line.debit > 0 ? formatRupiahDisplay(line.debit) : '-'}
                          </td>
                          <td className="py-1.5 px-3 text-right font-bold text-slate-800 dark:text-white">
                            {line.kredit > 0 ? formatRupiahDisplay(line.kredit) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL TERBITKAN FAKTUR / INVOICE */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-[#1B2B4C] dark:text-white">
                Terbitkan Faktur Tagihan / Invoice Resmi
              </h3>
              <button onClick={() => setShowInvoiceModal(false)} className="text-slate-400 text-lg cursor-pointer">
                &times;
              </button>
            </div>
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Faktur</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Klien / Pemilik</label>
                  <input
                    type="text"
                    required
                    placeholder="Bpk / Ibu..."
                    value={invKlien}
                    onChange={(e) => setInvKlien(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">WhatsApp Klien (Notifikasi)</label>
                  <input
                    type="text"
                    placeholder="821..."
                    value={invWaKlien}
                    onChange={(e) => setInvWaKlien(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Proyek</label>
                <input
                  type="text"
                  placeholder="Proyek Renovasi / Custom Kitchen..."
                  value={invProyek}
                  onChange={(e) => setInvProyek(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Uraian Tagihan Termin</label>
                <input
                  type="text"
                  required
                  value={invUraian}
                  onChange={(e) => setInvUraian(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nominal Termin (Rp)</label>
                  <input
                    type="text"
                    value={formatRupiahInputValue(invNominal)}
                    onChange={(e) => setInvNominal(parseRupiahInput(e.target.value))}
                    placeholder="Rp 0"
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">PPN (%)</label>
                  <input
                    type="number"
                    value={invPpn}
                    onChange={(e) => setInvPpn(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-[#1B2B4C] text-white rounded-xl flex justify-between items-center text-xs">
                <span>Total Faktur (+PPN):</span>
                <strong className="font-mono text-sm text-[#D4AF37]">
                  {formatRupiahDisplay(invNominal + (invNominal * invPpn) / 100)}
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
                  type="button"
                  onClick={handleExportOfficialInvoicePDF}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF &amp; Siapkan WA</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP POPUP FOR CLIENT INVOICE */}
      {whatsAppInvoicePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 border border-emerald-500/50">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <MessageCircle className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-[#1B2B4C] dark:text-white">
                Kirim Faktur ke WhatsApp Klien?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Faktur penagihan <strong>{whatsAppInvoicePopup.invNomor}</strong> atas nama{' '}
                <strong>{whatsAppInvoicePopup.klien}</strong> ({formatRupiahDisplay(whatsAppInvoicePopup.nominal)}) siap dikirim.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWhatsAppInvoicePopup(null)}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
              >
                Nanti Saja
              </button>
              <a
                href={whatsAppInvoicePopup.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setWhatsAppInvoicePopup(null)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-center flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <Send className="w-4 h-4" />
                <span>Kirim via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL JURNAL MANUAL */}
      {showManualJournalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-[#1B2B4C] dark:text-white">Posting Entri Jurnal Manual</h3>
              <button onClick={() => setShowManualJournalModal(false)} className="text-slate-400 text-lg cursor-pointer">
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveManualJournal} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Bukti</label>
                  <input
                    type="text"
                    required
                    value={noBuktiManual}
                    onChange={(e) => setNoBuktiManual(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={tanggalManual}
                    onChange={(e) => setTanggalManual(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Keterangan Transaksi</label>
                <input
                  type="text"
                  required
                  value={keteranganManual}
                  onChange={(e) => setKeteranganManual(e.target.value)}
                  placeholder="Contoh: Pembayaran Biaya Notaris Perikatan Proyek"
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-blue-700 dark:text-blue-400 mb-1">Akun Debit (+)</label>
                  <select
                    value={debitAkunId}
                    onChange={(e) => setDebitAkunId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    {coaList.map((c) => (
                      <option key={c.id} value={c.id}>[{c.kode}] {c.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-rose-700 dark:text-rose-400 mb-1">Akun Kredit (-)</label>
                  <select
                    value={kreditAkunId}
                    onChange={(e) => setKreditAkunId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    {coaList.map((c) => (
                      <option key={c.id} value={c.id}>[{c.kode}] {c.nama}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nominal Transaksi (Rp)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={nominalManual || ''}
                  onChange={(e) => setNominalManual(Number(e.target.value))}
                  placeholder="Rp 0"
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowManualJournalModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-blue-600 text-white rounded-xl font-semibold shadow-md cursor-pointer"
                >
                  Posting Jurnal Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH REKENING KAS */}
      {showAddKasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-[#1B2B4C] dark:text-white">Tambah Rekening / Akun Kas Baru</h3>
              <button onClick={() => setShowAddKasModal(false)} className="text-slate-400 text-lg cursor-pointer">
                &times;
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (onAddKasAccount) {
                onAddKasAccount({
                  id: `kb-${Date.now()}`,
                  nama: kasFormNama,
                  tipe: kasFormTipe,
                  nomorRekening: kasFormNomor,
                  atasNama: kasFormAtasNama,
                  saldo: kasFormSaldo,
                  catatan: kasFormCatatan,
                });
              }
              setShowAddKasModal(false);
              triggerNotify(`Rekening ${kasFormNama} berhasil ditambahkan!`);
            }} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Akun</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bank Central Asia Operasional"
                  value={kasFormNama}
                  onChange={(e) => setKasFormNama(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipe</label>
                  <select
                    value={kasFormTipe}
                    onChange={(e) => setKasFormTipe(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800"
                  >
                    <option value="Bank BCA">Bank BCA</option>
                    <option value="Bank Mandiri">Bank Mandiri</option>
                    <option value="Bank BRI">Bank BRI</option>
                    <option value="Kas Besar">Kas Besar Proyek</option>
                    <option value="Kas Kecil">Kas Kecil (Petty)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    required
                    placeholder="8105..."
                    value={kasFormNomor}
                    onChange={(e) => setKasFormNomor(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-mono bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddKasModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
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
