import React, { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  Download, 
  Send, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Search, 
  Edit3, 
  FileText, 
  CreditCard, 
  ShieldCheck, 
  ExternalLink,
  MessageCircle,
  X,
  AlertCircle
} from 'lucide-react';
import { User, CompanyProfile, KopSuratTemplate, CoverSuratTemplate, GajiDetail } from '../../types';
import { formatRupiahDisplay } from '../../utils/formatters';
import { MulakaEmblem } from '../common/MulakaLogo';
import { jsPDF } from 'jspdf';
import { renderPDFCover, renderPDFKopSurat } from '../../utils/pdfHelpers';

interface ProyekPenggajianViewProps {
  users: User[];
  onUpdateUser: (updated: User) => void;
  currentUser: User;
  companyProfile: CompanyProfile;
  kopTemplates: KopSuratTemplate[];
  coverTemplate: CoverSuratTemplate;
  onPostSalaryCashflow?: (catatan: string, nominal: number) => void;
}

export const ProyekPenggajianView: React.FC<ProyekPenggajianViewProps> = ({
  users,
  onUpdateUser,
  currentUser,
  companyProfile,
  onPostSalaryCashflow,
  kopTemplates,
  coverTemplate,
}) => {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditSalaryOpen, setIsEditSalaryOpen] = useState(false);
  const [activeSlipUser, setActiveSlipUser] = useState<User | null>(null);

  // Edit salary form
  const [gajiPokok, setGajiPokok] = useState<number>(0);
  const [tunjanganJabatan, setTunjanganJabatan] = useState<number>(0);
  const [tunjanganTransport, setTunjanganTransport] = useState<number>(0);
  const [lemburJam, setLemburJam] = useState<number>(0);
  const [lemburTarif, setLemburTarif] = useState<number>(0);
  const [bonusInsentif, setBonusInsentif] = useState<number>(0);
  const [pinjamanCicilan, setPinjamanCicilan] = useState<number>(0);
  const [potonganAbsensi, setPotonganAbsensi] = useState<number>(0);
  const [potonganBpjsTK, setPotonganBpjsTK] = useState<number>(0);
  const [potonganBpjsKes, setPotonganBpjsKes] = useState<number>(0);
  const [potonganPPh, setPotonganPPh] = useState<number>(0);

  const filteredUsers = users.filter((u) => {
    return (
      u.nama.toLowerCase().includes(search.toLowerCase()) ||
      u.jabatan.toLowerCase().includes(search.toLowerCase()) ||
      u.divisi.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleOpenEdit = (u: User) => {
    setSelectedUser(u);
    const g = u.gaji;
    if (g) {
      setGajiPokok(g.gajiPokok || 0);
      setTunjanganJabatan(g.tunjanganJabatan || 0);
      setTunjanganTransport(g.tunjanganTransportMakan || 0);
      setLemburJam(g.lemburJam || 0);
      setLemburTarif(g.lemburTarifPerJam || 0);
      setBonusInsentif(g.bonusInsentif || 0);
      setPinjamanCicilan(g.pinjamanCicilan || 0);
      setPotonganAbsensi(g.potonganAbsensi || 0);
      setPotonganBpjsTK(g.potonganBpjsKetenagakerjaan || 0);
      setPotonganBpjsKes(g.potonganBpjsKesehatan || 0);
      setPotonganPPh(g.potonganLainPPh || 0);
    } else {
      setGajiPokok(5000000);
      setTunjanganJabatan(1000000);
      setTunjanganTransport(500000);
      setLemburJam(0);
      setLemburTarif(50000);
      setBonusInsentif(0);
      setPinjamanCicilan(0);
      setPotonganAbsensi(0);
      setPotonganBpjsTK(100000);
      setPotonganBpjsKes(50000);
      setPotonganPPh(0);
    }
    setIsEditSalaryOpen(true);
  };

  const handleSaveSalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const lemburNominal = lemburJam * lemburTarif;
    const totalGajiKotor = gajiPokok + tunjanganJabatan + tunjanganTransport + lemburNominal + bonusInsentif;
    const totalPotongan = pinjamanCicilan + potonganAbsensi + potonganBpjsTK + potonganBpjsKes + potonganPPh;
    const totalGajiBersih = Math.max(0, totalGajiKotor - totalPotongan);

    const updatedSalary: GajiDetail = {
      gajiPokok,
      tunjanganJabatan,
      tunjanganTransportMakan: tunjanganTransport,
      lemburJam,
      lemburTarifPerJam: lemburTarif,
      lemburNominal,
      bonusInsentif,
      pinjamanCicilan,
      pinjamanTotalSisa: selectedUser.gaji?.pinjamanTotalSisa || 0,
      potonganAbsensi,
      potonganHariAbsen: selectedUser.gaji?.potonganHariAbsen || 0,
      potonganLainDenda: 0,
      potonganBpjsKetenagakerjaan: potonganBpjsTK,
      potonganBpjsKesehatan: potonganBpjsKes,
      potonganLainPPh: potonganPPh,
      totalGajiKotor,
      totalPotongan,
      totalGajiBersih,
      periode: selectedUser.gaji?.periode || 'Oktober 2026',
      statusGaji: selectedUser.gaji?.statusGaji || 'Belum Dicairkan',
      noSlipGaji: selectedUser.gaji?.noSlipGaji || `SLIP-MLK/2026/${Math.floor(100 + Math.random() * 900)}`,
    };

    onUpdateUser({
      ...selectedUser,
      gaji: updatedSalary,
    });
    setIsEditSalaryOpen(false);
  };

  const handleCairkanGaji = (u: User) => {
    if (!u.gaji) return;
    if (confirm(`Cairkan gaji untuk ${u.nama} sejumlah ${formatRupiahDisplay(u.gaji.totalGajiBersih)}? Data otomatis tercatat ke cashflow operasional.`)) {
      const updatedUser: User = {
        ...u,
        gaji: {
          ...u.gaji,
          statusGaji: 'Sudah Ditransfer',
          tanggalPencairan: new Date().toISOString().split('T')[0],
        },
      };
      onUpdateUser(updatedUser);
      if (onPostSalaryCashflow) {
        onPostSalaryCashflow(`Pembayaran Gaji Karyawan: ${u.nama} (${u.jabatan}) Periode ${u.gaji.periode}`, u.gaji.totalGajiBersih);
      }
    }
  };

  const handleExportPDFSalary = (u: User) => {
    if (!u.gaji) return;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Cover Surat (auto-terintegrasi & uses custom uploaded cover background if provided)
    if (coverTemplate && coverTemplate.enableCover) {
      renderPDFCover(doc, coverTemplate, companyProfile, {
        judulDokumen: `SLIP GAJI KARYAWAN RESMI & BUKTI KOMPENSASI - ${u.gaji.periode}`,
        nomorDokumen: u.gaji.noSlipGaji || `SLIP-MLK/${u.id}`,
        namaProyek: `Payroll Human Capital & SDM`,
        namaKlien: u.nama,
        tanggal: u.gaji.tanggalPencairan || new Date().toISOString().split('T')[0],
        disusunOleh: 'Finance & Payroll Department PT. Mulaka Cipta Nusantara',
      });
    }

    // 2. Kop Surat Slip Gaji
    const kop = kopTemplates.find(k => k.jenisDokumen === 'Slip Gaji') || kopTemplates[0];
    let y = renderPDFKopSurat(doc, kop, companyProfile);

    doc.setTextColor(27, 43, 76);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('SLIP GAJI KARYAWAN (CONFIDENTIAL)', pageWidth / 2, y, { align: 'center' });
    y += 5;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`No. Slip: ${u.gaji.noSlipGaji || '-'}  |  Periode: ${u.gaji.periode}  |  Status: ${u.gaji.statusGaji}`, pageWidth / 2, y, { align: 'center' });
    y += 4;

    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.6);
    doc.line(15, y, pageWidth - 15, y);
    y += 8;

    // Info Karyawan Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, y, pageWidth - 30, 24, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, y, pageWidth - 30, 24, 2, 2, 'D');

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Nama Karyawan:', 20, y + 6);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(u.nama, 50, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Jabatan / Divisi:', 20, y + 12);
    doc.setTextColor(15, 23, 42);
    doc.text(`${u.jabatan} - ${u.divisi}`, 50, y + 12);

    doc.setTextColor(100, 116, 139);
    doc.text('Rekening Bank:', 20, y + 18);
    doc.setTextColor(15, 23, 42);
    doc.text(`${u.namaBank || 'BCA'} ${u.nomorRekeningBank || '-'} (a.n ${u.nama})`, 50, y + 18);
    y += 30;

    // Tabel Rincian Penghasilan & Potongan
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(27, 43, 76);
    doc.text('I. PENGHASILAN (INCOME)', 15, y);
    doc.text('II. POTONGAN (DEDUCTION)', pageWidth / 2 + 5, y);
    y += 5;

    // Income Left Column
    let leftY = y;
    const addIncomeRow = (label: string, val: number) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(label, 15, leftY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(formatRupiahDisplay(val), pageWidth / 2 - 10, leftY, { align: 'right' });
      leftY += 5;
    };

    addIncomeRow('Gaji Pokok', u.gaji.gajiPokok);
    addIncomeRow('Tunjangan Jabatan', u.gaji.tunjanganJabatan);
    addIncomeRow('Uang Makan & Transport', u.gaji.tunjanganTransportMakan);
    if (u.gaji.lemburNominal > 0) addIncomeRow(`Uang Lembur (${u.gaji.lemburJam} Jam)`, u.gaji.lemburNominal);
    if (u.gaji.bonusInsentif > 0) addIncomeRow('Bonus & Insentif Proyek', u.gaji.bonusInsentif);

    // Deduction Right Column
    let rightY = y;
    const addDeductRow = (label: string, val: number) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(label, pageWidth / 2 + 5, rightY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(239, 68, 68);
      doc.text(`-${formatRupiahDisplay(val)}`, pageWidth - 15, rightY, { align: 'right' });
      rightY += 5;
    };

    addDeductRow('BPJS Ketenagakerjaan', u.gaji.potonganBpjsKetenagakerjaan);
    addDeductRow('BPJS Kesehatan', u.gaji.potonganBpjsKesehatan);
    if (u.gaji.pinjamanCicilan > 0) addDeductRow('Cicilan Pinjaman / Kasbon', u.gaji.pinjamanCicilan);
    if (u.gaji.potonganAbsensi > 0) addDeductRow('Potongan Absensi', u.gaji.potonganAbsensi);
    if (u.gaji.potonganLainPPh > 0) addDeductRow('Potongan PPh / Lain', u.gaji.potonganLainPPh);

    y = Math.max(leftY, rightY) + 5;

    // Subtotal Box
    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, pageWidth / 2 - 25, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Total Kotor:', 18, y + 5.5);
    doc.text(formatRupiahDisplay(u.gaji.totalGajiKotor), pageWidth / 2 - 12, y + 5.5, { align: 'right' });

    doc.setFillColor(254, 242, 242);
    doc.rect(pageWidth / 2 + 5, y, pageWidth / 2 - 20, 8, 'F');
    doc.setTextColor(220, 38, 38);
    doc.text('Total Potongan:', pageWidth / 2 + 8, y + 5.5);
    doc.text(`-${formatRupiahDisplay(u.gaji.totalPotongan)}`, pageWidth - 17, y + 5.5, { align: 'right' });
    y += 14;

    // Take Home Pay Big Box
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(15, y, pageWidth - 30, 14, 2, 2, 'F');
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.8);
    doc.roundedRect(15, y, pageWidth - 30, 14, 2, 2, 'D');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text('TAKE HOME PAY (GAJI BERSIH DITERIMA):', 20, y + 9);
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(formatRupiahDisplay(u.gaji.totalGajiBersih), pageWidth - 20, y + 9.5, { align: 'right' });
    y += 24;

    // Signatures
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(27, 43, 76);
    doc.text('Disetujui & Dibayarkan Oleh,', 25, y);
    doc.text('Diterima Oleh Karyawan,', pageWidth - 65, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('Human Capital & Finance Dept.', 25, y);
    doc.text(u.divisi, pageWidth - 65, y);
    y += 18;

    doc.setFont('helvetica', 'bold');
    doc.text('( Bagian Keuangan Mulaka )', 25, y);
    doc.text(`( ${u.nama} )`, pageWidth - 65, y);

    doc.save(`Slip_Gaji_${u.nama.replace(/\s+/g, '_')}_${u.gaji.periode.replace(/\s+/g, '_')}.pdf`);
  };

  const handleSendWhatsAppSlip = (u: User) => {
    if (!u.gaji) return;
    const text = `*PT. MULAKA CIPTA NUSANTARA*\n*SLIP GAJI KARYAWAN RESMI*\n----------------------------------------\nNo. Slip: ${u.gaji.noSlipGaji || '-'}\nPeriode: ${u.gaji.periode}\nNama: *${u.nama}*\nJabatan: ${u.jabatan} (${u.divisi})\nStatus: ${u.gaji.statusGaji}\n\n*RINCIAN PENDAPATAN:*\n- Gaji Pokok: ${formatRupiahDisplay(u.gaji.gajiPokok)}\n- Tunjangan Jabatan: ${formatRupiahDisplay(u.gaji.tunjanganJabatan)}\n- Tunjangan Makan & Transport: ${formatRupiahDisplay(u.gaji.tunjanganTransportMakan)}\n- Lembur (${u.gaji.lemburJam || 0} Jam): ${formatRupiahDisplay(u.gaji.lemburNominal)}\n- Bonus Insentif: ${formatRupiahDisplay(u.gaji.bonusInsentif)}\n*Total Gaji Kotor: ${formatRupiahDisplay(u.gaji.totalGajiKotor)}*\n\n*POTONGAN:*\n- BPJS Ketenagakerjaan: ${formatRupiahDisplay(u.gaji.potonganBpjsKetenagakerjaan)}\n- BPJS Kesehatan: ${formatRupiahDisplay(u.gaji.potonganBpjsKesehatan)}\n- Cicilan Pinjaman / Kasbon: ${formatRupiahDisplay(u.gaji.pinjamanCicilan)}\n- PPh & Lainnya: ${formatRupiahDisplay(u.gaji.potonganLainPPh)}\n*Total Potongan: ${formatRupiahDisplay(u.gaji.totalPotongan)}*\n----------------------------------------\n*TOTAL GAJI BERSIH (TAKE HOME PAY):*\n*${formatRupiahDisplay(u.gaji.totalGajiBersih)}*\n\nRekening Tujuan:\n${u.namaBank || 'BCA'} - ${u.nomorRekeningBank || '-'} (a.n ${u.nama})\n\n_Terima kasih atas dedikasi dan profesionalitas Anda dalam membangun karya terbaik Mulaka._`;

    const cleanPhone = u.telepon.replace(/\D/g, '');
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <MulakaEmblem variant="gold" size={36} />
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-500" />
              Payroll & Penggajian Karyawan Mulaka
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manajemen Kompensasi, Lembur, Potongan BPJS/PPh, Slip Gaji Resmi, dan Integrasi P&L Otomatis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
            Periode: Oktober 2026
          </span>
        </div>
      </div>

      {/* Search and Summary */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari karyawan, jabatan, divisi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Total Karyawan Aktif: <span className="font-bold text-slate-800 dark:text-white">{filteredUsers.length} Orang</span>
        </div>
      </div>

      {/* Table of Employees */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Karyawan</th>
                <th className="py-3.5 px-4">Jabatan & Divisi</th>
                <th className="py-3.5 px-4 text-right">Gaji Pokok</th>
                <th className="py-3.5 px-4 text-right">Tunjangan & Bonus</th>
                <th className="py-3.5 px-4 text-right">Potongan (BPJS/Pinjaman)</th>
                <th className="py-3.5 px-4 text-right">Take Home Pay</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi & Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u) => {
                const g = u.gaji;
                const totalTunjangan = (g?.tunjanganJabatan || 0) + (g?.tunjanganTransportMakan || 0) + (g?.bonusInsentif || 0) + (g?.lemburNominal || 0);
                const isPaid = g?.statusGaji === 'Sudah Ditransfer';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {u.foto ? (
                          <img src={u.foto} alt={u.nama} className="w-8 h-8 rounded-full object-cover border border-amber-500/30" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                            {u.nama.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{u.nama}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{u.nomorRekeningBank ? `${u.namaBank} ${u.nomorRekeningBank}` : 'Belum isi rekening'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{u.jabatan}</p>
                      <p className="text-[11px] text-slate-400">{u.divisi}</p>
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                      {formatRupiahDisplay(g?.gajiPokok || 0)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium text-emerald-600 dark:text-emerald-400">
                      +{formatRupiahDisplay(totalTunjangan)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium text-rose-500">
                      -{formatRupiahDisplay(g?.totalPotongan || 0)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatRupiahDisplay(g?.totalGajiBersih || 0)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                        isPaid
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {g?.statusGaji || 'Belum Dicairkan'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Rincian Gaji"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleExportPDFSalary(u)}
                          className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                          title="Unduh PDF Slip Gaji (Cover &amp; Kop)"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setActiveSlipUser(u)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Lihat Slip Gaji"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleSendWhatsAppSlip(u)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                          title="Kirim Notifikasi Slip WA"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>

                        {!isPaid && (
                          <button
                            onClick={() => handleCairkanGaji(u)}
                            className="px-2 py-1 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-sm transition-colors"
                            title="Cairkan & Posting ke Cashflow"
                          >
                            Cairkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Gaji */}
      {isEditSalaryOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Atur Kompensasi & Gaji</h3>
                <p className="text-xs text-slate-500">{selectedUser.nama} ({selectedUser.jabatan})</p>
              </div>
              <button onClick={() => setIsEditSalaryOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSalary} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                1. Komponen Pendapatan
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Gaji Pokok
                  </label>
                  <input
                    type="number"
                    value={gajiPokok}
                    onChange={(e) => setGajiPokok(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tunjangan Jabatan
                  </label>
                  <input
                    type="number"
                    value={tunjanganJabatan}
                    onChange={(e) => setTunjanganJabatan(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Uang Makan/Transport
                  </label>
                  <input
                    type="number"
                    value={tunjanganTransport}
                    onChange={(e) => setTunjanganTransport(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lembur (Jam)
                  </label>
                  <input
                    type="number"
                    value={lemburJam}
                    onChange={(e) => setLemburJam(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tarif Lembur / Jam
                  </label>
                  <input
                    type="number"
                    value={lemburTarif}
                    onChange={(e) => setLemburTarif(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bonus / Insentif Project
                </label>
                <input
                  type="number"
                  value={bonusInsentif}
                  onChange={(e) => setBonusInsentif(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pt-2 border-t border-slate-100 dark:border-slate-800">
                2. Komponen Potongan
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    BPJS Ketenagakerjaan
                  </label>
                  <input
                    type="number"
                    value={potonganBpjsTK}
                    onChange={(e) => setPotonganBpjsTK(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    BPJS Kesehatan
                  </label>
                  <input
                    type="number"
                    value={potonganBpjsKes}
                    onChange={(e) => setPotonganBpjsKes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Potongan Pinjaman / Kasbon
                  </label>
                  <input
                    type="number"
                    value={pinjamanCicilan}
                    onChange={(e) => setPinjamanCicilan(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Potongan Absensi
                  </label>
                  <input
                    type="number"
                    value={potonganAbsensi}
                    onChange={(e) => setPotonganAbsensi(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Potongan PPh / Lain
                  </label>
                  <input
                    type="number"
                    value={potonganPPh}
                    onChange={(e) => setPotonganPPh(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditSalaryOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Preview Slip Gaji */}
      {activeSlipUser && activeSlipUser.gaji && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MulakaEmblem variant="gold" size={28} />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Slip Gaji Karyawan Resmi</h3>
                  <p className="text-xs text-slate-500">{activeSlipUser.gaji.noSlipGaji || 'SLIP-MLK/2026'}</p>
                </div>
              </div>
              <button onClick={() => setActiveSlipUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                <div>
                  <p className="text-slate-400">Nama Karyawan:</p>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{activeSlipUser.nama}</p>
                  <p className="text-slate-500">{activeSlipUser.jabatan} - {activeSlipUser.divisi}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400">Periode:</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{activeSlipUser.gaji.periode}</p>
                  <p className="text-emerald-600 font-bold">{activeSlipUser.gaji.statusGaji}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Gaji Pokok</span>
                  <span className="font-semibold">{formatRupiahDisplay(activeSlipUser.gaji.gajiPokok)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Tunjangan Jabatan</span>
                  <span className="font-semibold">{formatRupiahDisplay(activeSlipUser.gaji.tunjanganJabatan)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Uang Makan & Transport</span>
                  <span className="font-semibold">{formatRupiahDisplay(activeSlipUser.gaji.tunjanganTransportMakan)}</span>
                </div>
                {activeSlipUser.gaji.lemburNominal > 0 && (
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Uang Lembur ({activeSlipUser.gaji.lemburJam} Jam)</span>
                    <span className="font-semibold">{formatRupiahDisplay(activeSlipUser.gaji.lemburNominal)}</span>
                  </div>
                )}
                {activeSlipUser.gaji.bonusInsentif > 0 && (
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Bonus Insentif Proyek</span>
                    <span className="font-semibold">{formatRupiahDisplay(activeSlipUser.gaji.bonusInsentif)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b-2 border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                  <span>Total Penghasilan Kotor</span>
                  <span>{formatRupiahDisplay(activeSlipUser.gaji.totalGajiKotor)}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 text-rose-500">
                  <span>Potongan BPJS & Pinjaman</span>
                  <span>-{formatRupiahDisplay(activeSlipUser.gaji.totalPotongan)}</span>
                </div>

                <div className="flex justify-between py-3 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-500/20 font-bold text-amber-700 dark:text-amber-400 text-sm">
                  <span>TAKE HOME PAY (BERSIH)</span>
                  <span>{formatRupiahDisplay(activeSlipUser.gaji.totalGajiBersih)}</span>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportPDFSalary(activeSlipUser)}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl flex items-center gap-2 shadow-sm transition"
                >
                  <Download className="w-4 h-4" />
                  Unduh PDF (Cover &amp; Kop)
                </button>
                <button
                  onClick={() => handleSendWhatsAppSlip(activeSlipUser)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Kirim Notifikasi WA
                </button>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Cetak Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
