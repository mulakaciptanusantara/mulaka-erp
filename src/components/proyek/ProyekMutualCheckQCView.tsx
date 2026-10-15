import React, { useState, useMemo } from 'react';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Download, 
  Trash2, 
  Sliders, 
  Check, 
  X 
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { 
  MutualCheckRecord, 
  QCInspectionItem, 
  QCTemplateItem, 
  Project, 
  CompanyProfile, 
  KopSuratTemplate, 
  CoverSuratTemplate, 
  QCItemStatus 
} from '../../types';
import { initialQCTemplates } from '../../data/mockData';
import { renderPDFCover, renderPDFKopSurat } from '../../utils/pdfHelpers';

interface ProyekMutualCheckQCViewProps {
  projects: Project[];
  records: MutualCheckRecord[];
  onAddRecord: (record: MutualCheckRecord) => void;
  onUpdateRecord: (record: MutualCheckRecord) => void;
  onDeleteRecord: (id: string) => void;
  qcTemplates: QCTemplateItem[];
  onUpdateQcTemplates: (templates: QCTemplateItem[]) => void;
  onNavigateToDokumen: () => void;
  companyProfile: CompanyProfile;
  kopTemplates: KopSuratTemplate[];
  coverTemplate: CoverSuratTemplate;
}

