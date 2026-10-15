import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  Edit3, 
  Save, 
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  Upload,
  Camera
} from 'lucide-react';
import { User } from '../../types';
import { formatIndonesianPhone, cleanPhoneForWhatsApp, formatRupiahDisplay } from '../../utils/formatters';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUserProfile: (updatedUser: User) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUserProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>(currentUser);
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 6 * 1024 * 1024) {
        setNotification('Ukuran file terlalu besar (maksimal 6MB)');
        setTimeout(() => setNotification(null), 3000);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setFormData(prev => ({ ...prev, foto: result }));
          setNotification('Foto profil berhasil diunggah! Klik Simpan untuk memperbarui.');
          setTimeout(() => setNotification(null), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUserProfile(formData);
    setIsEditing(false);
    setNotification('Data profil pribadi Anda berhasil diperbarui!');
    setTimeout(() => setNotification(null), 3000);
  };

  const waNumber = cleanPhoneForWhatsApp(formData.telepon);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl my-8 p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img 
                src={formData.foto} 
                alt={formData.nama} 
                className="w-16 h-16 rounded-full object-cover border-2 border-[#D4AF37] shadow-md" 
              />
              {isEditing && (
                <label 
                  title="Upload Foto Profil Baru"
                  className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white cursor-pointer opacity-90 hover:opacity-100 transition"
                >
                  <Camera className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-[9px] font-bold mt-0.5">Ubah</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#1B2B4C] dark:text-white flex items-center gap-2">
                <span>{formData.nama}</span>
                <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded-full font-bold uppercase">
                  {formData.role}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formData.jabatan} &bull; Divisi {formData.divisi}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-2 bg-[#1B2B4C] dark:bg-blue-600 hover:brightness-110 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Ubah Data</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setFormData(currentUser);
                  setIsEditing(false);
                }}
                className="px-3.5 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700 transition"
              >
                Batal
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* WhatsApp Quick Action Button */}
        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider block">
                Nomor WhatsApp Aktif
              </span>
              <strong className="text-sm font-mono text-emerald-900 dark:text-emerald-200">
                {formData.telepon || '+62 821-1801-005'}
              </strong>
            </div>
          </div>
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Hubungi via WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Form / Data Cards */}
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          {/* Section 1: Data Identitas & Kependudukan */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>Data Identitas &amp; Legalitas Kependudukan</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  Nomor Induk Kependudukan (NIK KTP)
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    maxLength={16}
                    value={formData.nikKtp || ''}
                    onChange={(e) => setFormData({ ...formData, nikKtp: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs"
                  />
                ) : (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono font-bold text-slate-800 dark:text-white">
                    {formData.nikKtp || '3273180209880001'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  Nomor Pokok Wajib Pajak (NPWP)
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.npwp || ''}
                    onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs"
                  />
                ) : (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono font-bold text-slate-800 dark:text-white">
                    {formData.npwp || '94.218.490.8-429.000'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  Username Sistem
                </label>
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800/40 rounded-xl font-mono text-slate-500 dark:text-slate-400">
                  @{formData.username}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Kontak & Domisili */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>Kontak &amp; Alamat Domisili</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  Email Perusahaan
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  />
                ) : (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-slate-800 dark:text-white">
                    {formData.email}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  Nomor HP / WhatsApp
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: formatIndonesianPhone(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs"
                  />
                ) : (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-slate-800 dark:text-white flex items-center justify-between">
                    <span>{formData.telepon}</span>
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  Alamat Lengkap Tempat Tinggal
                </label>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={formData.alamatLengkap || ''}
                    onChange={(e) => setFormData({ ...formData, alamatLengkap: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  />
                ) : (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-slate-800 dark:text-white">
                    {formData.alamatLengkap || 'Jl. Buahbatu Regency No. A-12, Buahbatu, Kota Bandung'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Rekening Payroll */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <CreditCard className="w-4 h-4 text-blue-500" />
              <span>Data Kepegawaian &amp; Rekening Payroll</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  Nama Bank Penerima
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.namaBank}
                    onChange={(e) => setFormData({ ...formData, namaBank: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  />
                ) : (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-slate-800 dark:text-white font-bold">
                    {formData.namaBank}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  Nomor Rekening Bank
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.nomorRekeningBank}
                    onChange={(e) => setFormData({ ...formData, nomorRekeningBank: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs"
                  />
                ) : (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono font-bold text-[#1B2B4C] dark:text-[#D4AF37]">
                    {formData.nomorRekeningBank}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                  Total Gaji Bersih Terakhir
                </label>
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 font-mono font-black">
                  {formatRupiahDisplay(formData.gaji?.totalGajiBersih || 0)}
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setFormData(currentUser);
                  setIsEditing(false);
                }}
                className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer hover:bg-slate-300 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-md transition"
              >
                <Save className="w-4 h-4 text-[#D4AF37]" />
                <span>Simpan Perubahan Profil</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
