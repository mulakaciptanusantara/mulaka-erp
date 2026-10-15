import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Sparkles, 
  Plus, 
  Download, 
  Trash2, 
  Layers, 
  TrendingUp, 
  Sliders, 
  FileSpreadsheet,
  Building2,
  Search,
  CheckCircle2,
  FolderPlus,
  FolderKanban,
  MapPin,
  User as UserIcon,
  X,
  Upload,
  Send,
  Edit,
  Tag,
  ArrowRight
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { 
  RABProject, 
  RABItem, 
  AHSPCategory, 
  AHSPItemMaster, 
  CompanyProfile, 
  KopSuratTemplate, 
  CoverSuratTemplate,
  BaseMaterialPrice,
  BaseWageRate,
  AIMarketPriceResult 
} from '../../types';
import { MASTER_AHSP_DATABASE } from '../../data/ahspMasterData';
import { initialBaseMaterials, initialBaseWages } from '../../data/basePriceData';
import { askAIMaterialPrice } from '../../services/geminiService';
import { formatRupiahDisplay, formatRupiahInputValue, parseRupiahInput } from '../../utils/formatters';
import { renderPDFCover, renderPDFKopSurat } from '../../utils/pdfHelpers';

interface ProyekEstimasiRABViewProps {
  rabProjects: RABProject[];
  activeRabId: string;
  onSelectRab: (id: string) => void;
  onCreateNewRab: (newRab: RABProject) => void;
  onDeleteRab: (id: string) => void;
  onUpdateRAB: (rab: RABProject) => void;
  ahspMasterList?: AHSPItemMaster[];
  onUpdateAhspMasterList?: (list: AHSPItemMaster[]) => void;
  baseMaterials?: BaseMaterialPrice[];
  onUpdateBaseMaterials?: (list: BaseMaterialPrice[]) => void;
  baseWages?: BaseWageRate[];
  onUpdateBaseWages?: (list: BaseWageRate[]) => void;
  onNavigateToKurvaS: () => void;
  companyProfile: CompanyProfile;
  kopTemplates: KopSuratTemplate[];
  coverTemplate: CoverSuratTemplate;
}

