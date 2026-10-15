import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  User as UserIcon, 
  Save, 
  Check, 
  Lock, 
  FileText, 
  CheckCircle2, 
  Palette, 
  Eye, 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  RotateCcw, 
  ExternalLink, 
  Maximize2, 
  Home, 
  Layers, 
  Sparkles as SparklesIcon,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  FileCheck2,
  Camera,
  Star,
  CheckSquare,
  X
} from 'lucide-react';
import { CompanyProfile, User, KopSuratTemplate, CoverSuratTemplate, BankAccountItem } from '../../types';
import { formatRupiahDisplay } from '../../utils/formatters';
import { MulakaEmblem } from '../common/MulakaLogo';

export const HOMEPAGE_BG_PRESETS = [
  {
    id: 'mulaka-sunset-villa-uploaded',
    title: 'Villa Tropis Sunset & Infinity Pool (Foto Anda - Default)',
    subtitle: 'Fasad villa tropis mewah dengan paviliun terbuka, kolam renang infinity, lounge fire pit, dan latar matahari terbenam.',
    url: '/images/mulaka_sunset_villa.jpg',
    tag: 'Pilihan Anda (Aktif)',
    isDefault: true,
  },
  {
    id: 'mulaka-residence-facade',
    title: 'Hunian Tropis Kontemporer Mulaka Residence',
    subtitle: 'Arsitektur hunian tinggal kontemporer elegan dengan pencahayaan hangat, gerbang modern dan lanskap asri.',
    url: '/images/mulaka_residence.jpg',
    tag: 'Residensial Mewah',
    isDefault: false,
  },
  {
    id: 'luxury-minimalist-facade',
    title: 'Minimalist Luxury Residence Facade',
    subtitle: 'Desain rumah mewah minimalis bersih dengan aksen kayu jati, batu alam dan pencahayaan aksen hangat.',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80',
    tag: 'Minimalis Mewah',
    isDefault: false,
  },
  {
    id: 'contemporary-glass-villa',
    title: 'Pavilion Glass & Pool Luxury Villa',
    subtitle: 'Nuansa arsitektur vila mewah modern dengan pavilion kaca dan refleksi air jernih yang tenang.',
    url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80',
    tag: 'Villa Kaca Modern',
    isDefault: false,
  },
  {
    id: 'scandinavian-architectural-home',
    title: 'Nordic Scandinavian Architectural Home',
    subtitle: 'Arsitektur modern bersih dengan estetika Nordik, material ramah lingkungan dan ruang lapang.',
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=80',
    tag: 'Scandi Living',
    isDefault: false,
  },
];

interface ProyekPengaturanViewProps {
  companyProfile: CompanyProfile;
  onUpdateCompanyProfile: (p: CompanyProfile) => void;
  currentUser: User;
  onUpdateUserProfile: (u: User) => void;
  kopTemplates: KopSuratTemplate[];
  onUpdateKopTemplates: (templates: KopSuratTemplate[]) => void;
  coverTemplate: CoverSuratTemplate;
  onUpdateCoverTemplate: (cover: CoverSuratTemplate) => void;
  onResetAllDataToEmpty?: () => void;
  homepageBgUrl?: string;
  onUpdateHomepageBgUrl?: (url: string) => void;
}

