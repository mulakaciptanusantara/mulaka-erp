/**
 * Utility functions for Indonesian Rupiah, Phone Number formatting with auto-dash (+62 821 - 9999 - 9999),
 * and standard categorizations.
 */

export function formatRupiahDisplay(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(Number(value))) return 'Rp 0';
  return 'Rp ' + Math.round(Number(value)).toLocaleString('id-ID');
}

export function formatRupiahInputValue(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(Number(value)) || Number(value) === 0) {
    return '';
  }
  return 'Rp ' + Math.round(Number(value)).toLocaleString('id-ID');
}

export function parseRupiahInput(value: string): number {
  if (!value) return 0;
  const digitsOnly = value.replace(/\D/g, '');
  if (!digitsOnly) return 0;
  const parsed = parseInt(digitsOnly, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatIndonesianPhone(input: string): string {
  let clean = input.replace(/\D/g, '');
  if (clean.startsWith('62')) clean = clean.substring(2);
  else if (clean.startsWith('0')) clean = clean.substring(1);

  let formatted = '';
  if (clean.length > 0) {
    formatted += clean.substring(0, 3);
  }
  if (clean.length > 3) {
    formatted += ' - ' + clean.substring(3, 7);
  }
  if (clean.length > 7) {
    formatted += ' - ' + clean.substring(7, 11);
  }
  if (clean.length > 11) {
    formatted += ' - ' + clean.substring(11, 14);
  }
  return formatted;
}

export function cleanPhoneForWhatsApp(input: string): string {
  let clean = input.replace(/\D/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.substring(1);
  } else if (!clean.startsWith('62')) {
    clean = '62' + clean;
  }
  return clean || '628211801005';
}

export const TRANSACTION_CATEGORIES = [
  'Bahan Material Konstruksi',
  'Bahan Material Furniture',
  'Upah Pekerja - Konstruksi',
  'Upah Pekerja - Furniture',
  'Upah Pekerja - Las & Allumunium',
  'Kas Masuk',
  'Operasional & Logistik',
  'Operasional Kantor',
  'Advertising & Endorsment',
  'Aksesoris & Peralatan',
  'Inventaris Kantor',
  'Inventaris Proyek',
  'Fee Sales & Marketing',
  'Gajih Karyawan',
  'Upah Tukang Mingguan / Borongan',
  'Listrik & Internet',
  'Lain Lain',
] as const;

export const PROYEK_JENIS_PEKERJAAN_OPTIONS = [
  'Jasa Desain Arsitektur',
  'Jasa Desain Interior',
  'Jasa Perhitungan RAB',
  'Jasa Reovasi Kecil',
  'Jasa Renovasi Besar',
  'Jasa Pembangunan Rumah Sederhana',
  'Jasa Pembangunan Rumah Mewah',
  'Jasa Pembangunan Gedung & Kantor',
  'Jasa Pembangunan Gudang & Pabrik',
] as const;
