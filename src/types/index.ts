export type UserRole = 'admin' | 'finance' | 'user' | 'viewer';

export interface UserPermissions {
  dashboardProyek: boolean;
  teamAkses: boolean;
  proyekKlien: boolean;
  estimasiAnggaran: boolean;
  keuanganProyek: boolean;
  operasionalLapangan: boolean;
  planningProgress: boolean;
  mutualCheckQC: boolean;
  dokumenArsip: boolean;
  vendorSupplier: boolean;
  daftarTukang: boolean;
  penggajianKaryawan: boolean;
  onboardingKlien: boolean;
  pengaturanTemplate: boolean;
  portalAkuntansi: boolean;
}

export interface GajiDetail {
  gajiPokok: number;
  tunjanganJabatan: number;
  tunjanganTransportMakan: number;
  lemburJam: number;
  lemburTarifPerJam: number;
  lemburNominal: number;
  bonusInsentif: number;
  pinjamanCicilan: number;
  pinjamanTotalSisa: number;
  potonganAbsensi: number;
  potonganHariAbsen?: number;
  potonganLainDenda: number;
  potonganKeterangan?: string;
  potonganBpjsKetenagakerjaan: number;
  potonganBpjsKesehatan: number;
  potonganLainPPh: number;
  totalGajiKotor: number;
  totalPotongan: number;
  totalGajiBersih: number;
  periode: string;
  statusGaji: 'Belum Dicairkan' | 'Sudah Ditransfer';
  tanggalPencairan?: string;
  noSlipGaji?: string;
}

export interface User {
  id: string;
  username: string;
  nama: string;
  email: string;
  telepon: string;
  jabatan: string;
  divisi: string;
  role: UserRole;
  status: 'Aktif' | 'Nonaktif';
  foto: string;
  alamatLengkap: string;
  kotaDomisili: string;
  nikKtp: string;
  npwp: string;
  namaBank: string;
  nomorRekeningBank: string;
  statusKepegawaian: 'Karyawan Tetap' | 'Kontrak' | 'Harian Proyek' | 'Direksi';
  tanggalBergabung: string;
  kontakDarurat: string;
  gaji: GajiDetail;
  permissions?: UserPermissions;
}

export type SubDivisiPelaksana =
  | 'General Contractor'
  | 'Tempat Tinggal Studio'
  | 'Mulaka Livin'
  | 'Mulaka Property';

export interface Project {
  id: string;
  nama_proyek: string;
  nama_klien: string;
  kontak: string;
  alamat: string;
  kota?: string;
  sub_divisi: SubDivisiPelaksana;
  jenis: string;
  status: 'Aktif' | 'Selesai' | 'Tertunda';
  thumbnail: string;
  nilai: number;
  dp: number;
  t1: number;
  t2: number;
  t3: number;
  sisa: number;
  tanggal_mulai: string;
  estimasi_selesai: string;
  progress: number;
  driveFolderId?: string;
  kurvaSMingguan?: { [minggu: number]: number };
  luasTanah?: number;
  luasBangunan?: number;
  referensiFotoLama?: string;
  referensiFotoImpian?: string;
  pilihanJasa?: string;
  tandaTanganKlien?: string;
  tandaTanganKonsultan?: string;
}

export interface CashflowItem {
  id: string;
  hari: string;
  tanggal: string;
  proyek: string;
  proyekId?: string;
  kategori: string;
  toko: string;
  qty: number;
  satuan: string;
  pemasukan: number;
  pengeluaran: number;
  saldo: number;
  keterangan: string;
  akunKasBank?: string;
  syncToAccounting?: boolean;
}

export interface AHSPTenagaKerja {
  tipe: 'Pekerja' | 'Tukang' | 'Kepala Tukang' | 'Mandor';
  koefisien: number;
  satuan: 'OH';
  upah: number;
  jumlah: number;
}

export interface AHSPBahan {
  nama: string;
  spesifikasi: string;
  koefisien: number;
  satuan: string;
  harga: number;
  jumlah: number;
}

export interface AHSPPeralatan {
  nama: string;
  koefisien: number;
  satuan: string;
  harga: number;
  jumlah: number;
}