export const ProyekPengaturanView: React.FC<ProyekPengaturanViewProps> = ({
  companyProfile,
  onUpdateCompanyProfile,
  currentUser,
  onUpdateUserProfile,
  kopTemplates,
  onUpdateKopTemplates,
  coverTemplate,
  onUpdateCoverTemplate,
  onResetAllDataToEmpty,
  homepageBgUrl,
  onUpdateHomepageBgUrl,
}) => {
  const [subTab, setSubTab] = useState<'kop-surat' | 'cover-surat' | 'rekening' | 'perusahaan' | 'profile' | 'homepage-bg' | 'reset-data'>('kop-surat');
  
  // State for Company Profile
  const [profile, setProfile] = useState<CompanyProfile>(companyProfile);
  // State for User Profile
  const [userState, setUserState] = useState<User>(currentUser);
  // State for Kop Surat
  const [kops, setKops] = useState<KopSuratTemplate[]>(kopTemplates);
  const [selectedKopDoc, setSelectedKopDoc] = useState<KopSuratTemplate['jenisDokumen']>('PKS');
  // State for Cover Surat
  const [cover, setCover] = useState<CoverSuratTemplate>(coverTemplate);
  // Notification toast
  const [notification, setNotification] = useState<string | null>(null);

  // Background state
  const [currentHomepageBg, setCurrentHomepageBg] = useState<string>(() => {
    return homepageBgUrl || '/images/mulaka_sunset_villa.jpg';
  });
  const [showFullPreviewModal, setShowFullPreviewModal] = useState(false);

  // Bank Account Modal
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [editingBankIndex, setEditingBankIndex] = useState<number | null>(null);
  const [bankNama, setBankNama] = useState('Bank Central Asia (BCA)');
  const [bankNomor, setBankNomor] = useState('');
  const [bankPemilik, setBankPemilik] = useState(companyProfile.nama);
  const [bankCabang, setBankCabang] = useState('Bandung');
  const [bankIsUtama, setBankIsUtama] = useState(false);

  const isAdmin = currentUser.role === 'admin';

  // Active Kop template
  const activeKop = kops.find(k => k.jenisDokumen === selectedKopDoc) || kops[0] || {
    id: 'kop-default',
    jenisDokumen: 'PKS',
    namaPerusahaan: 'PT. MULAKA CIPTA NUSANTARA',
    subHeader: 'KONTRAK & LEGALITAS PROYEK',
    tagline: 'ARSITEKTUR, INTERIOR DESIGN & GENERAL CONTRACTOR',
    alamat: 'Jl. Gedebage Selatan No.70a, Kota Bandung | WA: +62 821-1801-005',
    telepon: '628211801005',
    email: 'info@mulaka.co.id',
    garisWarna: '#D4AF37',
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // 1. Save Kop Surat
  const handleUpdateActiveKop = (field: keyof KopSuratTemplate, value: string) => {
    const updatedKops = kops.map(k => {
      if (k.jenisDokumen === selectedKopDoc) {
        return { ...k, [field]: value };
      }
      return k;
    });
    setKops(updatedKops);
  };

  const handleSaveKopSurat = () => {
    onUpdateKopTemplates(kops);
    showToast(`Template Kop Surat untuk ${selectedKopDoc} berhasil disimpan!`);
  };

  const handleApplyKopToAll = () => {
    const source = activeKop;
    const updatedKops = kops.map(k => ({
      ...k,
      namaPerusahaan: source.namaPerusahaan,
      tagline: source.tagline,
      alamat: source.alamat,
      telepon: source.telepon,
      email: source.email,
      garisWarna: source.garisWarna,
    }));
    setKops(updatedKops);
    onUpdateKopTemplates(updatedKops);
    showToast('Identitas Kop Surat berhasil disinkronkan ke seluruh template dokumen!');
  };

  // 2. Save Cover Surat
  const handleSaveCoverSurat = (updatedCover: CoverSuratTemplate) => {
    setCover(updatedCover);
    onUpdateCoverTemplate(updatedCover);
    showToast('Pengaturan Template Cover Surat berhasil disimpan & terintegrasi!');
  };

  const handleUploadCoverBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast('Ukuran file foto cover terlalu besar (maksimal 8MB).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          const updated = {
            ...cover,
            theme: 'custom-image' as const,
            backgroundUrl: result,
          };
          handleSaveCoverSurat(updated);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCoverBackground = () => {
    const updated = {
      ...cover,
      theme: 'navy-gold' as const,
      backgroundUrl: undefined,
    };
    handleSaveCoverSurat(updated);
  };

  // 3. Bank Accounts
  const handleOpenAddBank = () => {
    setEditingBankIndex(null);
    setBankNama('Bank Central Asia (BCA)');
    setBankNomor('');
    setBankPemilik(profile.nama);
    setBankCabang('Bandung');
    setBankIsUtama(false);
    setShowAddBankModal(true);
  };

  const handleOpenEditBank = (idx: number) => {
    const b = profile.bankAccounts[idx];
    setEditingBankIndex(idx);
    setBankNama(b.namaBank);
    setBankNomor(b.nomorRekening);
    setBankPemilik(b.atasNama);
    setBankCabang(b.cabang || '');
    setBankIsUtama(b.isUtama);
    setShowAddBankModal(true);
  };

  const handleSaveBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    let currentAccounts = [...(profile.bankAccounts || [])];

    if (bankIsUtama) {
      currentAccounts = currentAccounts.map(a => ({ ...a, isUtama: false }));
    }

    if (editingBankIndex !== null) {
      currentAccounts[editingBankIndex] = {
        ...currentAccounts[editingBankIndex],
        namaBank: bankNama,
        nomorRekening: bankNomor,
        atasNama: bankPemilik,
        cabang: bankCabang,
        isUtama: bankIsUtama,
      };
    } else {
      const newAcc: BankAccountItem = {
        id: `bnk-${Date.now()}`,
        namaBank: bankNama,
        nomorRekening: bankNomor,
        atasNama: bankPemilik,
        cabang: bankCabang,
        isUtama: bankIsUtama || currentAccounts.length === 0,
      };
      currentAccounts.push(newAcc);
    }

    const updatedProfile = { ...profile, bankAccounts: currentAccounts };
    setProfile(updatedProfile);
    onUpdateCompanyProfile(updatedProfile);
    setShowAddBankModal(false);
    showToast('Rekening bank berhasil disimpan!');
  };

  const handleDeleteBank = (idx: number) => {
    if (confirm('Hapus rekening bank ini?')) {
      const filtered = profile.bankAccounts.filter((_, i) => i !== idx);
      const updatedProfile = { ...profile, bankAccounts: filtered };
      setProfile(updatedProfile);
      onUpdateCompanyProfile(updatedProfile);
      showToast('Rekening bank berhasil dihapus!');
    }
  };

  const handleSetPrimaryBank = (idx: number) => {
    const updated = profile.bankAccounts.map((b, i) => ({
      ...b,
      isUtama: i === idx,
    }));
    const updatedProfile = { ...profile, bankAccounts: updated };
    setProfile(updatedProfile);
    onUpdateCompanyProfile(updatedProfile);
    showToast(`${profile.bankAccounts[idx].namaBank} dijadikan rekening utama!`);
  };

  // 4. Company Profile
  const handleSaveCompanyProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompanyProfile(profile);
    showToast('Identitas & Legalitas PT. Mulaka Cipta Nusantara berhasil diperbarui!');
  };

  // 5. User Profile
  const handleSaveUserProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUserProfile(userState);
    showToast('Profil pengguna Anda berhasil diperbarui!');
  };

  const handleUploadUserPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = event.target?.result as string;
        if (res) {
          const updated = { ...userState, foto: res };
          setUserState(updated);
          onUpdateUserProfile(updated);
          showToast('Foto profil baru berhasil disimpan!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 6. Homepage Background
  const handleSelectPresetBg = (preset: typeof HOMEPAGE_BG_PRESETS[0]) => {
    setCurrentHomepageBg(preset.url);
    if (onUpdateHomepageBgUrl) onUpdateHomepageBgUrl(preset.url);
    showToast(`Foto background Home Page diubah ke: "${preset.title}"!`);
  };

  const handleHomepageBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast('Ukuran file foto terlalu besar (maksimal 8MB).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCurrentHomepageBg(result);
          if (onUpdateHomepageBgUrl) onUpdateHomepageBgUrl(result);
          showToast('Foto background Home Page baru berhasil diupload dan disimpan!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <MulakaEmblem variant="gold" size={40} />
          <div>
            <h1 className="text-xl font-bold text-[#1B2B4C] dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#D4AF37]" />
              Pengaturan &amp; Template Sistem Mulaka ERP
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola Kop Surat Dokumen, Cover Surat Terintegrasi, Rekening Bank, Legalitas Perusahaan, dan Profil Pengguna.
            </p>
          </div>
        </div>

        {isAdmin ? (
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Administrator (Full Access)</span>
          </span>
        ) : (
          <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>Akses Anggota Tim</span>
          </span>
        )}
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Subtab Navigation - ALL 7 TABS RESTORED & VISIBLE */}
      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-1.5 overflow-x-auto text-xs">
        <button
          onClick={() => setSubTab('kop-surat')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            subTab === 'kop-surat' ? 'bg-[#1B2B4C] text-[#F5DEB3] shadow-md dark:bg-blue-600 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <FileText className="w-4 h-4 text-[#D4AF37]" />
          <span>Template &amp; Kop Surat</span>
        </button>

        <button
          onClick={() => setSubTab('cover-surat')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            subTab === 'cover-surat' ? 'bg-[#1B2B4C] text-[#F5DEB3] shadow-md dark:bg-blue-600 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Palette className="w-4 h-4 text-blue-500" />
          <span>Cover Surat &amp; Upload</span>
        </button>

        <button
          onClick={() => setSubTab('rekening')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            subTab === 'rekening' ? 'bg-[#1B2B4C] text-[#F5DEB3] shadow-md dark:bg-blue-600 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-500" />
          <span>Rekening Bank Mulaka</span>
        </button>

        <button
          onClick={() => setSubTab('perusahaan')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            subTab === 'perusahaan' ? 'bg-[#1B2B4C] text-[#F5DEB3] shadow-md dark:bg-blue-600 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-500" />
          <span>Identitas Perusahaan</span>
        </button>

        <button
          onClick={() => setSubTab('profile')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            subTab === 'profile' ? 'bg-[#1B2B4C] text-[#F5DEB3] shadow-md dark:bg-blue-600 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <UserIcon className="w-4 h-4 text-purple-500" />
          <span>Profil Pengguna Saya</span>
        </button>

        <button
          onClick={() => setSubTab('homepage-bg')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            subTab === 'homepage-bg' ? 'bg-[#1B2B4C] text-[#F5DEB3] shadow-md dark:bg-blue-600 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <SparklesIcon className="w-4 h-4 text-amber-400" />
          <span>Foto Background Home</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setSubTab('reset-data')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              subTab === 'reset-data' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-rose-500" />
            <span>Reset 1x Launching</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          TAB 1: TEMPLATE & KOP SURAT PER DOKUMEN (EDITABLE OTOMATIS)
         ========================================================================= */}
      {subTab === 'kop-surat' && (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-extrabold text-base md:text-lg text-[#1B2B4C] dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D4AF37]" />
                <span>Template &amp; Kop Surat Resmi Per Dokumen</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pilih jenis berkas lalu ubah isi kop surat, sub header, slogan, atau warna aksen. Perubahan otomatis berlaku di seluruh PDF.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyKopToAll}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer transition"
              >
                Terapkan Ke Seluruh Dokumen
              </button>
              <button
                type="button"
                onClick={handleSaveKopSurat}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 cursor-pointer shadow-sm transition"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Kop Surat</span>
              </button>
            </div>
          </div>

          {/* Document Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Pilih Jenis Dokumen:
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'PKS', label: 'PKS (Perjanjian Kerja Sama)' },
                { id: 'SPK', label: 'SPK (Surat Perintah Kerja)' },
                { id: 'BAST', label: 'BAST (Berita Acara Serah Terima)' },
                { id: 'Invoice', label: 'Invoice Tagihan Klien' },
                { id: 'Slip Gaji', label: 'Slip Gaji Karyawan & Tukang' },
                { id: 'BoQ', label: 'RAB / BoQ Proyek' },
                { id: 'Mutual Check', label: 'Mutual Check (MC 0 / 100)' },
                { id: 'Quality Control', label: 'Quality Control (QC)' },
                { id: 'Laporan Keuangan', label: 'Laporan Akuntansi & P&L' },
              ].map(doc => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedKopDoc(doc.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedKopDoc === doc.id
                      ? 'bg-[#1B2B4C] text-[#F5DEB3] shadow-sm dark:bg-blue-600 dark:text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {doc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Editor for active Kop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Perusahaan
              </label>
              <input
                type="text"
                value={activeKop.namaPerusahaan}
                onChange={(e) => handleUpdateActiveKop('namaPerusahaan', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sub Header / Divisi Terkait
              </label>
              <input
                type="text"
                value={activeKop.subHeader}
                onChange={(e) => handleUpdateActiveKop('subHeader', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tagline / Slogan Resmi
              </label>
              <input
                type="text"
                value={activeKop.tagline}
                onChange={(e) => handleUpdateActiveKop('tagline', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={activeKop.telepon}
                onChange={(e) => handleUpdateActiveKop('telepon', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Resmi
              </label>
              <input
                type="email"
                value={activeKop.email}
                onChange={(e) => handleUpdateActiveKop('email', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Warna Garis Aksen Kop (Hex Code)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={activeKop.garisWarna || '#D4AF37'}
                  onChange={(e) => handleUpdateActiveKop('garisWarna', e.target.value)}
                  className="w-10 h-9 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={activeKop.garisWarna}
                  onChange={(e) => handleUpdateActiveKop('garisWarna', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Lengkap Kantor
              </label>
              <input
                type="text"
                value={activeKop.alamat}
                onChange={(e) => handleUpdateActiveKop('alamat', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Live Preview of Letterhead */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-500" />
              <span>Pratinjau Kop Surat Live ({selectedKopDoc}):</span>
            </h3>

            <div className="p-6 bg-slate-900 text-white rounded-2xl border-2 border-slate-800 relative overflow-hidden shadow-md">
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-[#D4AF37] flex items-center justify-center p-2 shrink-0">
                    <MulakaEmblem color="#1E365B" size={28} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm md:text-base tracking-wide text-white uppercase">
                      {activeKop.namaPerusahaan}
                    </h4>
                    <p className="text-[10px] font-bold text-[#D4AF37] tracking-wider uppercase">
                      {activeKop.subHeader} &bull; {activeKop.tagline}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      {activeKop.alamat} | WA: +{activeKop.telepon} | Email: {activeKop.email}
                    </p>
                  </div>
                </div>
              </div>
              <div 
                className="h-1 w-full rounded-full" 
                style={{ backgroundColor: activeKop.garisWarna || '#D4AF37' }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: COVER SURAT PDF & UPLOAD BACKGROUND (AUTO-TERINTEGRASI)
         ========================================================================= */}
      {subTab === 'cover-surat' && (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-extrabold text-base md:text-lg text-[#1B2B4C] dark:text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-500" />
                <span>Template Cover Surat PDF &amp; Upload Background</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cover halaman depan resmi otomatis terintegrasi ke PKS, SPK, BAST, Formulir Onboarding, Invoice Klien, dan Slip Gaji Karyawan.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl">
                <input
                  type="checkbox"
                  checked={cover.enableCover}
                  onChange={(e) => handleSaveCoverSurat({ ...cover, enableCover: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <span>Aktifkan Cover Surat Otomatis</span>
              </label>
            </div>
          </div>

          {/* Integrated Document Badges */}
          <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl space-y-2">
            <h4 className="font-bold text-xs text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Dokumen Yang Otomatis Terintegrasi Cover Ini:</span>
            </h4>
            <div className="flex flex-wrap gap-2 text-[11px]">
              {['Formulir Onboarding Klien', 'Kontrak PKS & SPK Proyek', 'Berita Acara Serah Terima (BAST)', 'Mutual Check (MC 0 / 100)', 'Invoice Tagihan Klien', 'Slip Gaji Karyawan', 'Slip Upah Tukang Mulaka', 'Estimasi RAB & BoQ'].map(doc => (
                <span key={doc} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-blue-800 dark:text-blue-200 font-semibold border border-blue-200 dark:border-blue-800 shadow-2xs">
                  ✓ {doc}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor Controls */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Utama Cover
                </label>
                <input
                  type="text"
                  value={cover.judulUtama}
                  onChange={(e) => setCover({ ...cover, judulUtama: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sub-Instansi / Keterangan Berkas
                </label>
                <input
                  type="text"
                  value={cover.instansi}
                  onChange={(e) => setCover({ ...cover, instansi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Kerahasiaan Dokumen
                </label>
                <textarea
                  rows={3}
                  value={cover.catatanKerahasiaan}
                  onChange={(e) => setCover({ ...cover, catatanKerahasiaan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Upload Cover Background */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-amber-500" />
                  <span>Upload Foto Background Cover PDF</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Unggah gambar render 3D arsitektur, fasad villa, atau motif korporat Mulaka untuk dijadikan latar belakang cover PDF.
                </p>

                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 bg-[#1B2B4C] hover:bg-[#111C33] text-[#F5DEB3] rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2 shadow-sm transition">
                    <Camera className="w-4 h-4" />
                    <span>Pilih Foto Background Cover</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadCoverBackground}
                      className="hidden"
                    />
                  </label>

                  {cover.backgroundUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveCoverBackground}
                      className="px-3.5 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      Hapus Foto (Gunakan Navy Gold Default)
                    </button>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSaveCoverSurat(cover)}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Cover Surat</span>
              </button>
            </div>

            {/* Live Visual Preview of Cover */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-500" />
                <span>Pratinjau Cover Surat PDF (A4 Ratio):</span>
              </h4>

              <div className="relative aspect-[1/1.414] w-full max-w-[340px] mx-auto rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-2xl bg-slate-950 flex flex-col justify-between p-6 text-center text-white">
                {cover.backgroundUrl ? (
                  <>
                    <img
                      src={cover.backgroundUrl}
                      alt="Cover Background"
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-slate-950/70" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-[#1B2B4C]" />
                )}

                {/* Inner Gold Borders */}
                <div className="absolute inset-2 border border-[#D4AF37]/60 pointer-events-none rounded-xl" />
                <div className="absolute inset-3 border-2 border-[#D4AF37] pointer-events-none rounded-lg" />

                {/* Top Company Info */}
                <div className="relative z-10 pt-4">
                  <h3 className="font-black text-xs uppercase tracking-wider text-white">
                    {profile.nama}
                  </h3>
                  <p className="text-[8px] font-bold text-[#D4AF37] tracking-widest uppercase mt-0.5">
                    {profile.tagline}
                  </p>
                </div>

                {/* Emblem */}
                <div className="relative z-10 my-auto flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-[#D4AF37] flex items-center justify-center p-2 shadow-lg mb-4">
                    <MulakaEmblem color="#1B2B4C" size={32} />
                  </div>

                  {/* Title Box */}
                  <div className="w-full bg-slate-950/80 backdrop-blur-sm border border-[#D4AF37] p-4 rounded-xl space-y-1">
                    <p className="text-[8px] font-bold text-[#D4AF37] uppercase tracking-wider">
                      {cover.judulUtama}
                    </p>
                    <h4 className="font-bold text-xs text-white">
                      PERJANJIAN KERJA SAMA (PKS)
                    </h4>
                    <p className="text-[8px] text-slate-300">
                      No. Berkas: PKS-MLK/2026/088
                    </p>
                    <div className="h-[1px] bg-[#D4AF37]/50 w-24 mx-auto my-1" />
                    <p className="text-[8px] font-semibold text-slate-200">
                      Proyek: Pembangunan Villa Modern Dago Resort
                    </p>
                    <p className="text-[7px] text-slate-400">
                      Klien: Dr. Hendra Gunawan, Sp.A
                    </p>
                  </div>
                </div>

                {/* Footer Notes */}
                <div className="relative z-10 pb-2 space-y-1">
                  <p className="text-[7px] font-bold text-[#D4AF37]">
                    {cover.catatanKerahasiaan}
                  </p>
                  <p className="text-[6.5px] text-slate-400">
                    {profile.alamat} | WA: +{profile.wa}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: REKENING BANK MULAKA (EDITABLE, TAMBAH, HAPUS, UTAMA)
         ========================================================================= */}
      {subTab === 'rekening' && (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-extrabold text-base md:text-lg text-[#1B2B4C] dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-500" />
                <span>Kelola Rekening Bank Resmi PT. Mulaka Cipta Nusantara</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daftar rekening bank perusahaan untuk penerimaan termin klien, pembayaran vendor, dan payroll tukang.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddBank}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 flex items-center gap-1.5 cursor-pointer shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Rekening Baru</span>
            </button>
          </div>

          {/* Cards of Bank Accounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.bankAccounts?.map((acc, idx) => (
              <div
                key={acc.id || idx}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  acc.isUtama
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {acc.namaBank}
                    </span>
                    {acc.isUtama && (
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-600 text-white flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Rekening Utama</span>
                      </span>
                    )}
                  </div>

                  <p className="text-lg font-mono font-black text-slate-900 dark:text-white tracking-wider mt-2">
                    {acc.nomorRekening}
                  </p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                    a.n {acc.atasNama}
                  </p>
                  {acc.cabang && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Kantor Cabang: {acc.cabang}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {!acc.isUtama ? (
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryBank(idx)}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                    >
                      Jadikan Utama
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-600 font-bold">✓ Rekening Default</span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditBank(idx)}
                      className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Edit
                    </button>
                    {profile.bankAccounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteBank(idx)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Tambah / Edit Rekening */}
          {showAddBankModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {editingBankIndex !== null ? 'Edit Rekening Bank' : 'Tambah Rekening Bank Baru'}
                  </h3>
                  <button onClick={() => setShowAddBankModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveBankAccount} className="p-6 space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Bank
                    </label>
                    <select
                      value={bankNama}
                      onChange={(e) => setBankNama(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Bank Central Asia (BCA)">Bank Central Asia (BCA)</option>
                      <option value="Bank Mandiri">Bank Mandiri</option>
                      <option value="Bank Rakyat Indonesia (BRI)">Bank Rakyat Indonesia (BRI)</option>
                      <option value="Bank Negara Indonesia (BNI)">Bank Negara Indonesia (BNI)</option>
                      <option value="Bank Syariah Indonesia (BSI)">Bank Syariah Indonesia (BSI)</option>
                      <option value="Bank CIMB Niaga">Bank CIMB Niaga</option>
                      <option value="Bank Permata">Bank Permata</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nomor Rekening
                    </label>
                    <input
                      type="text"
                      required
                      value={bankNomor}
                      onChange={(e) => setBankNomor(e.target.value)}
                      placeholder="Contoh: 8105-8829-1002"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Atas Nama Rekening
                    </label>
                    <input
                      type="text"
                      required
                      value={bankPemilik}
                      onChange={(e) => setBankPemilik(e.target.value)}
                      placeholder="PT. MULAKA CIPTA NUSANTARA"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Cabang Bank (Opsional)
                    </label>
                    <input
                      type="text"
                      value={bankCabang}
                      onChange={(e) => setBankCabang(e.target.value)}
                      placeholder="KCU Buah Batu Bandung"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <label className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={bankIsUtama}
                      onChange={(e) => setBankIsUtama(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>Tetapkan sebagai Rekening Utama</span>
                  </label>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAddBankModal(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-sm"
                    >
                      Simpan Rekening
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: IDENTITAS & LEGALITAS PERUSAHAAN PT. MULAKA CIPTA NUSANTARA
         ========================================================================= */}
      {subTab === 'perusahaan' && (
        <form onSubmit={handleSaveCompanyProfile} className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-extrabold text-base md:text-lg text-[#1B2B4C] dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                <span>Identitas &amp; Legalitas PT. Mulaka Cipta Nusantara</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Profil legalitas resmi, NPWP, NIB, SIUJK, Akta Notaris, alamat workshop, dan integrasi Google Drive/Sheet.
              </p>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-2 cursor-pointer shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Identitas Perusahaan</span>
            </button>
          </div>

          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            1. Profil &amp; Kontak Utama
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Perusahaan
              </label>
              <input
                type="text"
                required
                value={profile.nama}
                onChange={(e) => setProfile({ ...profile, nama: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tagline Resmi
              </label>
              <input
                type="text"
                value={profile.tagline}
                onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor WhatsApp Hotline
              </label>
              <input
                type="text"
                value={profile.wa}
                onChange={(e) => setProfile({ ...profile, wa: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Perusahaan
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Instagram Resmi
              </label>
              <input
                type="text"
                value={profile.instagram}
                onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Kantor Utama
              </label>
              <input
                type="text"
                value={profile.alamat}
                onChange={(e) => setProfile({ ...profile, alamat: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider pt-2 border-t border-slate-100 dark:border-slate-800">
            2. Legalitas Hukum &amp; Perizinan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Induk Berusaha (NIB)
              </label>
              <input
                type="text"
                value={profile.legalitas?.nomorNIB || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  legalitas: { ...profile.legalitas, nomorNIB: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NPWP Perusahaan
              </label>
              <input
                type="text"
                value={profile.legalitas?.nomorNPWP || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  legalitas: { ...profile.legalitas, nomorNPWP: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Izin Usaha Jasa Konstruksi (SIUJK)
              </label>
              <input
                type="text"
                value={profile.legalitas?.nomorSIUJK || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  legalitas: { ...profile.legalitas, nomorSIUJK: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Akta Notaris Pendirian
              </label>
              <input
                type="text"
                value={profile.legalitas?.aktaNotaris || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  legalitas: { ...profile.legalitas, aktaNotaris: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                SK Pengesahan Kemenkumham
              </label>
              <input
                type="text"
                value={profile.legalitas?.skKemenkumham || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  legalitas: { ...profile.legalitas, skKemenkumham: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Workshop &amp; Pabrikasi Mulaka Livin
              </label>
              <input
                type="text"
                value={profile.legalitas?.alamatWorkshop || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  legalitas: { ...profile.legalitas, alamatWorkshop: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider pt-2 border-t border-slate-100 dark:border-slate-800">
            3. Integrasi Cloud Drive &amp; Spreadsheet
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Google Spreadsheet ID
              </label>
              <input
                type="text"
                value={profile.spreadsheetId}
                onChange={(e) => setProfile({ ...profile, spreadsheetId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Google Drive Folder ID
              </label>
              <input
                type="text"
                value={profile.driveFolderId}
                onChange={(e) => setProfile({ ...profile, driveFolderId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Apps Script Webhook URL (Opsional)
              </label>
              <input
                type="text"
                value={profile.appScriptWebhookUrl || ''}
                onChange={(e) => setProfile({ ...profile, appScriptWebhookUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>
        </form>
      )}

      {/* =========================================================================
          TAB 5: PROFIL PENGGUNA SAYA (EDITABLE)
         ========================================================================= */}
      {subTab === 'profile' && (
        <form onSubmit={handleSaveUserProfile} className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-extrabold text-base md:text-lg text-[#1B2B4C] dark:text-white flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-purple-500" />
                <span>Profil Pengguna &amp; Identitas Pribadi</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Perbarui biodata akun Anda, nomor rekening payroll, kontak darurat, dan foto profil.
              </p>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 cursor-pointer shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Profil Saya</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-2xl">
            <div className="relative">
              {userState.foto ? (
                <img
                  src={userState.foto}
                  alt={userState.nama}
                  className="w-20 h-20 rounded-full object-cover border-2 border-purple-500 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-purple-200 text-purple-800 font-bold text-2xl flex items-center justify-center">
                  {userState.nama.charAt(0)}
                </div>
              )}
              <label className="absolute bottom-0 right-0 p-1.5 bg-purple-600 text-white rounded-full cursor-pointer hover:bg-purple-700 shadow-sm">
                <Camera className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" onChange={handleUploadUserPhoto} className="hidden" />
              </label>
            </div>

            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">{userState.nama}</h3>
              <p className="text-xs font-bold text-purple-600 dark:text-purple-400">{userState.jabatan} &bull; {userState.divisi}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Role: <span className="uppercase font-bold">{userState.role}</span> | Username: @{userState.username}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={userState.nama}
                onChange={(e) => setUserState({ ...userState, nama: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jabatan
              </label>
              <input
                type="text"
                value={userState.jabatan}
                onChange={(e) => setUserState({ ...userState, jabatan: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Divisi
              </label>
              <input
                type="text"
                value={userState.divisi}
                onChange={(e) => setUserState({ ...userState, divisi: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor WhatsApp / HP
              </label>
              <input
                type="text"
                value={userState.telepon}
                onChange={(e) => setUserState({ ...userState, telepon: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Pribadi / Kantor
              </label>
              <input
                type="email"
                value={userState.email}
                onChange={(e) => setUserState({ ...userState, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kontak Darurat (Keluarga)
              </label>
              <input
                type="text"
                value={userState.kontakDarurat || ''}
                onChange={(e) => setUserState({ ...userState, kontakDarurat: e.target.value })}
                placeholder="0812-xxxx-xxxx (Istri/Orang Tua)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NIK KTP
              </label>
              <input
                type="text"
                value={userState.nikKtp}
                onChange={(e) => setUserState({ ...userState, nikKtp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NPWP Pribadi
              </label>
              <input
                type="text"
                value={userState.npwp || ''}
                onChange={(e) => setUserState({ ...userState, npwp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Bank Payroll
              </label>
              <input
                type="text"
                value={userState.namaBank || 'Bank BCA'}
                onChange={(e) => setUserState({ ...userState, namaBank: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Rekening Payroll
              </label>
              <input
                type="text"
                value={userState.nomorRekeningBank || ''}
                onChange={(e) => setUserState({ ...userState, nomorRekeningBank: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Domisili
              </label>
              <input
                type="text"
                value={userState.alamatLengkap}
                onChange={(e) => setUserState({ ...userState, alamatLengkap: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </form>
      )}

      {/* =========================================================================
          TAB 6: FOTO BACKGROUND HOMEPAGE
         ========================================================================= */}
      {subTab === 'homepage-bg' && (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-5xl mx-auto space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base md:text-lg text-[#1B2B4C] dark:text-white flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-[#D4AF37]" />
                <span>Foto Background Home Page (Foto Anda Terpasang Sebagai Default)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Foto yang Anda upload (Villa Tropis Sunset &amp; Infinity Pool) telah dipasang sebagai latar belakang aktif. Pilihan lainnya tersimpan di bawah ini.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowFullPreviewModal(true)}
              className="px-4 py-2 bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Pratinjau Layar Penuh</span>
            </button>
          </div>

          {/* Current Active Preview */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-xl bg-slate-950 aspect-[16/9] max-h-[360px] w-full">
            <img
              src={currentHomepageBg}
              alt="Background Aktif"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-slate-900/30" />
            <div className="absolute bottom-4 left-4 z-10 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-xs text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Foto Latar Belakang Home Page Aktif</span>
            </div>
          </div>

          {/* Presets and Upload */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#D4AF37]" />
                <span>Koleksi Pilihan Foto Lainnya (Tersimpan Sesuai Permintaan Anda):</span>
              </h4>

              <label className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5 text-amber-500" />
                <span>Upload Foto Latar Lain</span>
                <input type="file" accept="image/*" onChange={handleHomepageBgUpload} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {HOMEPAGE_BG_PRESETS.map((preset) => {
                const isActive = currentHomepageBg === preset.url;
                return (
                  <div
                    key={preset.id}
                    className={`rounded-2xl border overflow-hidden transition-all duration-200 flex flex-col justify-between ${
                      isActive
                        ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/40 bg-amber-50/20 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                      <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-950/80 text-amber-300 border border-amber-300/30">
                          {preset.tag}
                        </span>
                      </div>
                      {isActive && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md">
                          <Check className="w-3 h-3" />
                          <span>Aktif</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3.5 space-y-2">
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{preset.title}</h5>
                      <p className="text-[10px] text-slate-500 line-clamp-2">{preset.subtitle}</p>
                      <button
                        type="button"
                        onClick={() => handleSelectPresetBg(preset)}
                        className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#1B2B4C] hover:bg-[#111C33] text-[#F5DEB3]'
                        }`}
                      >
                        {isActive ? '✓ Sedang Digunakan' : 'Gunakan Foto Ini'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: RESET DATA 1X PAKAI AWAL LAUNCHING WEB (KHUSUS ADMIN)
         ========================================================================= */}
      {subTab === 'reset-data' && isAdmin && (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl mx-auto space-y-6 text-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center border border-rose-200 dark:border-rose-900">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base md:text-lg text-slate-900 dark:text-white">
                Reset Data 1x Pakai - Awal Launching Web (Proyek &amp; Akuntansi)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fitur khusus Admin Mulaka ketika awal launching web: mengosongkan seluruh data proyek, cashflow, PO, tukang, dan jurnal jadi anggap web dari 0.
              </p>
            </div>
          </div>

          <div className="p-4 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl space-y-3 text-rose-900 dark:text-rose-300">
            <div className="flex items-center gap-2 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Perhatian Administrator Mulaka:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-rose-800 dark:text-rose-400">
              <li>Aksi ini akan menghapus semua proyek percobaan, cashflow, invoice tukang, dan jurnal umum.</li>
              <li>Database master AHSP Cipta Karya, Daftar Akun COA, dan akun Admin tetap aman dipertahankan.</li>
              <li>Gunakan tombol ini saat Anda siap memulai pencatatan proyek riil dari nol.</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('KONFIRMASI AKHIR ADMIN MULAKA:\n\nApakah Anda yakin ingin melakukan RESET DATA 1X AWAL LAUNCHING?\nSemua proyek dan jurnal akuntansi akan dikosongkan dan dimulai dari angka 0.')) {
                if (onResetAllDataToEmpty) onResetAllDataToEmpty();
                showToast('Reset Awal Launching berhasil dijalankan! Web telah dimulai bersih dari angka 0.');
              }
            }}
            className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 text-sm shadow-lg transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Eksekusi Reset 1x Launching (Semua Data Jadi 0)</span>
          </button>
        </div>
      )}

      {/* FULLSCREEN PREVIEW MODAL */}
      {showFullPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
          <div className="relative w-full h-full overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 z-0">
              <img src={currentHomepageBg} alt="Full Preview" className="w-full h-full object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-slate-900/40" />
            </div>

            <div className="relative z-10 w-full px-6 md:px-12 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#1B2B4C] border-2 border-[#D4AF37] flex items-center justify-center p-2 shadow-lg">
                  <MulakaEmblem color="#D4AF37" size={26} />
                </div>
                <h1 className="text-base font-black text-white">PT. MULAKA CIPTA NUSANTARA</h1>
              </div>
              <button
                type="button"
                onClick={() => setShowFullPreviewModal(false)}
                className="px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>

            <div className="relative z-10 p-12 text-center text-white">
              <h2 className="text-4xl font-black">Pratinjau Home Page Foto Latar Belakang</h2>
              <p className="text-sm text-slate-300 mt-2">Nuansa arsitektur tropis modern dan elegan.</p>
            </div>

            <div className="relative z-10 p-4 text-center text-xs text-slate-400 bg-slate-950/50">
              &copy; {new Date().getFullYear()} PT. Mulaka Cipta Nusantara
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
