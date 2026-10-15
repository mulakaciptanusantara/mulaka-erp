import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Phone, 
  Trash2, 
  ShieldCheck, 
  Check, 
  AlertTriangle, 
  Search, 
  Sliders, 
  CheckSquare, 
  Square,
  Lock,
  Edit,
  UserCheck
} from 'lucide-react';
import { User, UserRole, UserPermissions } from '../../types';
import { formatIndonesianPhone, cleanPhoneForWhatsApp, formatRupiahDisplay } from '../../utils/formatters';
import { defaultAdminPermissions, defaultUserPermissions, defaultViewerPermissions } from '../../data/mockData';

interface ProyekTeamViewProps {
  users: User[];
  currentRole: UserRole;
  onAddUser: (u: User) => void;
  onUpdateUser: (u: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const ProyekTeamView: React.FC<ProyekTeamViewProps> = ({
  users,
  currentRole,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [permissionUser, setPermissionUser] = useState<User | null>(null);
  const [tempPermissions, setTempPermissions] = useState<UserPermissions>(defaultUserPermissions);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // New User Form State
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [teleponInput, setTeleponInput] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [divisi, setDivisi] = useState('General Contractor');
  const [role, setRole] = useState<UserRole>('user');
  const [alamatLengkap, setAlamatLengkap] = useState('');
  const [kotaDomisili, setKotaDomisili] = useState('Kota Bandung');
  const [nikKtp, setNikKtp] = useState('');
  const [npwp, setNpwp] = useState('');
  const [namaBank, setNamaBank] = useState('Bank BCA');
  const [nomorRekeningBank, setNomorRekeningBank] = useState('');
  const [gajiPokok, setGajiPokok] = useState<number>(8500000);
  const [statusKepegawaian, setStatusKepegawaian] = useState<'Karyawan Tetap' | 'Kontrak' | 'Harian Proyek' | 'Direksi'>('Karyawan Tetap');

  const isAdmin = currentRole === 'admin';

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatIndonesianPhone(e.target.value);
    setTeleponInput(formatted);
  };

  const handleOpenPermissions = (u: User) => {
    setPermissionUser(u);
    setTempPermissions(u.permissions || (u.role === 'admin' ? defaultAdminPermissions : u.role === 'viewer' ? defaultViewerPermissions : defaultUserPermissions));
  };

  const handleTogglePermission = (key: keyof UserPermissions) => {
    setTempPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSavePermissions = () => {
    if (!permissionUser) return;
    const updated: User = {
      ...permissionUser,
      permissions: tempPermissions,
    };
    onUpdateUser(updated);
    setPermissionUser(null);
    setNotification(`Hak akses untuk ${updated.nama} berhasil diperbarui!`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !username.trim()) {
      alert('Nama dan Username wajib diisi!');
      return;
    }

    const cleanNumber = cleanPhoneForWhatsApp(teleponInput);
    const initialPerms = role === 'admin' ? defaultAdminPermissions : role === 'viewer' ? defaultViewerPermissions : defaultUserPermissions;

    const newUser: User = {
      id: `usr-${Date.now()}`,
      username: username.toLowerCase().trim(),
      nama: nama.trim(),
      email: email.trim() || `${username.toLowerCase().trim()}@mulaka.co.id`,
      telepon: cleanNumber,
      jabatan: jabatan.trim() || 'Staf Lapangan',
      divisi,
      role,
      status: 'Aktif',
      foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
      alamatLengkap: alamatLengkap.trim() || 'Jl. Gedebage Selatan No.70a, Bandung',
      kotaDomisili: kotaDomisili.trim() || 'Kota Bandung',
      nikKtp: nikKtp.trim() || '3273180209880001',
      npwp: npwp.trim() || '94.218.490.8-429.000',
      namaBank: namaBank || 'Bank BCA',
      nomorRekeningBank: nomorRekeningBank.trim() || '8105-0011-22',
      statusKepegawaian,
      tanggalBergabung: new Date().toISOString().split('T')[0],
      kontakDarurat: 'Keluarga',
      permissions: initialPerms,
      gaji: {
        gajiPokok,
        tunjanganJabatan: Math.round(gajiPokok * 0.2),
        tunjanganTransportMakan: 1500000,
        lemburJam: 0,
        lemburTarifPerJam: 50000,
        lemburNominal: 0,
        bonusInsentif: 0,
        pinjamanCicilan: 0,
        pinjamanTotalSisa: 0,
        potonganAbsensi: 0,
        potonganHariAbsen: 0,
        potonganLainDenda: 0,
        potonganBpjsKetenagakerjaan: Math.round(gajiPokok * 0.02),
        potonganBpjsKesehatan: Math.round(gajiPokok * 0.01),
        potonganLainPPh: Math.round(gajiPokok * 0.025),
        totalGajiKotor: gajiPokok + Math.round(gajiPokok * 0.2) + 1500000,
        totalPotongan: Math.round(gajiPokok * 0.055),
        totalGajiBersih: Math.round(gajiPokok * 1.145) + 1500000,
        periode: 'Oktober 2026',
        statusGaji: 'Belum Dicairkan',
      },
    };

    onAddUser(newUser);
    setShowAddModal(false);
    setNotification(`Anggota baru "${newUser.nama}" (Role: ${newUser.role}) berhasil didaftarkan!`);
    setTimeout(() => setNotification(null), 3500);

    setNama('');
    setUsername('');
    setEmail('');
    setTeleponInput('');
    setJabatan('');
    setAlamatLengkap('');
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      onDeleteUser(deleteTarget.id);
      setNotification(`Akun pengguna "${deleteTarget.nama}" telah dihapus.`);
      setDeleteTarget(null);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.nama.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.jabatan.toLowerCase().includes(q) ||
      u.divisi.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-base md:text-lg font-bold text-[#1B2B4C] dark:text-white">
              Team, Role Akses &amp; Pengaturan Hak Akses Modular
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Role dibagi Admin / User / Viewer, dengan tombol centang per modul (RAB, vendor, kebutuhan belanja, keuangan, operasional, dll) yang dapat diatur oleh Admin.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-md cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#D4AF37]" />
              <span>+ Tambah Anggota Team</span>
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2.5">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama, jabatan, divisi..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-800 dark:text-white"
            />
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
            {filteredUsers.length} Personel Terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Jabatan &amp; Divisi</th>
                <th className="py-3 px-4 text-center">Role Akses</th>
                <th className="py-3 px-4">Hak Akses Modul</th>
                <th className="py-3 px-4">WhatsApp Direct</th>
                <th className="py-3 px-4 text-center">Status</th>
                {isAdmin && <th className="py-3 px-4 text-center">Pengaturan Akses</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u) => {
                const formattedPhone = formatIndonesianPhone(u.telepon);
                const isSuperAdmin = u.username === 'mulakadmin';
                const p = u.permissions || (u.role === 'admin' ? defaultAdminPermissions : defaultUserPermissions);

                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.foto}
                          alt={u.nama}
                          className="w-9 h-9 rounded-full object-cover border-2 border-[#D4AF37] shrink-0"
                        />
                        <div>
                          <strong className="font-bold text-[#1B2B4C] dark:text-white block text-xs">{u.nama}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">@{u.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-300 font-medium">
                      <span>{u.jabatan}</span>
                      <span className="block text-[10px] text-slate-400">{u.divisi}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                          u.role === 'admin'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            : u.role === 'finance'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : u.role === 'user'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-[240px]">
                      <div className="flex flex-wrap gap-1">
                        {u.role === 'admin' ? (
                          <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-bold">
                            Semua Modul Aktif (Full Admin)
                          </span>
                        ) : (
                          <>
                            {p.estimasiAnggaran && <span className="text-[9px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded font-semibold">RAB</span>}
                            {p.vendorSupplier && <span className="text-[9px] bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded font-semibold">Vendor</span>}
                            {p.operasionalLapangan && <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded font-semibold">Operasional</span>}
                            {p.keuanganProyek && <span className="text-[9px] bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-1.5 py-0.2 rounded font-semibold">Keuangan</span>}
                            {p.daftarTukang && <span className="text-[9px] bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.2 rounded font-semibold">Tukang</span>}
                            {p.portalAkuntansi && <span className="text-[9px] bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-1.5 py-0.2 rounded font-semibold">Akuntansi P&amp;L</span>}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <a
                        href={`https://wa.me/${u.telepon}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Klik chat WhatsApp"
                        className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>+62 {formattedPhone || u.telepon}</span>
                      </a>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{u.status}</span>
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenPermissions(u)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-[#1B2B4C] hover:text-white dark:bg-slate-800 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                            title="Atur Hak Akses Centang Modul"
                          >
                            <Sliders className="w-3 h-3 text-[#D4AF37]" />
                            <span>Atur Akses</span>
                          </button>
                          {!isSuperAdmin && (
                            <button
                              onClick={() => setDeleteTarget(u)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition cursor-pointer"
                              title="Hapus Anggota"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PENGATURAN HAK AKSES CENTANG (REQUESTED FEATURE) */}
      {permissionUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#D4AF37]" />
                <div>
                  <h3 className="font-bold text-base text-[#1B2B4C] dark:text-white">
                    Pengaturan Hak Akses Modul Pengguna
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Karyawan: <strong>{permissionUser.nama}</strong> ({permissionUser.role})
                  </p>
                </div>
              </div>
              <button onClick={() => setPermissionUser(null)} className="text-slate-400 text-lg cursor-pointer">
                &times;
              </button>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-800 dark:text-amber-300 text-xs">
              <p className="font-semibold">
                Centang modul yang boleh dibuka oleh {permissionUser.nama}. Modul yang tidak dicentang tidak akan tampil di sidebar.
              </p>
            </div>

            {/* Checkbox Modular Matrix */}
            <div className="space-y-2 text-xs">
              {[
                { key: 'dashboardProyek', label: 'Dashboard Proyek' },
                { key: 'estimasiAnggaran', label: 'Estimasi Anggaran (RAB & BoQ)' },
                { key: 'vendorSupplier', label: 'Vendor & Supplier' },
                { key: 'operasionalLapangan', label: 'Operasional Lapangan & PO Belanja' },
                { key: 'daftarTukang', label: 'Daftar Tukang & Penggajian Tukang' },
                { key: 'keuanganProyek', label: 'Keuangan & Input Jurnal Cashflow' },
                { key: 'planningProgress', label: 'Kurva S & Planning Progress' },
                { key: 'mutualCheckQC', label: 'Mutual Check & QC Pre-BAST' },
                { key: 'dokumenArsip', label: 'Dokumen Resmi & Cetak PDF' },
                { key: 'onboardingKlien', label: 'Formulir Onboarding Klien' },
                { key: 'penggajianKaryawan', label: 'Penggajian Karyawan (Payroll)' },
                { key: 'portalAkuntansi', label: 'Portal Akuntansi & P&L Master' },
                { key: 'pengaturanTemplate', label: 'Pengaturan & Template Kop Surat' },
              ].map((item) => {
                const isChecked = tempPermissions[item.key as keyof UserPermissions];
                return (
                  <label
                    key={item.key}
                    onClick={() => handleTogglePermission(item.key as keyof UserPermissions)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      isChecked
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold'
                        : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{item.label}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPermissionUser(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-5 py-2 bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-blue-600 text-white rounded-xl font-bold shadow-md cursor-pointer"
              >
                Simpan Pengaturan Hak Akses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH USER / ANGGOTA TEAM BARU */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-sm md:text-base text-[#1B2B4C] dark:text-white">
                  Pendaftaran Karyawan / Pengguna Baru
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 text-lg cursor-pointer">
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Budi Santoso, S.T."
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Username / ID Login</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="budisantoso"
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Role Utama</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none font-semibold text-[#1B2B4C] dark:text-blue-400"
                  >
                    <option value="admin">Admin (Akses Penuh)</option>
                    <option value="user">User (Staf Pelaksana Terpilih)</option>
                    <option value="viewer">Viewer (Hanya Melihat)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={teleponInput}
                    onChange={handlePhoneChange}
                    placeholder="821 - 9999 - 9999"
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg font-mono outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Jabatan Resmi</label>
                  <input
                    type="text"
                    required
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    placeholder="Site Project Manager"
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Gaji Pokok Bulanan (Rp)</label>
                  <input
                    type="number"
                    min="1000000"
                    step="100000"
                    required
                    value={gajiPokok}
                    onChange={(e) => setGajiPokok(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Lengkap Domisili Karyawan
                </label>
                <input
                  type="text"
                  required
                  value={alamatLengkap}
                  onChange={(e) => setAlamatLengkap(e.target.value)}
                  placeholder="Jl. Gedebage No. 12, Buahbatu, Bandung"
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B2B4C] hover:bg-[#111C33] dark:bg-blue-600 text-white rounded-xl font-semibold shadow-md cursor-pointer"
                >
                  Daftarkan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-sm text-[#1B2B4C] dark:text-white">Hapus Akun Karyawan?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Apakah Anda yakin ingin menghapus akun <strong>{deleteTarget.nama}</strong> (@{deleteTarget.username})?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
