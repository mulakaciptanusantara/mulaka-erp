import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Phone, 
  MapPin, 
  CreditCard, 
  ExternalLink, 
  MessageCircle, 
  CheckCircle2, 
  X,
  Filter,
  Package,
  Layers,
  Building2,
  Calendar
} from 'lucide-react';
import { MulakaEmblem } from '../common/MulakaLogo';

export interface VendorSupplierItem {
  id: string;
  nama: string;
  kategori: 'Material Struktur & Pasir/Batu' | 'Bahan Furniture Mulaka Livin' | 'Keramik & Granit' | 'Cat & Finishing' | 'MEP & Sanitair' | 'Besi & Hollow' | 'Subkon Spesialis';
  kontakPerson: string;
  noHp: string;
  alamatToko: string;
  kota: string;
  namaBank?: string;
  nomorRekening?: string;
  atasNama?: string;
  syaratPembayaran: 'Cash on Delivery (COD)' | 'Tempo 7 Hari' | 'Tempo 14 Hari' | 'Tempo 30 Hari' | 'DP 50% & Pelunasan';
  rating: number;
  catatan?: string;
}

const initialVendors: VendorSupplierItem[] = [
  {
    id: 'v-1',
    nama: 'TB. Sinar Jaya Abadi',
    kategori: 'Material Struktur & Pasir/Batu',
    kontakPerson: 'Ko Hendra',
    noHp: '628122334455',
    alamatToko: 'Jl. Soekarno Hatta No. 450, Bandung',
    kota: 'Bandung',
    namaBank: 'Bank BCA',
    nomorRekening: '283-1122-334',
    atasNama: 'Hendra Setiawan',
    syaratPembayaran: 'Tempo 14 Hari',
    rating: 5,
    catatan: 'Supplier semen Gresik, pasir pasang Galunggung, hebel, dan bata merah jumbo.',
  },
  {
    id: 'v-2',
    nama: 'Toko Sumber Multiplek & HPL Livin',
    kategori: 'Bahan Furniture Mulaka Livin',
    kontakPerson: 'Ibu Yenny',
    noHp: '628198877665',
    alamatToko: 'Jl. Jamika No. 112, Bandung',
    kota: 'Bandung',
    namaBank: 'Bank Mandiri',
    nomorRekening: '131-00-887766-1',
    atasNama: 'PT Sumber Livin Makmur',
    syaratPembayaran: 'Tempo 30 Hari',
    rating: 5,
    catatan: 'Penyedia multiplek meranti 18mm, HPL Taco/Aica, lem kuning Aica Aibon, dan edging PVC.',
  },
  {
    id: 'v-3',
    nama: 'CV. Baja Mandiri Perkasa',
    kategori: 'Besi & Hollow',
    kontakPerson: 'Pak Didin',
    noHp: '628211998877',
    alamatToko: 'Kawasan Industri Gedebage No. 18, Bandung',
    kota: 'Bandung',
    namaBank: 'Bank BCA',
    nomorRekening: '775-098-1122',
    atasNama: 'Didin Wahyudin',
    syaratPembayaran: 'Cash on Delivery (COD)',
    rating: 4,
    catatan: 'Besi beton SNI Ulir D10, D13, D16, hollow galvanis, dan plat strip.',
  },
  {
    id: 'v-4',
    nama: 'Depo Granit & Sanitair Utama',
    kategori: 'Keramik & Granit',
    kontakPerson: 'Pak Jimmy',
    noHp: '628132211440',
    alamatToko: 'Jl. Peta No. 204, Bojongloa Kaler, Bandung',
    kota: 'Bandung',
    namaBank: 'Bank BCA',
    nomorRekening: '008-992-1200',
    atasNama: 'Jimmy Santoso',
    syaratPembayaran: 'DP 50% & Pelunasan',
    rating: 5,
    catatan: 'Granit tile 60x60, 60x120 glazed polished, kloset duduk Toto, shower mixer.',
  },
];