export interface AHSPItemMaster {
  id: string;
  kode: string;
  kelompok:
    | 'I. PEKERJAAN PERSIAPAN'
    | 'II. TANAH & PONDASI'
    | 'III. STRUKTUR BETON & PEMBESIAN'
    | 'IV. PASANGAN DINDING & PLESTERAN'
    | 'V. KUSEN, PINTU & JENDELA'
    | 'VI. ATAP & PLAFON'
    | 'VII. FINISHING, LANTAI & KERAMIK'
    | 'VIII. MEKANIKAL, ELEKTRIKAL & PLUMBING'
    | 'IX. INTERIOR & CUSTOM FURNITURE';
  namaPekerjaan: string;
  satuan: string;
  tenagaKerja: AHSPTenagaKerja[];
  bahanMaterial: AHSPBahan[];
  peralatan: AHSPPeralatan[];
  totalUpah: number;
  totalBahan: number;
  totalAlat: number;
  totalHsp: number;
}

export type AHSPCategory = 'AHSP SNI' | 'AHSP Internal' | 'Lumpsum' | 'Furniture Custom';

export interface RABItem {
  id: string;
  kategori: string;
  uraian: string;
  spesifikasiBahan?: string;
  tipeAHSP?: AHSPCategory;
  kodeAHSP?: string;
  volume: number;
  satuan: string;
  hargaSatuan: number;
  total: number;
  bobotPercent?: number;
  ahspDetail?: AHSPItemMaster;
}

export interface RABProject {
  id: string;
  namaProyek: string;
  klien: string;
  lokasi: string;
  tanggal: string;
  overheadProfitPercent: number;
  ppnPercent: number;
  items: RABItem[];
}

export interface BaseMaterialPrice {
  id: string;
  kode?: string;
  nama: string;
  spesifikasi: string;
  kategori: string;
  satuan: string;
  hargaDasar: number;
  wilayah: string;
  supplier?: string;
  terakhirDiupdate?: string;
  catatan?: string;
}

export interface BaseWageRate {
  id: string;
  profesi: 'Pekerja / Kenek' | 'Tukang Batu' | 'Tukang Besi' | 'Tukang Kayu' | 'Kepala Tukang' | 'Mandor' | 'Tukang Cat' | 'Tukang Listrik / Plambing';
  satuan: 'OH' | 'Jam';
  upahDasar: number;
  wilayah: string;
  keterangan: string;
  terakhirDiupdate?: string;
}

export interface AIMarketPriceResult {
  namaBarang: string;
  kategori: string;
  wilayah: string;
  satuan: string;
  kisaranHargaMin: number;
  kisaranHargaMax: number;
  rekomendasiHarga: number;
  sumberReferensi: string;
  catatanToko: string;
  penjelasan: string;
  rekomendasiMerk: { merk: string; harga: number; catatan: string }[];
  platformComparison?: {
    platform: string;
    kisaranHarga: string;
    hargaNominal: number;
    catatanOngkir: string;
  }[];
}

export type QCItemStatus = 'Passed' | 'Minor Defect' | 'Major Defect' | 'Pending';

export interface QCInspectionItem {
  id: string;
  kategori: string;
  uraianPemeriksaan: string;
  standarToleransi: string;
  status: QCItemStatus;
  catatanTemuan: string;
  fotoTemuan?: string;
}

export interface MutualCheckRecord {
  id: string;
  tipe: 'MC-0 (Awal Proyek)' | 'MC-50 (Pertengahan)' | 'MC-100 (Akhir / Sebelum BAST)' | 'QC Berkala';
  proyekId: string;
  namaProyek: string;
  namaKlien: string;
  nomorDokumen: string;
  tanggalPemeriksaan: string;
  pengawasPM: string;
  perwakilanKlien: string;
  skorKelayakan: number;
  statusKelayakan: 'Layak BAST' | 'Perbaikan Wajib (Punchlist)' | 'Dalam Proses';
  items: QCInspectionItem[];
  catatanUmum: string;
  tandaTanganPelaksana?: string;
  tandaTanganKlien?: string;
}

export interface QCTemplateItem {
  id: string;
  kategori: string;
  uraianPemeriksaan: string;
  standarToleransi: string;
}

export interface WeeklyMaterialPOItem {
  id: string;
  namaMaterial: string;
  volume: number;
  satuan: string;
  estimasiHarga: number;
  total: number;
}

export interface WeeklyMaterialPO {
  id: string;
  nomorPO: string;
  proyekId: string;
  namaProyek: string;
  mingguKe: number;
  tanggalRencana: string;
  supplier: string;
  status: 'Draft' | 'Disetujui PM' | 'PO Terbit' | 'Diterima di Proyek';
  items: WeeklyMaterialPOItem[];
  totalBiaya: number;
  catatan?: string;
  sudahTerbeli?: boolean;
}

