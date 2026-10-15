import React, { useState } from 'react';
import { 
  ShieldCheck, 
  History, 
  Search, 
  X, 
  Download, 
  Filter, 
  Calendar, 
  User as UserIcon, 
  Activity, 
  Lock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { AuditTrailLog, SecurityLoginLog } from '../../types';

interface AdminSecurityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  securityLogs: SecurityLoginLog[];
  auditLogs: AuditTrailLog[];
}

export const AdminSecurityLogModal: React.FC<AdminSecurityLogModalProps> = ({
  isOpen,
  onClose,
  securityLogs,
  auditLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'security-login' | 'audit-transaksi'>('security-login');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredSecurity = securityLogs.filter(s => {
    const q = searchTerm.toLowerCase();
    return s.username.toLowerCase().includes(q) || s.nama.toLowerCase().includes(q) || s.status.toLowerCase().includes(q) || (s.perangkat || '').toLowerCase().includes(q);
  });

  const filteredAudit = auditLogs.filter(a => {
    const q = searchTerm.toLowerCase();
    return a.userNama.toLowerCase().includes(q) || a.modul.toLowerCase().includes(q) || a.detail.toLowerCase().includes(q) || a.aksi.toLowerCase().includes(q);
  });

  const handleExportAuditPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(27, 43, 76);
    doc.rect(0, 0, pageWidth, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PT. MULAKA CIPTA NUSANTARA - AUDIT TRAIL LOG RESMI', 14, 12);
    doc.setFontSize(8);
    doc.setTextColor(212, 175, 55);
    doc.text('LOG KEAMANAN AUTENTIKASI & HISTORI PERUBAHAN DATABASE ERP', 14, 18);

    doc.setTextColor(27, 43, 76);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('REKAPITULASI AKTIVITAS SISTEM', 14, 32);

    let y = 40;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, pageWidth - 28, 7, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.5);
    doc.text('TIMESTAMP', 16, y + 4.8);
    doc.text('USER & ROLE', 50, y + 4.8);
    doc.text('MODUL', 95, y + 4.8);
    doc.text('AKSI & DETAIL', 130, y + 4.8);
    y += 10;

    auditLogs.slice(0, 35).forEach(log => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(51, 65, 85);
      doc.text(log.timestamp, 16, y);
      doc.text(`${log.userNama} (${log.userRole})`, 50, y);
      doc.text(log.modul, 95, y);
      doc.text(log.detail.substring(0, 50), 130, y);
      y += 6;
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`Audit_Security_Mulaka_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl my-8 p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base md:text-lg text-[#1B2B4C] dark:text-white">
                Log Keamanan &amp; Histori Perubahan Data (Admin Center)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transparansi aktivitas login pengguna serta jejak mutasi database (tambah, ubah, hapus transaksi).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportAuditPDF}
              className="px-3.5 py-2 bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Export PDF Log</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('security-login')}
              className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'security-login'
                  ? 'bg-[#1B2B4C] text-white dark:bg-blue-600 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Log Masuk / Login Pengguna ({securityLogs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit-transaksi')}
              className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'audit-transaksi'
                  ? 'bg-[#1B2B4C] text-white dark:bg-blue-600 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Histori Perubahan Database ({auditLogs.length})</span>
            </button>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, modul, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-inner">
          {activeTab === 'security-login' ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#1B2B4C] dark:bg-slate-950 text-white text-[10px] uppercase font-bold sticky top-0">
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Pengguna</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">IP Address</th>
                  <th className="py-2.5 px-3">Perangkat / Browser</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-mono">
                {filteredSecurity.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition">
                    <td className="py-2.5 px-3 text-slate-500">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <strong className="text-slate-800 dark:text-white">{log.nama}</strong>
                      <span className="text-[10px] text-slate-400 block font-mono">@{log.username}</span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {log.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-blue-600 dark:text-blue-400">{log.ipAddress}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-sans text-[11px] max-w-[200px] truncate" title={log.perangkat}>
                      {log.perangkat}
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        log.status === 'Berhasil'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredSecurity.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 font-sans">
                      Tidak ada log keamanan yang sesuai.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#1B2B4C] dark:bg-slate-950 text-white text-[10px] uppercase font-bold sticky top-0">
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Modul</th>
                  <th className="py-2.5 px-3">Aksi</th>
                  <th className="py-2.5 px-3">Rincian Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredAudit.map((aud) => (
                  <tr key={aud.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition">
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">{aud.timestamp}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-white whitespace-nowrap">
                      {aud.userNama}
                    </td>
                    <td className="py-2.5 px-3 text-blue-600 dark:text-blue-400 font-semibold whitespace-nowrap">{aud.modul}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {aud.aksi}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
                      {aud.detail}
                    </td>
                  </tr>
                ))}
                {filteredAudit.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400">
                      Tidak ada rekaman histori perubahan data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <span>Keamanan Terjamin &bull; SHA-256 Event Signatures</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
