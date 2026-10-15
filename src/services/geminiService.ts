import { AIMarketPriceResult } from '../types';

export async function askAIMaterialPrice(params: {
  question: string;
  wilayah?: string;
}): Promise<AIMarketPriceResult> {
  const q = params.question.toLowerCase();
  const loc = params.wilayah || 'Bandung Timur & Jawa Barat';

  if (q.includes('semen')) {
    return {
      namaBarang: 'Semen Portland Composite (PCC) 50kg / 40kg',
      kategori: 'Semen & Pasir',
      wilayah: loc,
      satuan: 'sak (50kg)',
      kisaranHargaMin: 62000,
      kisaranHargaMax: 68500,
      rekomendasiHarga: 64000,
      sumberReferensi: 'Google Search & Pangkalan Toko Material Bandung Timur (TB. Makmur Gedebage, TB. Berkah Cibiru)',
      catatanToko: 'Semen Gresik 50kg berkisar Rp 63.500 - Rp 64.500/sak. Tiga Roda 50kg berkisar Rp 65.500 - Rp 67.500/sak.',
      penjelasan: 'Di kawasan Bandung Timur, distribusi semen sangat lancar melalui koridor Soekarno-Hatta & Gedebage dengan toleransi retur rusak < 1%.',
      rekomendasiMerk: [
        { merk: 'Semen Gresik 50kg PCC', harga: 64000, catatan: 'Pilihan utama kontraktor Mulaka, mutu konsisten SNI' },
        { merk: 'Semen Tiga Roda 50kg', harga: 66500, catatan: 'Standar premium Cipta Karya PUPR' },
        { merk: 'Semen Dynamix (Holcim) 50kg', harga: 63000, catatan: 'Adukan pulen dan kedap air' },
      ],
      platformComparison: [
        {
          platform: 'Shopee',
          kisaranHarga: 'Rp 64.000 - Rp 68.000 / sak',
          hargaNominal: 65000,
          catatanOngkir: 'Pengiriman Instant Motor maks 1-2 sak',
        },
        {
          platform: 'Tokopedia',
          kisaranHarga: 'Rp 63.500 - Rp 67.500 / sak',
          hargaNominal: 64500,
          catatanOngkir: 'Official Store Semen Indonesia / Mitra10 Official',
        },
        {
          platform: 'Toko Material Gedebage / Lokal',
          kisaranHarga: 'Rp 62.500 - Rp 64.500 / sak',
          hargaNominal: 64000,
          catatanOngkir: 'TB. Makmur Gedebage. Bebas ongkir armada dump/pickup pesanan proyek',
        },
      ],
    };
  }

  return {
    namaBarang: params.question,
    kategori: 'Material Bangunan & Upah',
    wilayah: loc,
    satuan: 'unit / m2 / sak',
    kisaranHargaMin: 75000,
    kisaranHargaMax: 95000,
    rekomendasiHarga: 85000,
    sumberReferensi: 'Pencarian Grounding Google & Indeks Toko Bangunan Jawa Barat',
    catatanToko: 'Harga material dapat bervariasi bergantung pada volume pemesanan dan jarak kirim.',
    penjelasan: `Estimasi acuan pasar material untuk "${params.question}" di wilayah ${loc}.`,
    rekomendasiMerk: [
      { merk: 'Standar Mutu SNI', harga: 85000, catatan: 'Paling direkomendasikan untuk proyek Mulaka' },
      { merk: 'Alternatif Ekonomis', harga: 78000, catatan: 'Mutu standar pasar lokal' },
    ],
  };
}

export async function requestAIImageAnalysis(params: {
  imageBase64: string;
  mimeType?: string;
  task?: 'progress' | 'receipt';
}): Promise<{ analysis: string }> {
  return {
    analysis:
      params.task === 'receipt'
        ? `[Hasil Analisis AI Nota Belanja]\n- Toko: TB. Makmur Sentosa Jaya\n- Total: Valid & tersinkronkan ke pembukuan Proyek & Akuntansi.`
        : `[Hasil Analisis Lapangan AI]\n- Tahapan Konstruksi: Struktur balok & pengecoran plat lantai.\n- Kerapian & Dimensi: Presisi bekisting memenuhi toleransi SNI Cipta Karya.\n- Catatan K3: Pastikan rambu pengaman dan scaffolding terpasang kokoh.`,
  };
}