export interface DailyReport {
  id: string;
  tanggal: string;
  proyekId: string;
  namaProyek: string;
  cuacaPagi: 'Cerah' | 'Hujan' | 'Mendung';
  cuacaSiang: 'Cerah' | 'Hujan' | 'Mendung';
  tenagaKerja: {
    mandor: number;
    tukang: number;
    kenek: number;
    subkon?: number;
  };
  pekerjaanHariIni: string[];
  kendala: string;
  materialMasuk: string;
  progresKumulatif: number;
  pengawas: string;
  fotoDokumentasi?: string[];
}

export interface ProjectDocument {
  id: string;
  proyekId: string;
  namaProyek: string;
  jenisDokumen: 'PKS' | 'SPK' | 'Invoice' | 'Berita Acara' | 'Mutual Check (MC)' | 'Quality Control (QC)' | 'BAST' | 'Laporan Manajemen' | 'Slip Gaji' | 'Slip Tukang' | 'Form Onboarding';
  nomorSurat: string;
  tanggal: string;
  nilaiKontrak?: number;
  status: 'Draft' | 'Diterbitkan' | 'Ditandatangani' | 'Selesai';
  konten?: string;
  driveUrl?: string;
}

export interface KopSuratTemplate {
  id: string;
  jenisDokumen: 'BoQ' | 'PKS' | 'SPK' | 'Invoice' | 'BAST' | 'Slip Gaji' | 'Mutual Check' | 'Quality Control' | 'Laporan Keuangan';
  namaPerusahaan: string;
  tagline: string;
  subHeader: string;
  alamat: string;
  telepon: string;
  email: string;
  garisWarna: string;
}

export interface CoverSuratTemplate {
  enableCover: boolean;
  theme: 'navy-gold' | 'minimalist' | 'classic' | 'custom-image';
  judulUtama: string;
  instansi: string;
  catatanKerahasiaan: string;
  backgroundUrl?: string;
  logoUrl?: string;
}

export interface VendorSupplierItem {
  id: string;
  tipe: 'Supplier Material' | 'Kontraktor Subkon' | 'Vendor Peralatan';
  namaPerusahaan: string;
  kontakPerson: string;
  telepon: string;
  email: string;
  alamat: string;
  kategoriBahan: string[];
  rating: number;
  status: 'Mitra Aktif' | 'Pending Review';
  penawaranTerakhir?: string;
}

export type AccountCategory =
  | 'Aset Lancar'
  | 'Aset Tetap'
  | 'Kewajiban Jangka Pendek'
  | 'Kewajiban Jangka Panjang'
  | 'Ekuitas'
  | 'Pendapatan Proyek'
  | 'Pendapatan Lainnya'
  | 'Beban Pokok Pendapatan (HPP)'
  | 'Beban Operasional'
  | 'Beban Lain-Lain';

export interface ChartOfAccount {
  id: string;
  kode: string;
  nama: string;
  kategori: AccountCategory;
  tipe: 'Aset' | 'Kewajiban' | 'Ekuitas' | 'Pendapatan' | 'HPP' | 'Beban';
  saldoNormal: 'Debit' | 'Kredit';
  saldo: number;
}

export interface JournalLine {
  akunId: string;
  akunKode: string;
  akunNama: string;
  debit: number;
  kredit: number;
}

export interface JournalEntry {
  id: string;
  noBukti: string;
  tanggal: string;
  refProyekId?: string;
  refProyekNama?: string;
  keterangan: string;
  lines: JournalLine[];
  status: 'Posted' | 'Draft';
  source: 'Proyek Cashflow' | 'Manual' | 'Invoice' | 'Penyesuaian' | 'Tutup Buku' | 'Payroll Gaji' | 'Upah Tukang';
}

export interface KasBankItem {
  id: string;
  nama: string;
  tipe: 'Kas Kecil' | 'Kas Besar' | 'Bank BCA' | 'Bank Mandiri' | 'Bank BRI' | 'Bank BNI' | 'Bank BSI' | 'Bank Lainnya';
  nomorRekening: string;
  atasNama: string;
  saldo: number;
  catatan?: string;
}

export interface HutangPiutangRecord {
  id: string;
  tipe: 'Piutang Klien' | 'Hutang Supplier / Subkon' | 'Hutang Tukang';
  entitasNama: string;
  proyekNama: string;
  noFaktur: string;
  tanggal: string;
  jatuhTempo: string;
  nominal: number;
  terbayar: number;
  sisa: number;
  status: 'Lancar' | 'Jatuh Tempo' | 'Lunas';
  agingHari: number;
}

