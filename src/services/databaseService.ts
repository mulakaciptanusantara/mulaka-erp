/**
 * High-performance database & caching service for Mulaka ERP
 * Uses IndexedDB for multi-megabyte persistence + fast memory caching for 0ms lag
 * Handles WhatsApp notification links & activity logging
 */
import { 
  Project, 
  CashflowItem, 
  User, 
  TukangMulakaItem, 
  InvoiceGajiTukang, 
  AuditTrailLog, 
  SecurityLoginLog,
  ClientOnboardingForm 
} from '../types';

const DB_NAME = 'MulakaERP_Database';
const DB_VERSION = 1;

class DatabaseService {
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  public async init(): Promise<void> {
    if (this.isInitialized && this.db) return;

    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        this.isInitialized = true;
        resolve();
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
        const db = (e.target as IDBOpenDBRequest).result;
        
        // Create object stores if not exist
        const stores = [
          'projects',
          'cashflow',
          'users',
          'tukang',
          'invoices_tukang',
          'audit_logs',
          'security_logs',
          'onboarding_forms'
        ];

        stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      };

      request.onsuccess = (e) => {
        this.db = (e.target as IDBOpenDBRequest).result;
        this.isInitialized = true;
        resolve();
      };

      request.onerror = () => {
        console.warn('IndexedDB unavailable, fallback to localStorage cache.');
        this.isInitialized = true;
        resolve();
      };
    });
  }

  // Generic write to IndexedDB + localStorage sync
  public async saveItem<T extends { id: string }>(storeName: string, item: T): Promise<void> {
    await this.init();
    if (!this.db) {
      try {
        const existing = JSON.parse(localStorage.getItem(`mulaka_${storeName}`) || '[]');
        const updated = [item, ...existing.filter((x: any) => x.id !== item.id)];
        localStorage.setItem(`mulaka_${storeName}`, JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return;
    }

    try {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put(item);
    } catch (err) {
      console.warn('Error saving to indexedDB:', err);
    }
  }

  public async saveAll<T extends { id: string }>(storeName: string, items: T[]): Promise<void> {
    await this.init();
    try {
      localStorage.setItem(`mulaka_${storeName}`, JSON.stringify(items));
    } catch (err) {
      console.error(err);
    }

    if (!this.db) return;

    try {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();
      items.forEach(item => store.put(item));
    } catch (err) {
      console.warn('IndexedDB saveAll error:', err);
    }
  }

  // Fast load from localStorage first (0ms synchronous render), then background sync
  public loadSynchronous<T>(storeName: string, fallback: T[]): T[] {
    try {
      const saved = localStorage.getItem(`mulaka_${storeName}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error(`Error loading ${storeName} from localStorage:`, err);
    }
    return fallback;
  }
}

export const dbService = new DatabaseService();

/**
 * WhatsApp Helper for Instant Automatic Notification
 */
export function generateWhatsAppSalaryNotification(params: {
  noHp: string;
  namaPenerima: string;
  namaProyek: string;
  nominalGaji: number;
  tipeUpah: string;
  periodeAtauTermin: string;
  nomorBukti: string;
  namaPerusahaan?: string;
}): string {
  const cleanPhone = params.noHp.replace(/\D/g, '').replace(/^0/, '62');
  const nominalStr = 'Rp ' + Math.round(params.nominalGaji).toLocaleString('id-ID');
  const company = params.namaPerusahaan || 'PT. MULAKA CIPTA NUSANTARA';
  
  const text = `*KONFIRMASI PENGGAJIAN & BUKTI BAYAR RESMI*
*${company}*
--------------------------------------------------
Halo Bpk/Sdr. *${params.namaPenerima}*,

Pembayaran upah/gaji Anda telah berhasil diproses dengan rincian sebagai berikut:

📋 *No. Referensi / Invoice*: ${params.nomorBukti}
🏗️ *Alokasi Proyek*: ${params.namaProyek}
⚙️ *Sistem Upah*: ${params.tipeUpah} (${params.periodeAtauTermin})
💰 *Total Bersih Ditransfer*: *${nominalStr}*
📅 *Tanggal Pencairan*: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
🔒 *Status*: *LUNAS (Verified by Mulaka ERP)*

Terima kasih atas dedikasi dan kerja keras Anda bersama Mulaka Group.
_Pesan resmi otomatis dari Sistem Terintegrasi Mulaka ERP._`;

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
}

export function generateWhatsAppInvoiceNotification(params: {
  noHpKlien: string;
  namaKlien: string;
  namaProyek: string;
  nomorInvoice: string;
  uraianTagihan: string;
  nominalTotal: number;
  jatuhTempo: string;
  namaBank: string;
  nomorRekening: string;
  atasNama: string;
  namaPerusahaan?: string;
}): string {
  const cleanPhone = params.noHpKlien.replace(/\D/g, '').replace(/^0/, '62');
  const nominalStr = 'Rp ' + Math.round(params.nominalTotal).toLocaleString('id-ID');
  const company = params.namaPerusahaan || 'PT. MULAKA CIPTA NUSANTARA';

  const text = `*FAKTUR PENAGIHAN RESMI (OFFICIAL INVOICE)*
*${company}*
--------------------------------------------------
Yth. Bpk/Ibu *${params.namaKlien}*,

Bersama ini kami sampaikan faktur penagihan termin proyek Anda dengan detail:

📄 *No. Invoice*: ${params.nomorInvoice}
🏗️ *Nama Proyek*: ${params.namaProyek}
📌 *Uraian*: ${params.uraianTagihan}
💵 *Total Tagihan (+PPN)*: *${nominalStr}*
⏰ *Jatuh Tempo*: ${params.jatuhTempo}

*Instruksi Rekening Pembayaran Resmi*:
🏦 Bank: *${params.namaBank}*
💳 No. Rekening: *${params.nomorRekening}*
👤 Atas Nama: *${params.atasNama}*

Bukti transfer dapat dikirimkan langsung membalas pesan ini. Terima kasih atas kepercayaan Anda bersama PT. Mulaka Cipta Nusantara.`;

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
}
