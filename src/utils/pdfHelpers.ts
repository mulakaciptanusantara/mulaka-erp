import { jsPDF } from 'jspdf';
import { KopSuratTemplate, CoverSuratTemplate, CompanyProfile } from '../types';

export function renderPDFCover(
  doc: jsPDF,
  coverTemplate: CoverSuratTemplate,
  companyProfile: CompanyProfile,
  metadata: {
    judulDokumen: string;
    nomorDokumen: string;
    namaProyek: string;
    namaKlien: string;
    tanggal: string;
    disusunOleh?: string;
  }
) {
  if (!coverTemplate.enableCover) return;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. If custom background image uploaded, render it as background
  if (coverTemplate.backgroundUrl && coverTemplate.backgroundUrl.startsWith('data:image')) {
    try {
      doc.addImage(coverTemplate.backgroundUrl, 'JPEG', 0, 0, pageWidth, pageHeight);
      doc.setFillColor(15, 23, 42);
      (doc as any).setGState(new (doc as any).GState({ opacity: 0.65 }));
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      (doc as any).setGState(new (doc as any).GState({ opacity: 1.0 }));
    } catch (e) {
      doc.setFillColor(27, 43, 76);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    }
  } else {
    // Default Deep Navy
    doc.setFillColor(27, 43, 76);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  }

  // Inner Gold Border
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1.5);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  doc.setLineWidth(0.4);
  doc.rect(12.5, 12.5, pageWidth - 25, pageHeight - 25);

  // Top Company Branding
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(companyProfile.nama, pageWidth / 2, 42, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(212, 175, 55);
  doc.text(companyProfile.tagline.toUpperCase(), pageWidth / 2, 48, { align: 'center' });

  // Center Emblem / Custom Logo in Circle
  const emblemY = 64;
  doc.setFillColor(255, 255, 255);
  doc.circle(pageWidth / 2, emblemY + 16, 20, 'F');
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1.2);
  doc.circle(pageWidth / 2, emblemY + 16, 20, 'D');

  doc.setTextColor(27, 43, 76);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('M', pageWidth / 2, emblemY + 23, { align: 'center' });

  // Document Title Box
  const boxY = 120;
  doc.setFillColor(17, 28, 51);
  doc.roundedRect(20, boxY, pageWidth - 40, 70, 4, 4, 'F');
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.roundedRect(20, boxY, pageWidth - 40, 70, 4, 4, 'D');

  doc.setTextColor(212, 175, 55);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(coverTemplate.judulUtama.toUpperCase(), pageWidth / 2, boxY + 12, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(metadata.judulDokumen, pageWidth / 2, boxY + 24, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text(`No. Dokumen: ${metadata.nomorDokumen}`, pageWidth / 2, boxY + 34, { align: 'center' });

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 40, boxY + 38, pageWidth / 2 + 40, boxY + 38);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`Proyek: ${metadata.namaProyek}`, pageWidth / 2, boxY + 48, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Klien / Pemilik: ${metadata.namaKlien}`, pageWidth / 2, boxY + 55, { align: 'center' });
  doc.text(`Tanggal Terbit: ${metadata.tanggal}`, pageWidth / 2, boxY + 62, { align: 'center' });

  // Confidentiality Statement & Contact
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(coverTemplate.catatanKerahasiaan, pageWidth / 2, pageHeight - 32, { align: 'center' });

  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`${companyProfile.alamat} | WA: +${companyProfile.wa}`, pageWidth / 2, pageHeight - 26, { align: 'center' });

  if (metadata.disusunOleh) {
    doc.setTextColor(226, 232, 240);
    doc.text(`Disusun Oleh: ${metadata.disusunOleh}`, pageWidth / 2, pageHeight - 20, { align: 'center' });
  }

  doc.addPage();
}

export function renderPDFKopSurat(
  doc: jsPDF,
  template: KopSuratTemplate,
  companyProfile: CompanyProfile
): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(27, 43, 76);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Circle Logo Badge on Top Left
  doc.setFillColor(255, 255, 255);
  doc.circle(18, 14, 8, 'F');
  doc.setTextColor(27, 43, 76);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('M', 18, 17.5, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(template.namaPerusahaan || companyProfile.nama, 30, 11);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(212, 175, 55);
  doc.text(template.tagline || template.subHeader, 30, 17);

  doc.setTextColor(226, 232, 240);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(template.alamat || companyProfile.alamat, 30, 23);

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1.0);
  doc.line(0, 28, pageWidth, 28);

  return 36;
}
