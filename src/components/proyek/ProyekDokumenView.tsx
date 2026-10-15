import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Search, 
  Download, 
  Send, 
  ExternalLink, 
  Eye, 
  Printer, 
  CheckCircle2, 
  FolderKanban, 
  Filter, 
  Calendar, 
  Building2,
  FileCheck2,
  MessageCircle,
  X
} from 'lucide-react';
import { ProjectDocument, Project, CompanyProfile, KopSuratTemplate, CoverSuratTemplate } from '../../types';
import { formatRupiahDisplay } from '../../utils/formatters';
import { MulakaEmblem } from '../common/MulakaLogo';
import { jsPDF } from 'jspdf';
import { renderPDFCover, renderPDFKopSurat } from '../../utils/pdfHelpers';

interface ProyekDokumenViewProps {
  documents: ProjectDocument[];
  projects: Project[];
  companyProfile: CompanyProfile;
  onAddDocument: (doc: ProjectDocument) => void;
  onDeleteDocument: (id: string) => void;
  kopTemplates: KopSuratTemplate[];
  coverTemplate: CoverSuratTemplate;
  onNavigateToQC?: () => void;
}

export const ProyekDokumenView: React.FC<ProyekDokumenViewProps> = ({
  documents,
  projects,
  companyProfile,
  onAddDocument,
  onDeleteDocument,
  onNavigateToQC,
  kopTemplates,
  coverTemplate,
}) => {
  const [search, setSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState<ProjectDocument | null>(null);

  // Form State
  const [formProyekId, setFormProyekId] = useState(projects[0]?.id || '');
  const [formJenis, setFormJenis] = useState<ProjectDocument['jenisDokumen']>('SPK');
  const [formNomor, setFormNomor] = useState(`DOC-MLK/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`);
  const [formTanggal, setFormTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [formNilaiKontrak, setFormNilaiKontrak] = useState<number>(0);
  const [formKonten, setFormKonten] = useState('');
  const [formDriveUrl, setFormDriveUrl] = useState('');

  const filteredDocs = documents.filter((doc) => {
    const matchSearch = 
      doc.nomorSurat.toLowerCase().includes(search.toLowerCase()) ||
      doc.namaProyek.toLowerCase().includes(search.toLowerCase()) ||
      doc.jenisDokumen.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedKategori === 'Semua' || doc.jenisDokumen === selectedKategori;
    return matchSearch && matchCat;
  });

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === formProyekId);
    const newDoc: ProjectDocument = {
      id: `doc-${Date.now()}`,
      proyekId: formProyekId,
      namaProyek: proj ? proj.nama_proyek : 'Proyek Umum Mulaka',
      jenisDokumen: formJenis,
      nomorSurat: formNomor,
      tanggal: formTanggal,
      nilaiKontrak: formNilaiKontrak,
      status: 'Diterbitkan',
      konten: formKonten,
      driveUrl: formDriveUrl,
    };
    onAddDocument(newDoc);
    setIsAddModalOpen(false);
    setFormKonten('');
    setFormNilaiKontrak(0);
  };

  const handleExportPDF = (docItem: ProjectDocument) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const proj = projects.find(p => p.id === docItem.proyekId);

    // 1. Cover Surat (auto-terintegrasi dengan background cover yang diunggah)
    if (coverTemplate && coverTemplate.enableCover) {
      renderPDFCover(doc, coverTemplate, companyProfile, {
        judulDokumen: `${docItem.jenisDokumen.toUpperCase()} - ${docItem.namaProyek}`,
        nomorDokumen: docItem.nomorSurat,
        namaProyek: docItem.namaProyek,
        namaKlien: proj?.nama_klien || 'Klien Rekanan Mulaka',
        tanggal: docItem.tanggal,
        disusunOleh: 'Manajemen Legalitas & Kontrak PT. Mulaka Cipta Nusantara',
      });
    }

    // 2. Kop Surat Resmi Mulaka
    const kop = kopTemplates.find(k => k.jenisDokumen === docItem.jenisDokumen) || kopTemplates[0];
    let y = renderPDFKopSurat(doc, kop, companyProfile);

    // Judul Dokumen
    doc.setTextColor(27, 43, 76);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(docItem.jenisDokumen.toUpperCase(), pageWidth / 2, y, { align: 'center' });
    y += 5;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Nomor Surat: ${docItem.nomorSurat}   |   Tanggal: ${docItem.tanggal}`, pageWidth / 2, y, { align: 'center' });
    y += 4;

    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.6);
    doc.line(15, y, pageWidth - 15, y);
    y += 8;

    // Rincian Berkas Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, y, pageWidth - 30, 26, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, y, pageWidth - 30, 26, 2, 2, 'D');

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Nama Proyek:', 20, y + 6);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(docItem.namaProyek, 50, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Klien / Pemilik:', 20, y + 13);
    doc.setTextColor(15, 23, 42);
    doc.text(proj?.nama_klien || '-', 50, y + 13);

    doc.setTextColor(100, 116, 139);
    doc.text('Nilai Nominal:', 20, y + 20);
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text(docItem.nilaiKontrak ? formatRupiahDisplay(docItem.nilaiKontrak) : 'Sesuai Lampiran / Nilai Kontrak', 50, y + 20);
    y += 33;

    // Klausul & Uraian Dokumen
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(27, 43, 76);
    doc.text('URAIAN & KETENTUAN PERJANJIAN / PEKERJAAN:', 15, y);
    y += 5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    const splitText = doc.splitTextToSize(
      docItem.konten || 'Dokumen ini diterbitkan secara sah oleh PT. Mulaka Cipta Nusantara sebagai bukti perjanjian dan pelaksanaan pekerjaan sesuai standar mutu dan etika profesional konstruksi.',
      pageWidth - 30
    );
    doc.text(splitText, 15, y);
    y += splitText.length * 4.2 + 15;

    // Signature Area
    if (y > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      y = 30;
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(27, 43, 76);
    doc.text('PIHAK PERTAMA', 25, y);
    doc.text('PIHAK KEDUA', pageWidth - 65, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('PT. MULAKA CIPTA NUSANTARA', 25, y);
    doc.text(proj?.nama_klien || 'KLIEN / VENDOR', pageWidth - 65, y);
    y += 18;

    doc.setFont('helvetica', 'bold');
    doc.text('( Direktur Utama )', 25, y);
    doc.text('( Pihak Klien / Mitra )', pageWidth - 65, y);

    doc.save(`${docItem.jenisDokumen}_${docItem.nomorSurat.replace(/[\/\\:]/g, '_')}.pdf`);
  };

  const handleSendWhatsApp = (doc: ProjectDocument) => {
    const text = `*PT. MULAKA CIPTA NUSANTARA*\n*ARSIP DOKUMEN RESMI PROYEK*\n----------------------------------------\nNo. Surat: ${doc.nomorSurat}\nJenis: ${doc.jenisDokumen}\nProyek: ${doc.namaProyek}\nTanggal: ${doc.tanggal}\nStatus: ${doc.status}\n${doc.nilaiKontrak ? `Nilai: ${formatRupiahDisplay(doc.nilaiKontrak)}\n` : ''}${doc.driveUrl ? `Tautan Dokumen: ${doc.driveUrl}\n` : ''}\nDokumen resmi tersimpan aman dalam sistem Mulaka ERP.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <MulakaEmblem variant="gold" size={36} />
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="w-6 h-6 text-amber-500" />
              Arsip Dokumen & Kontrak Proyek
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Penerbitan & Penyimpanan PKS, SPK, BAST, Laporan, dan Surat Perjanjian Resmi Terintegrasi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onNavigateToQC && (
            <button
              onClick={onNavigateToQC}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              Ke Menu Mutual Check & QC
            </button>
          )}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Terbitkan Dokumen Baru
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor surat, jenis, atau proyek..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          {['Semua', 'SPK', 'PKS', 'BAST', 'Invoice', 'Slip Gaji', 'Form Onboarding'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedKategori(cat)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedKategori === cat
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid / Table */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Belum Ada Dokumen</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Gunakan tombol "Terbitkan Dokumen Baru" untuk membuat surat perjanjian, SPK, atau arsip proyek baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {doc.jenisDokumen}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {doc.tanggal}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">
                  {doc.nomorSurat}
                </h3>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  {doc.namaProyek}
                </p>

                {doc.nilaiKontrak ? (
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                    Nilai: {formatRupiahDisplay(doc.nilaiKontrak)}
                  </p>
                ) : null}

                {doc.konten && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    {doc.konten}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleExportPDF(doc)}
                    className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                    title="Unduh PDF Resmi dengan Cover"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewDoc(doc)}
                    className="p-1.5 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Lihat Detail"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSendWhatsApp(doc)}
                    className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                    title="Kirim ke WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  {doc.driveUrl && (
                    <a
                      href={doc.driveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                      title="Buka Drive"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Hapus dokumen ${doc.nomorSurat}?`)) {
                      onDeleteDocument(doc.id);
                    }
                  }}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  title="Hapus Dokumen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Terbitkan Dokumen Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <MulakaEmblem variant="gold" size={28} />
                <h3 className="font-bold text-slate-900 dark:text-white">Terbitkan Dokumen Proyek Baru</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDoc} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Proyek Terkait
                  </label>
                  <select
                    value={formProyekId}
                    onChange={(e) => setFormProyekId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.nama_proyek}</option>
                    ))}
                    {projects.length === 0 && <option value="">Proyek Umum Mulaka</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jenis Dokumen
                  </label>
                  <select
                    value={formJenis}
                    onChange={(e) => setFormJenis(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="SPK">Surat Perintah Kerja (SPK)</option>
                    <option value="PKS">Perjanjian Kerja Sama (PKS)</option>
                    <option value="BAST">Berita Acara Serah Terima (BAST)</option>
                    <option value="Invoice">Invoice Tagihan Proyek</option>
                    <option value="Berita Acara">Berita Acara Lapangan</option>
                    <option value="Mutual Check (MC)">Mutual Check (MC 0 / MC 100)</option>
                    <option value="Quality Control (QC)">Quality Control (QC Checklist)</option>
                    <option value="Laporan Manajemen">Laporan Manajemen</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor Surat
                  </label>
                  <input
                    type="text"
                    required
                    value={formNomor}
                    onChange={(e) => setFormNomor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nilai Nominal (Opsional)
                  </label>
                  <input
                    type="number"
                    value={formNilaiKontrak}
                    onChange={(e) => setFormNilaiKontrak(Number(e.target.value))}
                    placeholder="Rp 0"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Isi / Uraian Perjanjian
                </label>
                <textarea
                  rows={4}
                  value={formKonten}
                  onChange={(e) => setFormKonten(e.target.value)}
                  placeholder="Ketik rincian klausul, lingkup pekerjaan, atau catatan perjanjian di sini..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Google Drive / URL Lampiran
                </label>
                <input
                  type="url"
                  value={formDriveUrl}
                  onChange={(e) => setFormDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm"
                >
                  Simpan & Terbitkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal View Detail Dokumen */}
      {viewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MulakaEmblem variant="gold" size={28} />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{viewDoc.nomorSurat}</h3>
                  <p className="text-xs text-slate-500">{viewDoc.jenisDokumen} - {viewDoc.namaProyek}</p>
                </div>
              </div>
              <button
                onClick={() => setViewDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-400">Tanggal:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{viewDoc.tanggal}</p>
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">{viewDoc.status}</p>
                </div>
                {viewDoc.nilaiKontrak ? (
                  <div>
                    <span className="text-slate-400">Nilai Kontrak:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{formatRupiahDisplay(viewDoc.nilaiKontrak)}</p>
                  </div>
                ) : null}
              </div>

              {viewDoc.konten && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Uraian & Klausul
                  </h4>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-200 dark:border-slate-700">
                    {viewDoc.konten}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportPDF(viewDoc)}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl flex items-center gap-2 shadow-sm transition"
                >
                  <Download className="w-4 h-4" />
                  Unduh PDF (Cover &amp; Kop)
                </button>
                <button
                  onClick={() => handleSendWhatsApp(viewDoc)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  Kirim via WhatsApp
                </button>
              </div>
              <button
                onClick={() => setViewDoc(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