export interface AsetTetapItem {
  id: string;
  kodeAset: string;
  namaAset: string;
  kategori: 'Peralatan Konstruksi' | 'Mesin Workshop Furniture' | 'Kendaraan Operasional' | 'Inventaris Kantor';
  tanggalPerolehan: string;
  hargaPerolehan: number;
  umurEkonomisTahun: number;
  nilaiResidu: number;
  penyusutanPerBulan: number;
  akumulasiPenyusutan: number;
  nilaiBuku: number;
}

// Exact Mulaka P&L structure as per image.png
export interface MulakaPnLStructure {
  // PENDAPATAN
  jasaPenjualanDesainArsitekturInterior: number;
  jasaCustomFurniture: number;
  jasaKonstruksi: number;
  totalPendapatan: number;
  
  // HPP
  potonganKomisiFeeMarketing: number;
  biayaMaterialUpahProyekLangsung: number;
  totalHPP: number;
  
  labaKotor: number;
  
  // BIAYA OPERASIONAL
  bebanGajiDireksi: number;
  bebanGajiKaryawan: number;
  bebanBpjsKS: number;
  bebanBonusTHR: number;
  bebanAdvertising: number;
  bebanVisitSiteProject: number;
  bebanKendaraanOperasionalDireksi: number;
  bebanPemeliharaanInventarisKantor: number;
  bebanSewaKantor: number;
  bebanSewaSistemSoftware: number;
  bebanRumahTanggaKantor: number;
  bebanListrik: number;
  bebanInternet: number;
  bebanAlatTulisKantor: number;
  bebanManagementFee: number;
  bebanPpn: number;
  bebanPenyesuaian: number;
  totalBiayaOperasional: number;
  
  // LABA BERSIH
  labaBersihNetProfit: number;
}

export interface PnLBudgetMonthlyTarget {
  bulan: number;
  targetPendapatan: number;
  targetHPP: number;
  targetBebanOperasional: number;
}

export interface PosBiayaOperasionalBudget {
  id: string;
  nama: string;
  targetTahunan: number;
  kategori?: string;
}

export interface PnLBudgetAnnual {
  tahun: number;
  targetPendapatanTahunan: number;
  targetHPPTahunan: number;
  targetBebanOperasionalTahunan: number;
  targetLabaBersihTahunan: number;
  monthlyBreakdown: PnLBudgetMonthlyTarget[];
  posBiayaOperasional?: PosBiayaOperasionalBudget[];
}

export interface DivisionFurnitureUnitBudget {
  id: string;
  namaItem: string;
  satuan: 'm1' | 'm2' | 'unit';
  budgetBahanBakuPerUnit: number;
  budgetUpahTukangPerUnit: number;
  budgetFinishingAksesorisPerUnit: number;
  totalBudgetBiayaPerUnit: number;
  targetHargaJualKlien: number;
  targetMarginRp: number;
  targetMarginPersen: number;
  volumeTargetBulanan: number;
  catatanSpesifikasi?: string;
}

export interface DivisionBudgetItem {
  id: string;
  divisi: SubDivisiPelaksana;
  targetOmsetBulanan: number;
  targetHppBulanan: number;
  targetBebanDivisi: number;
  targetLabaDivisi: number;
  unitBudgets?: DivisionFurnitureUnitBudget[];
}

export interface TutupBukuPeriod {
  id: string;
  periode: string;
  tanggalTutup: string;
  ditutupOleh: string;
  totalPendapatan: number;
  totalBeban: number;
  labaBersih: number;
  status: 'Terkunci (Final)';
}

export interface AuditTrailLog {
  id: string;
  timestamp: string;
  userNama: string;
  userRole: UserRole;
  portal: 'Portal Proyek' | 'Portal Akuntansi' | 'Pengaturan' | 'Gaji & HR' | 'Keamanan & Autentikasi' | 'Daftar Tukang' | 'Onboarding Klien';
  modul: string;
  aksi: 'Tambah' | 'Ubah' | 'Hapus' | 'Posting Jurnal' | 'Tutup Buku' | 'Export PDF' | 'Pencairan Gaji' | 'Quality Control' | 'Mutual Check' | 'Login Berhasil' | 'Login Gagal' | 'Reset Data Awal' | 'Kirim WhatsApp';
  detail: string;
  ipAddress?: string;
  perangkat?: string;
}

export interface SecurityLoginLog {
  id: string;
  timestamp: string;
  username: string;
  nama: string;
  role: string;
  status: 'Berhasil' | 'Gagal - Kata Sandi Salah' | 'Gagal - Akun Tidak Terdaftar';
  ipAddress: string;
  perangkat: string;
}