export const ProyekMutualCheckQCView: React.FC<ProyekMutualCheckQCViewProps> = ({
  projects,
  records,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  qcTemplates = initialQCTemplates,
  onUpdateQcTemplates,
  onNavigateToDokumen,
  companyProfile,
  kopTemplates,
  coverTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'daftar-mc' | 'template-editor'>('daftar-mc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Record Form State
  const [formProyekId, setFormProyekId] = useState<string>(projects[0]?.id || '');
  const [formTipe, setFormTipe] = useState<MutualCheckRecord['tipe']>('MC-100 (Akhir / Sebelum BAST)');
  const [formNomor, setFormNomor] = useState(`MC-MLK/${new Date().getFullYear()}/001`);
  const [formTanggal, setFormTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [formPengawas, setFormPengawas] = useState('Budi Santoso, S.T. (PM Site)');
  const [formKlien, setFormKlien] = useState('');
  const [formCatatan, setFormCatatan] = useState('Pemeriksaan fisik bersama sebelum penandatanganan BAST.');
  const [formItems, setFormItems] = useState<QCInspectionItem[]>([]);

  const triggerNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleOpenAddModal = () => {
    const proj = projects.find(p => p.id === formProyekId) || projects[0];
    const initialItems: QCInspectionItem[] = qcTemplates.map(tpl => ({
      id: `qci-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      kategori: tpl.kategori,
      uraianPemeriksaan: tpl.uraianPemeriksaan,
      standarToleransi: tpl.standarToleransi,
      status: 'Passed',
      catatanTemuan: 'Sesuai spesifikasi & toleransi',
    }));
    setFormNomor(`MC-MLK/${new Date().getFullYear()}/${String(records.length + 1).padStart(3, '0')}`);
    setFormKlien(proj?.nama_klien || 'Pemilik Proyek');
    setFormItems(initialItems);
    setShowAddModal(true);
  };

  const handleItemStatusChange = (index: number, newStatus: QCItemStatus) => {
    const updated = [...formItems];
    updated[index].status = newStatus;
    if (newStatus === 'Minor Defect') {
      updated[index].catatanTemuan = 'Perlu perbaikan kosmetik / finishing ringan';
    } else if (newStatus === 'Major Defect') {
      updated[index].catatanTemuan = 'Wajib dibongkar / diperbaiki sebelum BAST';
    } else if (newStatus === 'Passed') {
      updated[index].catatanTemuan = 'Memenuhi standar toleransi mutu';
    }
    setFormItems(updated);
  };

  const calculateScore = (items: QCInspectionItem[]) => {
    if (items.length === 0) return 100;
    const passedCount = items.filter(i => i.status === 'Passed').length;
    const minorCount = items.filter(i => i.status === 'Minor Defect').length;
    return Math.round(((passedCount * 1 + minorCount * 0.7) / items.length) * 100);
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === formProyekId) || projects[0];
    const score = calculateScore(formItems);
    const hasMajor = formItems.some(i => i.status === 'Major Defect');
    const statusKelayakan: MutualCheckRecord['statusKelayakan'] = 
      hasMajor ? 'Perbaikan Wajib (Punchlist)' : score >= 85 ? 'Layak BAST' : 'Perbaikan Wajib (Punchlist)';

    const newRec: MutualCheckRecord = {
      id: `mc-${Date.now()}`,
      tipe: formTipe,
      proyekId: proj?.id || 'proj-general',
      namaProyek: proj?.nama_proyek || 'Proyek Umum',
      namaKlien: formKlien || proj?.nama_klien || 'Klien',
      nomorDokumen: formNomor,
      tanggalPemeriksaan: formTanggal,
      pengawasPM: formPengawas,
      perwakilanKlien: formKlien,
      skorKelayakan: score,
      statusKelayakan,
      items: formItems,
      catatanUmum: formCatatan,
    };

    onAddRecord(newRec);
    setShowAddModal(false);
    triggerNotify(`Dokumen ${formTipe} (${formNomor}) berhasil disimpan dengan skor ${score}%!`);
  };

  const handleExportPDF = (rec: MutualCheckRecord) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    if (coverTemplate && coverTemplate.enableCover) {
      renderPDFCover(doc, coverTemplate, companyProfile, {
        judulDokumen: `BERITA ACARA ${rec.tipe.toUpperCase()}`,
        nomorDokumen: rec.nomorDokumen,
        namaProyek: rec.namaProyek,
        namaKlien: rec.namaKlien,
        tanggal: rec.tanggalPemeriksaan,
        disusunOleh: 'Divisi Quality Control & Pengawasan PT. Mulaka Cipta Nusantara',
      });
    }

    const kop = kopTemplates.find(k => k.jenisDokumen === 'Mutual Check' || k.jenisDokumen === 'Quality Control') || kopTemplates[0];
    let y = renderPDFKopSurat(doc, kop, companyProfile);

    doc.setTextColor(27, 43, 76);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`BERITA ACARA PEMERIKSAAN MUTUAL CHECK & QUALITY CONTROL`, pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Tahapan: ${rec.tipe}  |  Nomor: ${rec.nomorDokumen}  |  Tanggal: ${rec.tanggalPemeriksaan}`, pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.6);
    doc.line(14, y, pageWidth - 14, y);
    y += 7;

    doc.save(`${rec.nomorDokumen.replace(/[^a-zA-Z0-9]/g, '_')}_QC_BAST.pdf`);
    triggerNotify('Dokumen Berita Acara Mutual Check & QC berhasil diekspor ke PDF!');
  };

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-base md:text-lg font-bold text-[#1B2B4C] dark:text-white">
              Mutual Check (MC-0 &amp; MC-100) &bull; Quality Control Sebelum BAST
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Inspeksi fisik kualitas konstruksi &amp; furniture Mulaka Livin sebelum Serah Terima Pertama (BAST).
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>+ Buat Mutual Check / QC Baru</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Grid MC */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {records.map((rec) => (
          <div
            key={rec.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-bold">
                  {rec.tipe}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{rec.tanggalPemeriksaan}</span>
              </div>
              <h4 className="font-bold text-sm text-[#1B2B4C] dark:text-white line-clamp-1">{rec.nomorDokumen}</h4>
              <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold">{rec.namaProyek}</p>
              <p className="text-[11px] text-slate-500">Klien: <b>{rec.namaKlien}</b></p>
              <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-500">Skor Kelayakan:</span>
                  <strong className="text-sm font-mono text-emerald-700 dark:text-emerald-400 font-extrabold">{rec.skorKelayakan}%</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-500">Status Kelayakan:</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    rec.statusKelayakan === 'Layak BAST'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {rec.statusKelayakan}
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => handleExportPDF(rec)}
                className="px-3 py-1.5 bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-slate-800 text-white rounded-xl text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Hapus dokumen Mutual Check ${rec.nomorDokumen}?`)) {
                    onDeleteRecord(rec.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL INPUT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-base text-[#1B2B4C] dark:text-white">
                  Formulir Pemeriksaan Mutual Check &amp; QC Pre-BAST
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 text-lg cursor-pointer">
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tahapan Pemeriksaan
                  </label>
                  <select
                    value={formTipe}
                    onChange={(e) => setFormTipe(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                  >
                    <option value="MC-100 (Akhir / Sebelum BAST)">MC-100 (Akhir / Sebelum BAST)</option>
                    <option value="MC-0 (Awal Proyek)">MC-0 (Awal Proyek / Mutual Check 0%)</option>
                    <option value="MC-50 (Pertengahan)">MC-50 (Pertengahan / Struktur Selesai)</option>
                    <option value="QC Berkala">QC Berkala Mingguan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Pilih Proyek
                  </label>
                  <select
                    value={formProyekId}
                    onChange={(e) => {
                      setFormProyekId(e.target.value);
                      const p = projects.find(pr => pr.id === e.target.value);
                      if (p) setFormKlien(p.nama_klien);
                    }}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.nama_proyek} ({p.nama_klien})</option>
                    ))}
                    {projects.length === 0 && <option value="">(Belum ada proyek)</option>}
                  </select>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {formItems.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <strong className="text-slate-800 dark:text-white text-xs">{item.uraianPemeriksaan}</strong>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleItemStatusChange(idx, 'Passed')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'Passed' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                        >
                          Passed
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemStatusChange(idx, 'Minor Defect')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'Minor Defect' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'}`}
                        >
                          Minor
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemStatusChange(idx, 'Major Defect')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'Major Defect' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                        >
                          Major
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
                  className="px-5 py-2 bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-blue-600 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Simpan Berita Acara Mutual Check
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
