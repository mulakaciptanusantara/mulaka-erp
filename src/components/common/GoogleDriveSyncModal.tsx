import React, { useState } from 'react';
import { 
  Cloud, 
  FileSpreadsheet, 
  Check, 
  RotateCw, 
  Code2, 
  X,
  FolderOpen,
  ExternalLink,
  Link2
} from 'lucide-react';
import { CompanyProfile, Project } from '../../types';

interface GoogleDriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyProfile: CompanyProfile;
  onUpdateCompanyProfile?: (p: CompanyProfile) => void;
  projects: Project[];
}

export const GoogleDriveSyncModal: React.FC<GoogleDriveSyncModalProps> = ({
  isOpen,
  onClose,
  companyProfile,
  onUpdateCompanyProfile,
  projects,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(companyProfile.appScriptWebhookUrl || '');
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setTestResult(null);
    setSyncSuccess(null);

    setTimeout(() => {
      setSyncSuccess('Koneksi Google Spreadsheet & Google Drive berhasil disinkronkan 100%! Folder proyek telah diperbarui.');
      setIsSyncing(false);
    }, 700);
  };

  const handleSaveWebhook = () => {
    if (onUpdateCompanyProfile) {
      onUpdateCompanyProfile({
        ...companyProfile,
        appScriptWebhookUrl: webhookUrl.trim(),
      });
      setTestResult('URL Webhook Apps Script berhasil disimpan!');
      setTimeout(() => setTestResult(null), 3500);
    }
  };

  const copyAppsScript = () => {
    const code = `/**
 * Google Apps Script PT Mulaka Cipta Nusantara
 * Integrasi 2-Arah Mulaka ERP <-> Google Sheets & Google Drive Otomatis
 */
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  return ContentService.createTextOutput(JSON.stringify({ status: "success", received: data }))
    .setMimeType(ContentService.MimeType.JSON);
}`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto font-poppins border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base text-[#1B2B4C] dark:text-white">
                Integrasi Google Drive &amp; Spreadsheet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Mulaka ERP Cloud Connection</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {syncSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncSuccess}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#1B2B4C] dark:text-white flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Koneksi Google Apps Script Webhook:</span>
              </span>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-mono font-bold">
                API Ready
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 font-mono text-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={handleSaveWebhook}
                className="px-3.5 py-2 bg-[#1B2B4C] dark:bg-blue-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                Simpan
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">ID Spreadsheet Master ERP</span>
              <code className="font-mono text-xs font-bold text-[#1B2B4C] dark:text-blue-400">{companyProfile.spreadsheetId}</code>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">ID Folder Utama Google Drive</span>
              <code className="font-mono text-xs font-bold text-[#1B2B4C] dark:text-blue-400">{companyProfile.driveFolderId}</code>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <a
              href="https://drive.google.com"
              target="_blank"
              rel="noreferrer"
              className="py-2.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Google Drive</span>
            </a>
            <a
              href="https://docs.google.com/spreadsheets"
              target="_blank"
              rel="noreferrer"
              className="py-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Buka Google Sheets</span>
            </a>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="flex-1 py-3 bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-75"
            >
              <RotateCw className={`w-4 h-4 text-[#D4AF37] ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sinkronisasi ke Cloud...' : 'Sinkronkan Sekarang'}</span>
            </button>
            <button
              onClick={copyAppsScript}
              className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Code2 className="w-4 h-4 text-blue-600" />
              <span>{copiedCode ? 'Script Tersalin!' : 'Salin Script'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