export const ProyekEstimasiRABView: React.FC<ProyekEstimasiRABViewProps> = ({
  rabProjects,
  activeRabId,
  onSelectRab,
  onCreateNewRab,
  onDeleteRab,
  onUpdateRAB,
  ahspMasterList = MASTER_AHSP_DATABASE,
  onUpdateAhspMasterList,
  baseMaterials = initialBaseMaterials,
  onUpdateBaseMaterials,
  baseWages = initialBaseWages,
  onUpdateBaseWages,
  onNavigateToKurvaS,
  companyProfile,
  kopTemplates,
  coverTemplate,
}) => {
  const [subTab, setSubTab] = useState<'boq-view' | 'tabel-ahsp' | 'harga-dasar' | 'import-spreadsheet'>('boq-view');
  const [notification, setNotification] = useState<string | null>(null);

  const currentRab = useMemo(() => {
    return rabProjects.find(p => p.id === activeRabId) || rabProjects[0] || {
      id: 'rab-default',
      namaProyek: 'RAB Proyek',
      klien: 'Klien',
      lokasi: 'Bandung',
      tanggal: '2026-10-14',
      overheadProfitPercent: 10,
      ppnPercent: 11,
      items: [],
    };
  }, [rabProjects, activeRabId]);

  // Modals
  const [showNewRabModal, setShowNewRabModal] = useState(false);
  const [showEditRabHeaderModal, setShowEditRabHeaderModal] = useState(false);
  const [newRabNama, setNewRabNama] = useState('');
  const [newRabKlien, setNewRabKlien] = useState('');
  const [newRabLokasi, setNewRabLokasi] = useState('Bandung');
  const [newRabProfit, setNewRabProfit] = useState<number>(10);
  const [newRabPpn, setNewRabPpn] = useState<number>(11);

  // Edit Header
  const [editRabNama, setEditRabNama] = useState('');
  const [editRabKlien, setEditRabKlien] = useState('');
  const [editRabLokasi, setEditRabLokasi] = useState('');
  const [editRabProfit, setEditRabProfit] = useState<number>(10);
  const [editRabPpn, setEditRabPpn] = useState<number>(11);

  // BoQ Item Modal
  const [showAddBoQModal, setShowAddBoQModal] = useState(false);
  const [editingBoQItem, setEditingBoQItem] = useState<RABItem | null>(null);
  const [boqAddMode, setBoqAddMode] = useState<'ahsp-lookup' | 'manual'>('ahsp-lookup');
  const [boqUraian, setBoqUraian] = useState('');
  const [boqKategori, setBoqKategori] = useState('I. PEKERJAAN PERSIAPAN');
  const [boqSpesifikasi, setBoqSpesifikasi] = useState('');
  const [boqTipeAHSP, setBoqTipeAHSP] = useState<AHSPCategory>('AHSP SNI');
  const [boqKodeAHSP, setBoqKodeAHSP] = useState('');
  const [boqVolume, setBoqVolume] = useState<number>(1);
  const [boqSatuan, setBoqSatuan] = useState('m2');
  const [boqHargaSatuan, setBoqHargaSatuan] = useState<number>(0);
  const [ahspKeyword, setAhspKeyword] = useState('');

  // AI Price
  const [aiPriceQuestion, setAiPriceQuestion] = useState('Berapa harga semen Gresik 50kg di Bandung Timur?');
  const [isAiPriceLoading, setIsAiPriceLoading] = useState(false);
  const [aiPriceResult, setAiPriceResult] = useState<AIMarketPriceResult | null>(null);

  const triggerNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const subtotal = useMemo(() => {
    return (currentRab.items || []).reduce((sum, it) => sum + (it.total || 0), 0);
  }, [currentRab.items]);
  const overheadNominal = (subtotal * (currentRab.overheadProfitPercent || 0)) / 100;
  const ppnNominal = ((subtotal + overheadNominal) * (currentRab.ppnPercent || 0)) / 100;
  const grandTotal = subtotal + overheadNominal + ppnNominal;

  const searchedLookupAhsp = useMemo(() => {
    if (!ahspKeyword.trim()) return ahspMasterList;
    const q = ahspKeyword.toLowerCase();
    return ahspMasterList.filter(a => 
      a.namaPekerjaan.toLowerCase().includes(q) ||
      a.kode.toLowerCase().includes(q) ||
      a.kelompok.toLowerCase().includes(q)
    );
  }, [ahspMasterList, ahspKeyword]);

  const categoriesInBoq = useMemo(() => {
    const list: string[] = [];
    (currentRab.items || []).forEach(it => {
      if (!list.includes(it.kategori)) {
        list.push(it.kategori);
      }
    });
    return list;
  }, [currentRab.items]);

  const handleCreateRabConfirm = () => {
    if (!newRabNama.trim()) {
      alert('Nama Proyek RAB wajib diisi.');
      return;
    }

    const newProject: RABProject = {
      id: `rab-${Date.now()}`,
      namaProyek: newRabNama,
      klien: newRabKlien || 'Klien Baru',
      lokasi: newRabLokasi || 'Bandung',
      tanggal: new Date().toISOString().split('T')[0],
      overheadProfitPercent: Number(newRabProfit) || 0,
      ppnPercent: Number(newRabPpn) || 0,
      items: [],
    };
    onCreateNewRab(newProject);
    setShowNewRabModal(false);
    triggerNotify(`RAB Proyek "${newProject.namaProyek}" berhasil dibuat!`);
  };

  const handleSaveEditHeader = () => {
    const updated: RABProject = {
      ...currentRab,
      namaProyek: editRabNama,
      klien: editRabKlien,
      lokasi: editRabLokasi,
      overheadProfitPercent: Number(editRabProfit) || 0,
      ppnPercent: Number(editRabPpn) || 0,
    };
    onUpdateRAB(updated);
    setShowEditRabHeaderModal(false);
    triggerNotify('Parameter proyek RAB berhasil diperbarui.');
  };

  const handleOpenAddBoQ = () => {
    setEditingBoQItem(null);
    setBoqAddMode('ahsp-lookup');
    setBoqKategori('I. PEKERJAAN PERSIAPAN');
    setBoqUraian('');
    setBoqSpesifikasi('');
    setBoqTipeAHSP('AHSP SNI');
    setBoqKodeAHSP('');
    setBoqVolume(1);
    setBoqSatuan('m2');
    setBoqHargaSatuan(0);
    setAhspKeyword('');
    setShowAddBoQModal(true);
  };

  const handleSelectAhspForBoQ = (ahsp: AHSPItemMaster) => {
    setBoqUraian(ahsp.namaPekerjaan);
    setBoqKategori(ahsp.kelompok);
    setBoqKodeAHSP(ahsp.kode);
    setBoqSatuan(ahsp.satuan);
    setBoqHargaSatuan(ahsp.totalHsp);
    setBoqSpesifikasi(
      ahsp.bahanMaterial.map(b => `${b.nama} (${b.koefisien} ${b.satuan})`).join(', ') || 'Standar Cipta Karya'
    );
  };

  const handleSaveBoQItem = () => {
    if (!boqUraian.trim()) {
      alert('Uraian pekerjaan wajib diisi.');
      return;
    }
    const calculatedTotal = (Number(boqVolume) || 0) * (Number(boqHargaSatuan) || 0);

    if (editingBoQItem) {
      const updatedItems = (currentRab.items || []).map(it => {
        if (it.id === editingBoQItem.id) {
          return {
            ...it,
            uraian: boqUraian,
            kategori: boqKategori,
            spesifikasiBahan: boqSpesifikasi,
            tipeAHSP: boqTipeAHSP,
            kodeAHSP: boqKodeAHSP,
            volume: Number(boqVolume) || 1,
            satuan: boqSatuan,
            hargaSatuan: Number(boqHargaSatuan) || 0,
            total: calculatedTotal,
          };
        }
        return it;
      });
      onUpdateRAB({ ...currentRab, items: updatedItems });
      triggerNotify('Item BoQ berhasil diperbarui!');
    } else {
      const newItem: RABItem = {
        id: `item-${Date.now()}`,
        kategori: boqKategori,
        uraian: boqUraian,
        spesifikasiBahan: boqSpesifikasi,
        tipeAHSP: boqTipeAHSP,
        kodeAHSP: boqKodeAHSP,
        volume: Number(boqVolume) || 1,
        satuan: boqSatuan,
        hargaSatuan: Number(boqHargaSatuan) || 0,
        total: calculatedTotal,
      };
      onUpdateRAB({ ...currentRab, items: [...(currentRab.items || []), newItem] });
      triggerNotify('Item baru berhasil ditambahkan ke BoQ!');
    }
    setShowAddBoQModal(false);
  };

  const handleExportBoQPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    if (coverTemplate && coverTemplate.enableCover) {
      renderPDFCover(doc, coverTemplate, companyProfile, {
        judulDokumen: 'BILL OF QUANTITIES (BoQ) & ANGGARAN BIAYA',
        nomorDokumen: `BoQ-MLK/${new Date().getFullYear()}/${currentRab.id.slice(-4).toUpperCase()}`,
        namaProyek: currentRab.namaProyek,
        namaKlien: currentRab.klien,
        tanggal: currentRab.tanggal || new Date().toISOString().split('T')[0],
        disusunOleh: 'Divisi Estimasi & Quantity Surveyor PT. Mulaka Cipta Nusantara',
      });
    }

    const currentKop = kopTemplates.find(k => k.jenisDokumen === 'BoQ') || kopTemplates[0];
    let y = renderPDFKopSurat(doc, currentKop, companyProfile);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(27, 43, 76);
    doc.text('RINCIAN BILL OF QUANTITIES (BoQ) & ESTIMASI ANGGARAN', pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Proyek: ${currentRab.namaProyek} | Lokasi: ${currentRab.lokasi} | Klien: ${currentRab.klien}`, pageWidth / 2, y, { align: 'center' });
    y += 7;

    // Table Header
    doc.setFillColor(27, 43, 76);
    doc.rect(14, y, pageWidth - 28, 7.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('NO', 16, y + 5);
    doc.text('URAIAN PEKERJAAN & SPESIFIKASI', 26, y + 5);
    doc.text('VOL', 115, y + 5);
    doc.text('SAT', 126, y + 5);
    doc.text('HARGA SAT (RP)', 138, y + 5);
    doc.text('TOTAL (RP)', 170, y + 5);
    y += 9.5;

    let itemNumber = 1;
    categoriesInBoq.forEach(cat => {
      const catItems = (currentRab.items || []).filter(it => it.kategori === cat);
      if (catItems.length === 0) return;
      if (y > 265) {
        doc.addPage();
        y = 20;
      }
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y - 4, pageWidth - 28, 6.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(27, 43, 76);
      doc.text(cat, 16, y);
      const catTotal = catItems.reduce((acc, i) => acc + i.total, 0);
      doc.text(catTotal.toLocaleString('id-ID'), pageWidth - 18, y, { align: 'right' });
      y += 6.5;

      catItems.forEach(item => {
        if (y > 268) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(30, 41, 59);
        doc.text(`${itemNumber++}`, 16, y);
        doc.text(item.uraian.substring(0, 48), 26, y);
        doc.text(`${item.volume}`, 115, y);
        doc.text(item.satuan, 126, y);
        doc.text(item.hargaSatuan.toLocaleString('id-ID'), 138, y);
        doc.setFont('helvetica', 'bold');
        doc.text(item.total.toLocaleString('id-ID'), 170, y);
        doc.setDrawColor(241, 245, 249);
        doc.line(14, y + 2, pageWidth - 14, y + 2);
        y += 6;
      });
      y += 2;
    });

    if (y > 235) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(pageWidth - 95, y, 81, 32, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(pageWidth - 95, y, 81, 32, 2, 2, 'D');

    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal Pekerjaan Fisik:', pageWidth - 91, y + 6);
    doc.text(subtotal.toLocaleString('id-ID'), pageWidth - 18, y + 6, { align: 'right' });
    doc.text(`Jasa Kontraktor & Profit (${currentRab.overheadProfitPercent}%):`, pageWidth - 91, y + 12);
    doc.text(overheadNominal.toLocaleString('id-ID'), pageWidth - 18, y + 12, { align: 'right' });
    doc.text(`PPN (${currentRab.ppnPercent}%):`, pageWidth - 91, y + 18);
    doc.text(ppnNominal.toLocaleString('id-ID'), pageWidth - 18, y + 18, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(27, 43, 76);
    doc.text('Grand Total Anggaran:', pageWidth - 91, y + 26);
    doc.text('Rp ' + grandTotal.toLocaleString('id-ID'), pageWidth - 18, y + 26, { align: 'right' });

    doc.save(`BoQ_RAB_${currentRab.namaProyek.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    triggerNotify('Dokumen BoQ & RAB resmi dengan Kop & Cover Surat berhasil diekspor ke PDF!');
  };

  return (
    <div className="space-y-5">
      {/* 1. TOP CONTROLLER BAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1B2B4C] to-blue-900 text-white flex items-center justify-center shrink-0 shadow-sm border border-[#D4AF37]/40">
              <FolderKanban className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  PROYEK RAB TERPILIH
                </span>
                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {rabProjects.length} Proyek
                </span>
              </div>
              
              <div className="relative mt-1">
                <select
                  value={activeRabId}
                  onChange={(e) => onSelectRab(e.target.value)}
                  className="w-full sm:w-80 md:w-96 font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#1B2B4C] cursor-pointer"
                >
                  {rabProjects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.namaProyek} ({p.klien})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setNewRabNama(`RAB Baru #${rabProjects.length + 1}`);
                setNewRabKlien('');
                setNewRabLokasi('Bandung');
                setNewRabProfit(10);
                setNewRabPpn(11);
                setShowNewRabModal(true);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-[#1B2B4C] to-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 text-[#D4AF37]" />
              <span>+ Buat RAB Baru</span>
            </button>
            <button
              onClick={() => {
                setEditRabNama(currentRab.namaProyek);
                setEditRabKlien(currentRab.klien);
                setEditRabLokasi(currentRab.lokasi);
                setEditRabProfit(currentRab.overheadProfitPercent ?? 10);
                setEditRabPpn(currentRab.ppnPercent ?? 11);
                setShowEditRabHeaderModal(true);
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-500" />
              <span>Edit Parameter</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUBTAB NAVIGATOR */}
      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setSubTab('boq-view')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              subTab === 'boq-view'
                ? 'bg-[#1B2B4C] text-white shadow-2xs dark:bg-blue-600'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>BoQ &amp; Rincian Pekerjaan ({(currentRab.items || []).length})</span>
          </button>
          <button
            onClick={() => setSubTab('tabel-ahsp')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              subTab === 'tabel-ahsp'
                ? 'bg-[#1B2B4C] text-white shadow-2xs dark:bg-blue-600'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Master AHSP Cipta Karya</span>
          </button>
          <button
            onClick={() => setSubTab('harga-dasar')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              subTab === 'harga-dasar'
                ? 'bg-[#1B2B4C] text-white shadow-2xs dark:bg-blue-600'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-emerald-500" />
            <span>Harga Dasar &amp; Tanya AI</span>
          </button>
        </div>
        <button
          onClick={onNavigateToKurvaS}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
        >
          <span>Sinkronkan ke Kurva S</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {notification && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-3 rounded-2xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* BOQ VIEW */}
      {subTab === 'boq-view' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Subtotal Fisik</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{formatRupiahDisplay(subtotal)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Jasa &amp; Profit ({currentRab.overheadProfitPercent}%)</span>
              <p className="text-xl font-bold text-amber-600 mt-1">{formatRupiahDisplay(overheadNominal)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">PPN ({currentRab.ppnPercent}%)</span>
              <p className="text-xl font-bold text-blue-600 mt-1">{formatRupiahDisplay(ppnNominal)}</p>
            </div>
            <div className="bg-gradient-to-br from-[#1B2B4C] to-blue-950 p-4 rounded-2xl border border-[#D4AF37]/30 text-white shadow-2xs">
              <span className="text-[11px] font-medium text-[#D4AF37] uppercase tracking-wider">Grand Total BoQ</span>
              <p className="text-xl font-extrabold text-[#D4AF37] mt-1">{formatRupiahDisplay(grandTotal)}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={handleOpenAddBoQ}
              className="px-3.5 py-2 bg-[#1B2B4C] dark:bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Item Pekerjaan ke BoQ</span>
            </button>
            <button
              onClick={handleExportBoQPDF}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF BoQ (Kop &amp; Cover Surat)</span>
            </button>
          </div>

          {/* BoQ Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1B2B4C] text-white">
                  <tr>
                    <th className="px-3 py-3 w-10 text-center font-semibold">No</th>
                    <th className="px-3 py-3 font-semibold">Uraian Pekerjaan &amp; Spesifikasi</th>
                    <th className="px-3 py-3 font-semibold">Kode AHSP</th>
                    <th className="px-3 py-3 text-right font-semibold">Volume</th>
                    <th className="px-3 py-3 text-center font-semibold">Sat</th>
                    <th className="px-3 py-3 text-right font-semibold">Harga Satuan (Rp)</th>
                    <th className="px-3 py-3 text-right font-semibold">Total (Rp)</th>
                    <th className="px-3 py-3 text-center font-semibold w-16">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {categoriesInBoq.map((cat, catIdx) => {
                    const itemsInCat = (currentRab.items || []).filter(it => it.kategori === cat);
                    return (
                      <React.Fragment key={cat}>
                        <tr className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white">
                          <td className="px-3 py-2 text-center text-[#D4AF37] font-mono">{catIdx + 1}</td>
                          <td colSpan={5} className="px-3 py-2 uppercase text-xs">{cat}</td>
                          <td className="px-3 py-2 text-right font-mono font-bold">
                            {formatRupiahDisplay(itemsInCat.reduce((acc, it) => acc + it.total, 0))}
                          </td>
                          <td className="px-3 py-2 text-center text-[10px] text-slate-400">
                            {itemsInCat.length} item
                          </td>
                        </tr>
                        {itemsInCat.map((item, itemIdx) => (
                          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition">
                            <td className="px-3 py-2 text-center text-slate-400 font-mono text-[11px]">{catIdx + 1}.{itemIdx + 1}</td>
                            <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">
                              <div>{item.uraian}</div>
                              {item.spesifikasiBahan && (
                                <span className="text-[10px] text-slate-400 block">{item.spesifikasiBahan}</span>
                              )}
                            </td>
                            <td className="px-3 py-2 font-mono text-[11px] text-blue-600 dark:text-blue-400">{item.kodeAHSP || '-'}</td>
                            <td className="px-3 py-2 text-right font-mono font-medium">{item.volume}</td>
                            <td className="px-3 py-2 text-center text-slate-500 text-[11px]">{item.satuan}</td>
                            <td className="px-3 py-2 text-right font-mono">{formatRupiahDisplay(item.hargaSatuan)}</td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-slate-900 dark:text-white">{formatRupiahDisplay(item.total)}</td>
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => {
                                  const remaining = (currentRab.items || []).filter(it => it.id !== item.id);
                                  onUpdateRAB({ ...currentRab, items: remaining });
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                  {(currentRab.items || []).length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                        <Calculator className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="font-semibold text-slate-600 dark:text-slate-300">Belum ada item pada BoQ ini</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Klik "+ Tambah Item Pekerjaan ke BoQ" untuk memasukkan uraian pekerjaan &amp; analisa harga satuan.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MASTER AHSP */}
      {subTab === 'tabel-ahsp' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ahspMasterList.map((ahsp) => (
              <div key={ahsp.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                      {ahsp.kode}
                    </span>
                    <span className="text-[10px] text-slate-400">{ahsp.kelompok}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{ahsp.namaPekerjaan}</h4>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-[#1B2B4C] dark:text-[#D4AF37]">
                    {formatRupiahDisplay(ahsp.totalHsp)} / {ahsp.satuan}
                  </span>
                  <button
                    onClick={() => {
                      const volStr = prompt(`Masukkan Volume (${ahsp.satuan}) untuk "${ahsp.namaPekerjaan}":`, '10');
                      if (!volStr) return;
                      const vol = parseFloat(volStr);
                      if (isNaN(vol) || vol <= 0) return;
                      const newItem: RABItem = {
                        id: `item-${Date.now()}`,
                        kategori: ahsp.kelompok,
                        uraian: ahsp.namaPekerjaan,
                        spesifikasiBahan: ahsp.bahanMaterial.map(b => b.nama).join(', ') || 'Mutu SNI',
                        tipeAHSP: 'AHSP SNI',
                        kodeAHSP: ahsp.kode,
                        volume: vol,
                        satuan: ahsp.satuan,
                        hargaSatuan: ahsp.totalHsp,
                        total: Math.round(vol * ahsp.totalHsp),
                      };
                      onUpdateRAB({
                        ...currentRab,
                        items: [...(currentRab.items || []), newItem],
                      });
                      triggerNotify(`Item "${ahsp.namaPekerjaan}" dimasukkan ke BoQ!`);
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Gunakan</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HARGA DASAR & ASISTEN AI */}
      {subTab === 'harga-dasar' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-900 via-[#1B2B4C] to-slate-950 p-5 rounded-3xl border border-[#D4AF37]/40 text-white shadow-md space-y-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="font-bold text-base text-white">Tanya AI Harga Material &amp; Toko Bangunan</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPriceQuestion}
                onChange={(e) => setAiPriceQuestion(e.target.value)}
                placeholder="Tanyakan harga semen, hebel, pasir, upah..."
                className="flex-1 bg-slate-800/90 border border-slate-700 text-white text-xs sm:text-sm rounded-xl px-4 py-2.5 outline-none"
              />
              <button
                onClick={async () => {
                  if (!aiPriceQuestion.trim()) return;
                  setIsAiPriceLoading(true);
                  try {
                    const res = await askAIMaterialPrice({ question: aiPriceQuestion });
                    setAiPriceResult(res);
                  } catch (e) {
                    alert('Gagal mengambil data AI.');
                  } finally {
                    setIsAiPriceLoading(false);
                  }
                }}
                disabled={isAiPriceLoading}
                className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#e6c887] text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isAiPriceLoading ? 'Mencari...' : 'Tanya AI'}</span>
              </button>
            </div>

            {aiPriceResult && (
              <div className="bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white p-4 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-sm text-[#1B2B4C] dark:text-white">{aiPriceResult.namaBarang}</h4>
                  <strong className="text-base font-mono text-emerald-600 font-bold">
                    {formatRupiahDisplay(aiPriceResult.rekomendasiHarga)} / {aiPriceResult.satuan}
                  </strong>
                </div>
                <p className="text-slate-600 dark:text-slate-300">{aiPriceResult.penjelasan}</p>
                <div className="text-[11px] text-slate-400">
                  Sumber: <b>{aiPriceResult.sumberReferensi}</b>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL TAMBAH BOQ */}
      {showAddBoQModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingBoQItem ? 'Edit Item Pekerjaan BoQ' : 'Tambah Item Pekerjaan ke BoQ'}
              </h3>
              <button onClick={() => setShowAddBoQModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3.5 flex-1 pr-1 text-xs">
              <div className="space-y-2 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-200/50">
                <input
                  type="text"
                  placeholder="Cari analisa (hebel, semen, kitchen set, granit, atap)..."
                  value={ahspKeyword}
                  onChange={(e) => setAhspKeyword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
                <div className="max-h-32 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
                  {searchedLookupAhsp.slice(0, 5).map(ah => (
                    <div
                      key={ah.id}
                      onClick={() => handleSelectAhspForBoQ(ah)}
                      className={`p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer flex items-center justify-between text-xs ${
                        boqKodeAHSP === ah.kode ? 'bg-blue-100/70 font-bold' : ''
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-mono text-blue-600 mr-1.5">{ah.kode}</span>
                        <span className="text-slate-800 dark:text-slate-200">{ah.namaPekerjaan}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">
                        {formatRupiahDisplay(ah.totalHsp)}/{ah.satuan}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Uraian Pekerjaan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={boqUraian}
                    onChange={(e) => setBoqUraian(e.target.value)}
                    placeholder="Contoh: Pasangan Dinding Bata Ringan Hebel 10cm"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Volume</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={boqVolume}
                    onChange={(e) => setBoqVolume(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Satuan</label>
                  <input
                    type="text"
                    value={boqSatuan}
                    onChange={(e) => setBoqSatuan(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Harga Satuan (Rp)</label>
                  <input
                    type="text"
                    value={formatRupiahInputValue(boqHargaSatuan)}
                    onChange={(e) => setBoqHargaSatuan(parseRupiahInput(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddBoQModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveBoQItem}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                {editingBoQItem ? 'Simpan Perubahan' : 'Masukkan ke BoQ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BUAT RAB BARU */}
      {showNewRabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Buat Paket RAB Baru</h3>
              <button onClick={() => setShowNewRabModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nama Proyek RAB</label>
                <input
                  type="text"
                  value={newRabNama}
                  onChange={(e) => setNewRabNama(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nama Klien</label>
                  <input
                    type="text"
                    value={newRabKlien}
                    onChange={(e) => setNewRabKlien(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Lokasi</label>
                  <input
                    type="text"
                    value={newRabLokasi}
                    onChange={(e) => setNewRabLokasi(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewRabModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateRabConfirm}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                Buat Paket RAB
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT PARAMETER */}
      {showEditRabHeaderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Edit Parameter Proyek RAB</h3>
              <button onClick={() => setShowEditRabHeaderModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nama Proyek</label>
                <input
                  type="text"
                  value={editRabNama}
                  onChange={(e) => setEditRabNama(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Profit (%)</label>
                  <input
                    type="number"
                    value={editRabProfit}
                    onChange={(e) => setEditRabProfit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">PPN (%)</label>
                  <input
                    type="number"
                    value={editRabPpn}
                    onChange={(e) => setEditRabPpn(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowEditRabHeaderModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEditHeader}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