export const ProyekVendorSupplierView: React.FC = () => {
  const [vendors, setVendors] = useState<VendorSupplierItem[]>(() => {
    const saved = localStorage.getItem('mulaka_vendors');
    return saved ? JSON.parse(saved) : initialVendors;
  });

  const [search, setSearch] = useState('');
  const [filterKat, setFilterKat] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorSupplierItem | null>(null);

  // Form State
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState<VendorSupplierItem['kategori']>('Material Struktur & Pasir/Batu');
  const [kontakPerson, setKontakPerson] = useState('');
  const [noHp, setNoHp] = useState('');
  const [alamatToko, setAlamatToko] = useState('');
  const [kota, setKota] = useState('Bandung');
  const [namaBank, setNamaBank] = useState('Bank BCA');
  const [nomorRekening, setNomorRekening] = useState('');
  const [atasNama, setAtasNama] = useState('');
  const [syaratPembayaran, setSyaratPembayaran] = useState<VendorSupplierItem['syaratPembayaran']>('Tempo 14 Hari');
  const [catatan, setCatatan] = useState('');

  const saveToStorage = (data: VendorSupplierItem[]) => {
    setVendors(data);
    localStorage.setItem('mulaka_vendors', JSON.stringify(data));
  };

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setNama('');
    setKategori('Material Struktur & Pasir/Batu');
    setKontakPerson('');
    setNoHp('');
    setAlamatToko('');
    setKota('Bandung');
    setNamaBank('Bank BCA');
    setNomorRekening('');
    setAtasNama('');
    setSyaratPembayaran('Tempo 14 Hari');
    setCatatan('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: VendorSupplierItem) => {
    setEditingVendor(v);
    setNama(v.nama);
    setKategori(v.kategori);
    setKontakPerson(v.kontakPerson);
    setNoHp(v.noHp);
    setAlamatToko(v.alamatToko);
    setKota(v.kota);
    setNamaBank(v.namaBank || 'Bank BCA');
    setNomorRekening(v.nomorRekening || '');
    setAtasNama(v.atasNama || '');
    setSyaratPembayaran(v.syaratPembayaran);
    setCatatan(v.catatan || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVendor) {
      const updated = vendors.map(v => v.id === editingVendor.id ? {
        ...v,
        nama,
        kategori,
        kontakPerson,
        noHp,
        alamatToko,
        kota,
        namaBank,
        nomorRekening,
        atasNama,
        syaratPembayaran,
        catatan
      } : v);
      saveToStorage(updated);
    } else {
      const newV: VendorSupplierItem = {
        id: `ven-${Date.now()}`,
        nama,
        kategori,
        kontakPerson,
        noHp,
        alamatToko,
        kota,
        namaBank,
        nomorRekening,
        atasNama,
        syaratPembayaran,
        rating: 5,
        catatan
      };
      saveToStorage([newV, ...vendors]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus data supplier/vendor ini?')) {
      const updated = vendors.filter(v => v.id !== id);
      saveToStorage(updated);
    }
  };

  const handleWhatsApp = (v: VendorSupplierItem) => {
    const text = `Halo ${v.kontakPerson} (${v.nama}), kami dari Manajemen Pengadaan Proyek PT. Mulaka Cipta Nusantara ingin menanyakan stok material dan update penawaran harga terbaru.`;
    window.open(`https://api.whatsapp.com/send?phone=${v.noHp}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const filtered = vendors.filter(v => {
    const matchSearch = v.nama.toLowerCase().includes(search.toLowerCase()) ||
      v.kontakPerson.toLowerCase().includes(search.toLowerCase()) ||
      v.alamatToko.toLowerCase().includes(search.toLowerCase());
    const matchKat = filterKat === 'Semua' || v.kategori === filterKat;
    return matchSearch && matchKat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <MulakaEmblem variant="gold" size={36} />
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-6 h-6 text-amber-500" />
              Direktori Vendor & Supplier Mulaka
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Mitra Toko Bangunan, Produsen Pasir/Batu, Besi SNI, Multiplek & HPL Livin, dan Subkon Terpercaya
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Vendor Baru
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama toko, kontak, atau lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          {['Semua', 'Material Struktur & Pasir/Batu', 'Bahan Furniture Mulaka Livin', 'Besi & Hollow', 'Keramik & Granit'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterKat(cat)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
                filterKat === cat
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Vendors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((v) => (
          <div
            key={v.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {v.kategori}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {v.syaratPembayaran}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                {v.nama}
              </h3>

              <div className="space-y-1.5 mt-3 text-xs text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium w-16">PIC:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{v.kontakPerson}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium w-16">No HP/WA:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{v.noHp}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-slate-400 font-medium w-16 flex-shrink-0">Alamat:</span>
                  <span className="line-clamp-2">{v.alamatToko}, {v.kota}</span>
                </p>
                {v.nomorRekening && (
                  <p className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>{v.namaBank} {v.nomorRekening} (a.n {v.atasNama})</span>
                  </p>
                )}
                {v.catatan && (
                  <p className="mt-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-[11px] text-slate-500 dark:text-slate-400">
                    {v.catatan}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleWhatsApp(v)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Chat WhatsApp
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(v)}
                  className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  title="Edit Data"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                  title="Hapus Supplier"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {editingVendor ? 'Edit Data Vendor / Supplier' : 'Tambah Vendor / Supplier Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Toko / Perusahaan Supplier
                  </label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: TB. Mulia Abadi"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Material
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Material Struktur & Pasir/Batu">Material Struktur & Pasir/Batu</option>
                    <option value="Bahan Furniture Mulaka Livin">Bahan Furniture Mulaka Livin</option>
                    <option value="Keramik & Granit">Keramik & Granit</option>
                    <option value="Cat & Finishing">Cat & Finishing</option>
                    <option value="MEP & Sanitair">MEP & Sanitair</option>
                    <option value="Besi & Hollow">Besi & Hollow</option>
                    <option value="Subkon Spesialis">Subkon Spesialis</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Kontak Person (PIC)
                  </label>
                  <input
                    type="text"
                    required
                    value={kontakPerson}
                    onChange={(e) => setKontakPerson(e.target.value)}
                    placeholder="Contoh: Pak Hendra"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    required
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="Contoh: 62812345678"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alamat Lengkap Toko / Gudang
                  </label>
                  <input
                    type="text"
                    required
                    value={alamatToko}
                    onChange={(e) => setAlamatToko(e.target.value)}
                    placeholder="Jl. Soekarno Hatta..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kota / Wilayah
                  </label>
                  <input
                    type="text"
                    value={kota}
                    onChange={(e) => setKota(e.target.value)}
                    placeholder="Bandung"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bank
                  </label>
                  <input
                    type="text"
                    value={namaBank}
                    onChange={(e) => setNamaBank(e.target.value)}
                    placeholder="BCA"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    No Rekening
                  </label>
                  <input
                    type="text"
                    value={nomorRekening}
                    onChange={(e) => setNomorRekening(e.target.value)}
                    placeholder="8105..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Atas Nama Rekening
                  </label>
                  <input
                    type="text"
                    value={atasNama}
                    onChange={(e) => setAtasNama(e.target.value)}
                    placeholder="Nama Pemilik"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Syarat & Ketentuan Pembayaran (Term of Payment)
                </label>
                <select
                  value={syaratPembayaran}
                  onChange={(e) => setSyaratPembayaran(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                  <option value="Tempo 7 Hari">Tempo 7 Hari</option>
                  <option value="Tempo 14 Hari">Tempo 14 Hari</option>
                  <option value="Tempo 30 Hari">Tempo 30 Hari</option>
                  <option value="DP 50% & Pelunasan">DP 50% & Pelunasan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Khusus / Spesifikasi Produk
                </label>
                <textarea
                  rows={3}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Catatan material, diskon khusus Mulaka, atau jam operasional gudang..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm"
                >
                  Simpan Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