// ============ DAFTAR TUKANG MULAKA & PENGGAJIAN ============
export type SpesialisasiTukang =
  | 'Tukang Batu / Sipil'
  | 'Tukang Besi & Pembesian'
  | 'Tukang Kayu / Mebel Furniture'
  | 'Tukang Cat & Finishing'
  | 'Tukang Plafon & Partisi Gypsum'
  | 'Tukang Listrik & Plumbing'
  | 'Mandor Proyek'
  | 'Kenek / Pembantu Tukang';

export type TipeUpahTukang = 'Harian' | 'Borongan';

export interface TukangMulakaItem {
  id: string;
  nama: string;
  nikKtp: string;
  noHp: string;
  alamatAsal: string;
  spesialisasi: SpesialisasiTukang;
  tipeUpah: TipeUpahTukang;
  tarifHarianStandar: number;
  nomorRekening: string;
  namaBank: string;
  atasNamaRekening: string;
  status: 'Aktif Bekerja' | 'Standby' | 'Selesai Kontrak';
  proyekAktifId?: string;
  proyekAktifNama?: string;
  catatanKeahlian?: string;
}

export interface InvoiceGajiTukang {
  id: string;
  nomorInvoice: string;
  tanggal: string;
  tukangId: string;
  namaTukang: string;
  noHp: string;
  spesialisasi: SpesialisasiTukang;
  proyekNama: string;
  tipeUpah: TipeUpahTukang;
  // Detail Harian
  hariKerja?: number;
  tarifHarian?: number;
  jamLembur?: number;
  tarifLembur?: number;
  // Detail Borongan
  tahapPembayaran?: 'DP (Uang Muka)' | 'Termin 1 (Progress 50%)' | 'Termin 2' | 'Pelunasan (100% Selesai)';
  uraianPekerjaanBorongan?: string;
  nominalBoronganTotal?: number;
  persentaseTermin?: number;
  // Summary
  subtotal: number;
  potonganKasbon: number;
  bonusKerapian: number;
  totalGajiBersih: number;
  metodePembayaran: 'Transfer Bank BCA' | 'Transfer Bank Mandiri' | 'Kas Tunai Lapangan';
  status: 'Draft' | 'Disetujui PM' | 'Lunas Ditransfer';
  catatan?: string;
  whatsappTerkirim?: boolean;
}

// ============ CLIENT ONBOARDING FORM ============
export interface ClientOnboardingForm {
  id: string;
  tanggal: string;
  // A. Informasi Klien
  namaLengkap: string;
  noWhatsApp: string;
  email: string;
  alamatDomisili: string;
  pekerjaanInstansi: string;
  
  // B. Informasi Proyek
  namaProyek: string;
  alamatLokasiProyek: string;
  kotaProyek: string;
  luasTanahM2: number;
  luasBangunanM2: number;
  
  // C. Kebutuhan Renov / Bangun / Desain
  jenisPekerjaan: string;
  detailKebutuhanRuangan: string;
  gayaArsitekturFavorit: string;
  
  // D. Referensi Foto Lama & Impian
  fotoLamaUrl?: string;
  fotoReferensiUrl?: string;
  
  // E. Pilihan Jasa
  pilihanJasa: 'Desain Arsitektur / Interior Saja' | 'Konstruksi / Pembangunan Saja' | 'Design & Build (All-In Terpadu)' | 'Custom Furniture Mulaka Livin';
  
  // F. Budget Desain / Renov / Pembangunan
  kisaranBudget: string;
  nominalBudgetAngka: number;
  
  // G. Informasi Tambahan
  targetMulai: string;
  catatanKhusus: string;
  
  // H. Tanda Tangan
  tandaTanganKlienBase64?: string;
  tandaTanganKonsultanBase64?: string;
  
  status: 'Terkirim' | 'Diproses Menjadi Proyek' | 'Selesai Kontrak';
  linkedProjectId?: string;
}

export interface CompanyLegalitas {
  nomorNIB: string;
  nomorNPWP: string;
  nomorSIUJK: string;
  aktaNotaris: string;
  skKemenkumham: string;
  alamatKantor: string;
  alamatWorkshop: string;
}

export interface BankAccountItem {
  id: string;
  namaBank: string;
  nomorRekening: string;
  atasNama: string;
  cabang?: string;
  isUtama: boolean;
}

export interface CompanyProfile {
  nama: string;
  tagline: string;
  wa: string;
  alamat: string;
  email: string;
  instagram: string;
  bankAccounts: BankAccountItem[];
  spreadsheetId: string;
  appScriptWebhookUrl?: string;
  driveFolderId: string;
  legalitas: CompanyLegalitas;
  homepageBgUrl?: string;
  initialLaunchResetDone?: boolean;
}
