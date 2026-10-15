import React, { useState, useEffect } from 'react';
import { 
  initialCompanyProfile,
  initialKasBankList,
  initialKopTemplates,
  initialCoverTemplate,
  initialQCTemplates,
  initialUsers,
  initialProjects,
  initialCashflow,
  initialWeeklyMaterialPOs,
  initialDailyReports,
  initialJournalEntries,
  initialHutangPiutang,
  initialAsetTetap,
  initialDocuments,
  initialMutualCheckRecords,
  initialRABProjects,
  initialChartOfAccounts,
  initialDaftarTukang,
  initialInvoicesTukang,
  initialSecurityLogs,
  initialAuditLogs,
  initialClientOnboardings
} from './data/mockData';
import { 
  User, 
  Project, 
  CashflowItem, 
  WeeklyMaterialPO, 
  DailyReport, 
  ProjectDocument, 
  ChartOfAccount, 
  JournalEntry, 
  KasBankItem, 
  HutangPiutangRecord, 
  AsetTetapItem, 
  MutualCheckRecord, 
  QCTemplateItem, 
  RABProject, 
  CompanyProfile, 
  KopSuratTemplate, 
  CoverSuratTemplate, 
  TutupBukuPeriod,
  TukangMulakaItem,
  InvoiceGajiTukang,
  SecurityLoginLog,
  AuditTrailLog,
  ClientOnboardingForm
} from './types';
import { dbService } from './services/databaseService';
import { PortalTopNav } from './components/navigation/PortalTopNav';
import { ProjectSidebar, ProyekMenuKey } from './components/navigation/ProjectSidebar';
import { AccountingSidebar, AkuntansiMenuKey } from './components/navigation/AccountingSidebar';
import { ProyekDashboardView } from './components/proyek/ProyekDashboardView';
import { ProyekManagementView } from './components/proyek/ProyekManagementView';
import { ProyekEstimasiRABView } from './components/proyek/ProyekEstimasiRABView';
import { ProyekKeuanganView } from './components/proyek/ProyekKeuanganView';
import { ProyekOperasionalView } from './components/proyek/ProyekOperasionalView';
import { ProyekPlanningProgressView } from './components/proyek/ProyekPlanningProgressView';
import { ProyekMutualCheckQCView } from './components/proyek/ProyekMutualCheckQCView';
import { ProyekDokumenView } from './components/proyek/ProyekDokumenView';
import { ProyekVendorSupplierView } from './components/proyek/ProyekVendorSupplierView';
import { ProyekPenggajianView } from './components/proyek/ProyekPenggajianView';
import { ProyekTeamView } from './components/proyek/ProyekTeamView';
import { ProyekPengaturanView } from './components/proyek/ProyekPengaturanView';
import { ProyekDaftarTukangView } from './components/proyek/ProyekDaftarTukangView';
import { ProyekClientOnboardingView } from './components/proyek/ProyekClientOnboardingView';
import { AkuntansiMasterView } from './components/akuntansi/AkuntansiMasterView';
import { GoogleDriveSyncModal } from './components/common/GoogleDriveSyncModal';
import { HomepageLogin } from './components/auth/HomepageLogin';
import { UserProfileModal } from './components/common/UserProfileModal';
import { AdminSecurityLogModal } from './components/common/AdminSecurityLogModal';
import { Menu } from 'lucide-react';

export default function App() {
  // Authentication / Homepage State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('mulaka_is_logged_in') === 'true';
  });

  // Mobile / Tablet Drawer State & Desktop Collapsible Sidebar
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSecurityLogModalOpen, setIsSecurityLogModalOpen] = useState(false);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('mulaka_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mulaka_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mulaka_theme', 'light');
    }
  }, [isDarkMode]);

  // Current Portal & Navigation
  const [currentPortal, setCurrentPortal] = useState<'proyek' | 'akuntansi'>('proyek');
  const [proyekMenu, setProyekMenu] = useState<ProyekMenuKey>('dashboard');
  const [akuntansiMenu, setAkuntansiMenu] = useState<AkuntansiMenuKey>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  // User Authentication / Active User
  const [users, setUsers] = useState<User[]>(() => {
    return dbService.loadSynchronous('users', initialUsers);
  });
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUser = localStorage.getItem('mulaka_current_user');
    return savedUser ? JSON.parse(savedUser) : initialUsers[0];
  });

  // Security & Audit Logs
  const [securityLogs, setSecurityLogs] = useState<SecurityLoginLog[]>(() => {
    return dbService.loadSynchronous('security_logs', initialSecurityLogs);
  });
  const [auditLogs, setAuditLogs] = useState<AuditTrailLog[]>(() => {
    return dbService.loadSynchronous('audit_logs', initialAuditLogs);
  });

  // Company Profile, Kop & Cover
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
    const saved = localStorage.getItem('mulaka_company_profile');
    return saved ? JSON.parse(saved) : initialCompanyProfile;
  });
  const [kopTemplates, setKopTemplates] = useState<KopSuratTemplate[]>(() => {
    const saved = localStorage.getItem('mulaka_kop_templates');
    return saved ? JSON.parse(saved) : initialKopTemplates;
  });
  const [coverTemplate, setCoverTemplate] = useState<CoverSuratTemplate>(() => {
    const saved = localStorage.getItem('mulaka_cover_template');
    return saved ? JSON.parse(saved) : initialCoverTemplate;
  });

  // Dynamic Homepage Background (Default: user uploaded sunset villa)
  const [homepageBgUrl, setHomepageBgUrl] = useState<string>(() => {
    return localStorage.getItem('mulaka_homepage_bg') || '/images/mulaka_sunset_villa.jpg';
  });

  // Core Data Lists
  const [projects, setProjects] = useState<Project[]>(() => {
    return dbService.loadSynchronous('projects', initialProjects);
  });
  const [cashflow, setCashflow] = useState<CashflowItem[]>(() => {
    return dbService.loadSynchronous('cashflow', initialCashflow);
  });
  const [weeklyPOs, setWeeklyPOs] = useState<WeeklyMaterialPO[]>(() => {
    return dbService.loadSynchronous('pos', initialWeeklyMaterialPOs);
  });
  const [dailyReports, setDailyReports] = useState<DailyReport[]>(() => {
    return dbService.loadSynchronous('daily_reports', initialDailyReports);
  });
  const [documents, setDocuments] = useState<ProjectDocument[]>(() => {
    return dbService.loadSynchronous('documents', initialDocuments);
  });
  const [mutualCheckRecords, setMutualCheckRecords] = useState<MutualCheckRecord[]>(() => {
    return dbService.loadSynchronous('mc_records', initialMutualCheckRecords);
  });
  const [qcTemplates, setQcTemplates] = useState<QCTemplateItem[]>(() => {
    const saved = localStorage.getItem('mulaka_qc_templates');
    return saved ? JSON.parse(saved) : initialQCTemplates;
  });
  const [rabProjects, setRabProjects] = useState<RABProject[]>(() => {
    const saved = localStorage.getItem('mulaka_rab_projects');
    return saved ? JSON.parse(saved) : initialRABProjects;
  });
  const [activeRabId, setActiveRabId] = useState<string>(() => {
    return initialRABProjects[0]?.id || 'rab-1';
  });

  // Tukang & Invoices
  const [daftarTukang, setDaftarTukang] = useState<TukangMulakaItem[]>(() => {
    return dbService.loadSynchronous('tukang', initialDaftarTukang);
  });
  const [invoicesTukang, setInvoicesTukang] = useState<InvoiceGajiTukang[]>(() => {
    return dbService.loadSynchronous('invoices_tukang', initialInvoicesTukang);
  });

  // Client Onboardings
  const [clientOnboardings, setClientOnboardings] = useState<ClientOnboardingForm[]>(() => {
    return dbService.loadSynchronous('onboarding_forms', initialClientOnboardings);
  });

  // Accounting Core Data
  const [coaList, setCoaList] = useState<ChartOfAccount[]>(() => {
    const saved = localStorage.getItem('mulaka_coa');
    return saved ? JSON.parse(saved) : initialChartOfAccounts;
  });
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('mulaka_journals');
    return saved ? JSON.parse(saved) : initialJournalEntries;
  });
  const [kasBankList, setKasBankList] = useState<KasBankItem[]>(() => {
    const saved = localStorage.getItem('mulaka_kas_bank');
    return saved ? JSON.parse(saved) : initialKasBankList;
  });
  const [hutangPiutang, setHutangPiutang] = useState<HutangPiutangRecord[]>(() => {
    const saved = localStorage.getItem('mulaka_hutang_piutang');
    return saved ? JSON.parse(saved) : initialHutangPiutang;
  });
  const [asetTetap, setAsetTetap] = useState<AsetTetapItem[]>(() => {
    const saved = localStorage.getItem('mulaka_aset_tetap');
    return saved ? JSON.parse(saved) : initialAsetTetap;
  });

  // Helper to record audit log
  const recordAuditLog = (aksi: AuditTrailLog['aksi'], modul: string, detail: string) => {
    const newLog: AuditTrailLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleString('id-ID'),
      userNama: currentUser.nama,
      userRole: currentUser.role,
      portal: currentPortal === 'proyek' ? 'Portal Proyek' : 'Portal Akuntansi',
      modul,
      aksi,
      detail,
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    dbService.saveAll('audit_logs', updated);
  };

  // Global save helpers
  const saveProjects = (data: Project[]) => {
    setProjects(data);
    dbService.saveAll('projects', data);
  };
  const saveCashflow = (data: CashflowItem[]) => {
    setCashflow(data);
    dbService.saveAll('cashflow', data);
  };
  const savePOs = (data: WeeklyMaterialPO[]) => {
    setWeeklyPOs(data);
    dbService.saveAll('pos', data);
  };
  const saveDailyReports = (data: DailyReport[]) => {
    setDailyReports(data);
    dbService.saveAll('daily_reports', data);
  };
  const saveDocuments = (data: ProjectDocument[]) => {
    setDocuments(data);
    dbService.saveAll('documents', data);
  };
  const saveMutualCheckRecords = (data: MutualCheckRecord[]) => {
    setMutualCheckRecords(data);
    dbService.saveAll('mc_records', data);
  };
  const saveQcTemplates = (data: QCTemplateItem[]) => {
    setQcTemplates(data);
    localStorage.setItem('mulaka_qc_templates', JSON.stringify(data));
  };
  const saveRabProjects = (data: RABProject[]) => {
    setRabProjects(data);
    localStorage.setItem('mulaka_rab_projects', JSON.stringify(data));
  };
  const saveCoaList = (data: ChartOfAccount[]) => {
    setCoaList(data);
    localStorage.setItem('mulaka_coa', JSON.stringify(data));
  };
  const saveJournalEntries = (data: JournalEntry[]) => {
    setJournalEntries(data);
    localStorage.setItem('mulaka_journals', JSON.stringify(data));
  };
  const saveKasBankList = (data: KasBankItem[]) => {
    setKasBankList(data);
    localStorage.setItem('mulaka_kas_bank', JSON.stringify(data));
  };
  const saveUsers = (data: User[]) => {
    setUsers(data);
    dbService.saveAll('users', data);
  };
  const saveDaftarTukang = (data: TukangMulakaItem[]) => {
    setDaftarTukang(data);
    dbService.saveAll('tukang', data);
  };
  const saveInvoicesTukang = (data: InvoiceGajiTukang[]) => {
    setInvoicesTukang(data);
    dbService.saveAll('invoices_tukang', data);
  };
  const saveClientOnboardings = (data: ClientOnboardingForm[]) => {
    setClientOnboardings(data);
    dbService.saveAll('onboarding_forms', data);
  };
  const saveCompanyProfile = (data: CompanyProfile) => {
    setCompanyProfile(data);
    localStorage.setItem('mulaka_company_profile', JSON.stringify(data));
  };
  const saveKopTemplates = (data: KopSuratTemplate[]) => {
    setKopTemplates(data);
    localStorage.setItem('mulaka_kop_templates', JSON.stringify(data));
  };
  const saveCoverTemplate = (data: CoverSuratTemplate) => {
    setCoverTemplate(data);
    localStorage.setItem('mulaka_cover_template', JSON.stringify(data));
  };
  const saveHomepageBgUrl = (url: string) => {
    setHomepageBgUrl(url);
    if (url) {
      localStorage.setItem('mulaka_homepage_bg', url);
    } else {
      localStorage.removeItem('mulaka_homepage_bg');
    }
  };

  // HANDLER: Add Project with automatic cashflow DP / Termin synchronization
  const handleAddProject = (newProject: Project) => {
    const updated = [newProject, ...projects];
    saveProjects(updated);
    recordAuditLog('Tambah', 'Proyek & Klien', `Pendaftaran proyek baru: ${newProject.nama_proyek} (Klien: ${newProject.nama_klien}, Nilai: Rp ${newProject.nilai.toLocaleString('id-ID')})`);

    // Auto-create Cashflow item for DP if DP > 0
    if (newProject.dp && newProject.dp > 0) {
      const dpCashflow: CashflowItem = {
        id: `cf-dp-${Date.now()}`,
        hari: new Date().toLocaleDateString('id-ID', { weekday: 'long' }),
        tanggal: newProject.tanggal_mulai || new Date().toISOString().split('T')[0],
        proyek: newProject.nama_proyek,
        proyekId: newProject.id,
        kategori: 'Kas Masuk',
        toko: newProject.nama_klien,
        qty: 1,
        satuan: 'Tahap DP Kontrak',
        pemasukan: newProject.dp,
        pengeluaran: 0,
        saldo: 0,
        keterangan: `Penerimaan Uang Muka (DP) Proyek ${newProject.nama_proyek} - Klien: ${newProject.nama_klien}`,
        akunKasBank: 'Bank Central Asia (BCA)',
        syncToAccounting: true,
      };

      const dpJournal: JournalEntry = {
        id: `jrn-dp-${Date.now()}`,
        noBukti: `BKM-DP/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
        tanggal: dpCashflow.tanggal,
        refProyekId: newProject.id,
        refProyekNama: newProject.nama_proyek,
        keterangan: `Penerimaan DP Proyek ${newProject.nama_proyek} dari ${newProject.nama_klien}`,
        status: 'Posted',
        source: 'Proyek Cashflow',
        lines: [
          {
            akunId: 'coa-103',
            akunKode: '1-1120',
            akunNama: 'Bank BCA Operasional (8105-8829-1002)',
            debit: newProject.dp,
            kredit: 0,
          },
          {
            akunId: 'coa-204',
            akunKode: '2-1400',
            akunNama: 'Pendapatan Diterima di Muka (DP Proyek)',
            debit: 0,
            kredit: newProject.dp,
          },
        ],
      };

      saveCashflow([dpCashflow, ...cashflow]);
      saveJournalEntries([dpJournal, ...journalEntries]);
    }
  };

  const handleDeleteProject = (id: string) => {
    const target = projects.find(p => p.id === id);
    saveProjects(projects.filter(p => p.id !== id));
    recordAuditLog('Hapus', 'Proyek & Klien', `Penghapusan proyek: ${target?.nama_proyek || id}`);
  };

  const handleUpdateProjectProgress = (id: string, progress: number) => {
    saveProjects(projects.map(p => p.id === id ? { ...p, progress } : p));
  };

  const handleUpdateProjectWeeklyProgress = (projectId: string, weeklyProgress: { [week: number]: number }) => {
    saveProjects(projects.map(p => {
      if (p.id === projectId) {
        const values = Object.values(weeklyProgress);
        const latestVal = values.length > 0 ? Math.max(...values) : p.progress;
        return {
          ...p,
          progress: latestVal,
          kurvaSMingguan: weeklyProgress,
        };
      }
      return p;
    }));
  };

  // HANDLER: PO Purchased
  const handleMarkPOPurchased = (poId: string) => {
    savePOs(weeklyPOs.map(po => po.id === poId ? { ...po, status: 'Diterima di Proyek', sudahTerbeli: true } : po));
  };

  const handleAddWeeklyPO = (po: WeeklyMaterialPO) => {
    savePOs([po, ...weeklyPOs]);
    recordAuditLog('Tambah', 'Operasional & PO', `Penerbitan PO material ${po.nomorPO} (${po.supplier}) Rp ${po.totalBiaya.toLocaleString('id-ID')}`);
  };

  // HANDLER: Daily Report
  const handleAddDailyReport = (report: DailyReport) => {
    saveDailyReports([report, ...dailyReports]);
    if (report.progresKumulatif && report.proyekId) {
      handleUpdateProjectProgress(report.proyekId, report.progresKumulatif);
    }
    recordAuditLog('Tambah', 'Laporan Harian', `Input daily report tanggal ${report.tanggal} untuk proyek ${report.namaProyek} (Progress: ${report.progresKumulatif}%)`);
  };

  // HANDLER: Cashflow
  const handleAddCashflow = (item: CashflowItem) => {
    saveCashflow([item, ...cashflow]);
    recordAuditLog('Tambah', 'Keuangan Proyek', `Input cashflow ${item.kategori} Rp ${(item.pemasukan || item.pengeluaran).toLocaleString('id-ID')} (${item.proyek})`);

    if (item.syncToAccounting) {
      const isIncome = (item.pemasukan || 0) > 0;
      const amount = isIncome ? item.pemasukan : item.pengeluaran;
      const journal: JournalEntry = {
        id: `jrn-cf-${Date.now()}`,
        noBukti: `${isIncome ? 'BKM' : 'BKK'}/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
        tanggal: item.tanggal,
        refProyekNama: item.proyek,
        keterangan: item.keterangan || `${item.kategori} - ${item.proyek}`,
        status: 'Posted',
        source: 'Proyek Cashflow',
        lines: isIncome
          ? [
              {
                akunId: 'coa-103',
                akunKode: '1-1120',
                akunNama: item.akunKasBank || 'Bank BCA Operasional (8105-8829-1002)',
                debit: amount,
                kredit: 0,
              },
              {
                akunId: 'coa-401',
                akunKode: '4-1100',
                akunNama: 'Jasa Konstruksi',
                debit: 0,
                kredit: amount,
              },
            ]
          : [
              {
                akunId: item.kategori.includes('Furniture') ? 'coa-502' : 'coa-501',
                akunKode: '5-1200',
                akunNama: item.kategori || 'Biaya Material & Upah Proyek Langsung',
                debit: amount,
                kredit: 0,
              },
              {
                akunId: item.akunKasBank?.includes('Petty') || item.akunKasBank?.includes('Kecil') ? 'coa-101' : 'coa-102',
                akunKode: '1-1110',
                akunNama: item.akunKasBank || 'Kas Besar Proyek',
                debit: 0,
                kredit: amount,
              },
            ],
      };
      saveJournalEntries([journal, ...journalEntries]);
    }
  };

  const handleAddKasAccount = (account: KasBankItem) => {
    saveKasBankList([...kasBankList, account]);
    recordAuditLog('Tambah', 'Kas & Bank', `Tambah rekening ${account.nama} (${account.nomorRekening})`);
  };

  const handleDeleteKasAccount = (id: string) => {
    saveKasBankList(kasBankList.filter(k => k.id !== id));
    recordAuditLog('Hapus', 'Kas & Bank', `Hapus rekening kas/bank ID ${id}`);
  };

  const handlePostSalaryCashflow = (item: CashflowItem) => {
    handleAddCashflow(item);
  };

  const handleAddJournalEntry = (entry: JournalEntry) => {
    saveJournalEntries([entry, ...journalEntries]);
    recordAuditLog('Posting Jurnal', 'Portal Akuntansi', `Posting Jurnal Umum ${entry.noBukti}: ${entry.keterangan}`);
  };

  const handleAddCOA = (coa: ChartOfAccount) => {
    saveCoaList([...coaList, coa]);
    recordAuditLog('Tambah', 'Daftar Akun', `Tambah akun COA ${coa.kode} - ${coa.nama}`);
  };

  const handleTransferKas = (fromId: string, toId: string, nominal: number, catatan: string) => {
    const fromAcc = kasBankList.find(k => k.id === fromId);
    const toAcc = kasBankList.find(k => k.id === toId);
    if (!fromAcc || !toAcc || nominal <= 0) return;

    const entry: JournalEntry = {
      id: `jrn-trf-${Date.now()}`,
      noBukti: `TRF/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      tanggal: new Date().toISOString().split('T')[0],
      keterangan: `Transfer Kas & Bank: ${fromAcc.nama} ke ${toAcc.nama} (${catatan || 'Mutasi Kas'})`,
      status: 'Posted',
      source: 'Manual',
      lines: [
        { akunId: toAcc.id, akunKode: toAcc.nomorRekening || '1-1100', akunNama: toAcc.nama, debit: nominal, kredit: 0 },
        { akunId: fromAcc.id, akunKode: fromAcc.nomorRekening || '1-1120', akunNama: fromAcc.nama, debit: 0, kredit: nominal },
      ],
    };
    saveJournalEntries([entry, ...journalEntries]);
    recordAuditLog('Posting Jurnal', 'Kas & Bank', `Transfer kas Rp ${nominal.toLocaleString('id-ID')} dari ${fromAcc.nama} ke ${toAcc.nama}`);
  };

  const handleAddAdjustingEntry = (entry: JournalEntry) => {
    handleAddJournalEntry(entry);
  };

  const handleClosePeriod = (period: TutupBukuPeriod) => {
    recordAuditLog('Tutup Buku', 'Portal Akuntansi', `Tutup buku periode ${period.periode} oleh ${period.ditutupOleh}`);
  };

  // USER ACTION REQUEST: "Reset Data hanya 1x pakai oleh admin mulaka ketika awal launching web berlaku untuk portal proyek dan akuntansi jadi anggap web dari 0"
  const handleInitialLaunchReset = () => {
    saveProjects([]);
    saveCashflow([]);
    savePOs([]);
    saveDailyReports([]);
    saveDocuments([]);
    saveMutualCheckRecords([]);
    saveJournalEntries([]);
    saveInvoicesTukang([]);
    saveClientOnboardings([]);
    
    const emptyRab: RABProject = {
      id: `rab-${Date.now()}`,
      namaProyek: 'RAB Proyek Baru (Siap Diisi)',
      klien: '',
      lokasi: '',
      tanggal: new Date().toISOString().split('T')[0],
      overheadProfitPercent: 10,
      ppnPercent: 11,
      items: [],
    };
    saveRabProjects([emptyRab]);
    setActiveRabId(emptyRab.id);

    const updatedProfile = { ...companyProfile, initialLaunchResetDone: true };
    saveCompanyProfile(updatedProfile);

    recordAuditLog('Reset Data Awal', 'Pengaturan', 'Administrator Mulaka mengeksekusi Reset Data 1x Awal Launching Web (Proyek & Akuntansi dari 0)');
    alert('RESET 1X AWAL LAUNCHING BERHASIL!\n\nSeluruh data portal proyek dan akuntansi telah dikosongkan. Web resmi dimulai dari angka 0.');
  };

  // Convert Onboarding to Project
  const handleConvertOnboardingToProject = (project: Project) => {
    handleAddProject(project);
    setProyekMenu('proyek');
  };

  if (!isLoggedIn) {
    return (
      <HomepageLogin
        users={users}
        homepageBgUrl={homepageBgUrl}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          setIsLoggedIn(true);
          sessionStorage.setItem('mulaka_is_logged_in', 'true');
          recordAuditLog('Login Berhasil', 'Keamanan & Autentikasi', `Login berhasil oleh ${u.nama} (@${u.username})`);
        }}
        onRecordSecurityLogin={(log) => {
          const updated = [log, ...securityLogs];
          setSecurityLogs(updated);
          dbService.saveAll('security_logs', updated);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <PortalTopNav
        currentPortal={currentPortal}
        onSwitchPortal={setCurrentPortal}
        currentUser={currentUser}
        onLogout={() => {
          setIsLoggedIn(false);
          sessionStorage.removeItem('mulaka_is_logged_in');
          localStorage.removeItem('mulaka_is_logged_in');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenDriveSettings={() => setIsDriveModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onResetAllDataToEmpty={handleInitialLaunchReset}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenSecurityLogs={() => setIsSecurityLogModalOpen(true)}
        companyProfile={companyProfile}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVIGATION */}
        {currentPortal === 'proyek' ? (
          <ProjectSidebar
            currentMenu={proyekMenu}
            onSelectMenu={setProyekMenu}
            currentUser={currentUser}
            onOpenQuickNewProject={() => {
              setProyekMenu('proyek');
            }}
            isMobileOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        ) : (
          <AccountingSidebar
            currentMenu={akuntansiMenu}
            onSelectMenu={setAkuntansiMenu}
            currentUser={currentUser}
            onOpenQuickJournalModal={() => {
              setAkuntansiMenu('jurnal-umum');
            }}
            isMobileOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        )}

        {/* MAIN CONTENT VIEW AREA */}
        <main className="flex-1 overflow-y-auto bg-slate-100/60 dark:bg-slate-900/60 p-4 md:p-6 lg:p-8">
          {currentPortal === 'proyek' ? (
            <>
              {proyekMenu === 'dashboard' && (
                <ProyekDashboardView
                  projects={projects}
                  cashflow={cashflow}
                  weeklyPOs={weeklyPOs}
                  currentUser={currentUser}
                  onNavigateMenu={setProyekMenu}
                  onSelectProjectDetail={() => setProyekMenu('proyek')}
                  onMarkPOPurchased={handleMarkPOPurchased}
                />
              )}

              {proyekMenu === 'proyek' && (
                <ProyekManagementView
                  projects={projects}
                  weeklyPOs={weeklyPOs}
                  onAddProject={handleAddProject}
                  onDeleteProject={handleDeleteProject}
                  onUpdateProjectProgress={handleUpdateProjectProgress}
                  onMarkPOPurchased={handleMarkPOPurchased}
                  onAddWeeklyPO={handleAddWeeklyPO}
                />
              )}

              {proyekMenu === 'onboarding-klien' && (
                <ProyekClientOnboardingView
                  onboardings={clientOnboardings}
                  onSaveOnboarding={(onb) => saveClientOnboardings([onb, ...clientOnboardings])}
                  onConvertToProject={handleConvertOnboardingToProject}
                  companyProfile={companyProfile}
                  kopTemplates={kopTemplates}
                  coverTemplate={coverTemplate}
                />
              )}

              {proyekMenu === 'daftar-tukang' && (
                <ProyekDaftarTukangView
                  daftarTukang={daftarTukang}
                  onSaveDaftarTukang={saveDaftarTukang}
                  invoicesTukang={invoicesTukang}
                  onSaveInvoicesTukang={saveInvoicesTukang}
                  projects={projects}
                  companyProfile={companyProfile}
                  kopTemplates={kopTemplates}
                  coverTemplate={coverTemplate}
                  onPostSalaryCashflow={handlePostSalaryCashflow}
                />
              )}

              {proyekMenu === 'estimasi-anggaran' && (
                <ProyekEstimasiRABView
                  rabProjects={rabProjects}
                  activeRabId={activeRabId}
                  onSelectRab={setActiveRabId}
                  onCreateNewRab={(newRab) => {
                    const updated = [newRab, ...rabProjects];
                    saveRabProjects(updated);
                    setActiveRabId(newRab.id);
                  }}
                  onDeleteRab={(id) => {
                    const filtered = rabProjects.filter(r => r.id !== id);
                    saveRabProjects(filtered);
                    if (activeRabId === id && filtered.length > 0) {
                      setActiveRabId(filtered[0].id);
                    }
                  }}
                  onUpdateRAB={(updatedRab) => {
                    saveRabProjects(rabProjects.map(r => r.id === updatedRab.id ? updatedRab : r));
                  }}
                  onNavigateToKurvaS={() => setProyekMenu('planning-progress')}
                  companyProfile={companyProfile}
                  kopTemplates={kopTemplates}
                  coverTemplate={coverTemplate}
                />
              )}

              {proyekMenu === 'keuangan' && (
                <ProyekKeuanganView
                  cashflow={cashflow}
                  projects={projects}
                  kasBankList={kasBankList}
                  hutangPiutang={hutangPiutang}
                  onAddCashflow={handleAddCashflow}
                  onAddKasAccount={handleAddKasAccount}
                  onDeleteKasAccount={handleDeleteKasAccount}
                />
              )}

              {proyekMenu === 'operasional' && (
                <ProyekOperasionalView
                  dailyReports={dailyReports}
                  projects={projects}
                  weeklyPOs={weeklyPOs}
                  onAddDailyReport={handleAddDailyReport}
                  onMarkPOPurchased={handleMarkPOPurchased}
                  onAddWeeklyPO={handleAddWeeklyPO}
                />
              )}

              {proyekMenu === 'planning-progress' && (
                <ProyekPlanningProgressView
                  projects={projects}
                  dailyReports={dailyReports}
                  onUpdateProjectWeeklyProgress={handleUpdateProjectWeeklyProgress}
                />
              )}

              {proyekMenu === 'mutual-check-qc' && (
                <ProyekMutualCheckQCView
                  projects={projects}
                  records={mutualCheckRecords}
                  onAddRecord={(rec) => saveMutualCheckRecords([rec, ...mutualCheckRecords])}
                  onUpdateRecord={(rec) => saveMutualCheckRecords(mutualCheckRecords.map(r => r.id === rec.id ? rec : r))}
                  onDeleteRecord={(id) => saveMutualCheckRecords(mutualCheckRecords.filter(r => r.id !== id))}
                  qcTemplates={qcTemplates}
                  onUpdateQcTemplates={saveQcTemplates}
                  onNavigateToDokumen={() => setProyekMenu('dokumen')}
                  companyProfile={companyProfile}
                  kopTemplates={kopTemplates}
                  coverTemplate={coverTemplate}
                />
              )}

              {proyekMenu === 'dokumen' && (
                <ProyekDokumenView
                  documents={documents}
                  projects={projects}
                  companyProfile={companyProfile}
                  onAddDocument={(doc) => saveDocuments([doc, ...documents])}
                  onDeleteDocument={(id) => saveDocuments(documents.filter(d => d.id !== id))}
                  kopTemplates={kopTemplates}
                  coverTemplate={coverTemplate}
                  onNavigateToQC={() => setProyekMenu('mutual-check-qc')}
                />
              )}

              {proyekMenu === 'vendor-supplier' && (
                <ProyekVendorSupplierView />
              )}

              {proyekMenu === 'penggajian' && (
                <ProyekPenggajianView
                  users={users}
                  onUpdateUser={(updated) => saveUsers(users.map(u => u.id === updated.id ? updated : u))}
                  currentUser={currentUser}
                  companyProfile={companyProfile}
                  kopTemplates={kopTemplates}
                  coverTemplate={coverTemplate}
                  onPostSalaryCashflow={(catatan: string, nominal: number) => {
                    const newCf: CashflowItem = {
                      id: `cf-sal-${Date.now()}`,
                      hari: new Date().toLocaleDateString('id-ID', { weekday: 'long' }),
                      tanggal: new Date().toISOString().split('T')[0],
                      proyek: 'Operasional Kantor / HR',
                      kategori: 'Biaya Gaji Karyawan',
                      toko: 'Payroll Mulaka',
                      qty: 1,
                      satuan: 'Bln',
                      pemasukan: 0,
                      pengeluaran: nominal,
                      saldo: 0,
                      keterangan: catatan,
                      syncToAccounting: true,
                    };
                    handlePostSalaryCashflow(newCf);
                  }}
                />
              )}

              {proyekMenu === 'team-akses' && (
                <ProyekTeamView
                  users={users}
                  currentRole={currentUser.role}
                  onAddUser={(newUser) => saveUsers([...users, newUser])}
                  onUpdateUser={(updated) => saveUsers(users.map(u => u.id === updated.id ? updated : u))}
                  onDeleteUser={(id) => saveUsers(users.filter(u => u.id !== id))}
                />
              )}

              {proyekMenu === 'pengaturan' && (
                <ProyekPengaturanView
                  companyProfile={companyProfile}
                  onUpdateCompanyProfile={saveCompanyProfile}
                  currentUser={currentUser}
                  onUpdateUserProfile={(u) => {
                    setCurrentUser(u);
                    saveUsers(users.map(existing => existing.id === u.id ? u : existing));
                    localStorage.setItem('mulaka_current_user', JSON.stringify(u));
                  }}
                  kopTemplates={kopTemplates}
                  onUpdateKopTemplates={saveKopTemplates}
                  coverTemplate={coverTemplate}
                  onUpdateCoverTemplate={saveCoverTemplate}
                  onResetAllDataToEmpty={handleInitialLaunchReset}
                  homepageBgUrl={homepageBgUrl}
                  onUpdateHomepageBgUrl={saveHomepageBgUrl}
                />
              )}
            </>
          ) : (
            /* AKUNTANSI MASTER VIEW */
            <AkuntansiMasterView
              currentMenu={akuntansiMenu}
              coaList={coaList}
              journalEntries={journalEntries}
              kasBankList={kasBankList}
              hutangPiutangList={hutangPiutang}
              asetTetapList={asetTetap}
              companyProfile={companyProfile}
              currentUser={currentUser}
              users={users}
              onAddJournalEntry={handleAddJournalEntry}
              onAddCOA={handleAddCOA}
              onTransferKas={handleTransferKas}
              onAddAdjustingEntry={handleAddAdjustingEntry}
              onClosePeriod={handleClosePeriod}
              onNavigateMenu={setAkuntansiMenu}
              onAddKasAccount={handleAddKasAccount}
              onDeleteKasAccount={handleDeleteKasAccount}
              kopTemplates={kopTemplates}
              coverTemplate={coverTemplate}
            />
          )}
        </main>
      </div>

      {/* Floating Menu Button on Mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="fixed bottom-6 left-5 z-40 lg:hidden px-4 py-3 bg-[#1B2B4C] dark:bg-blue-600 text-[#D4AF37] dark:text-white rounded-full shadow-2xl border-2 border-[#D4AF37]/80 flex items-center gap-2 hover:scale-105 active:scale-95 transition cursor-pointer"
        title="Buka Menu Navigasi"
      >
        <Menu className="w-5 h-5 text-[#D4AF37] dark:text-white" />
        <span className="text-xs font-bold text-white tracking-wide">Menu</span>
      </button>

      {/* Google Drive Modal */}
      <GoogleDriveSyncModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        companyProfile={companyProfile}
        onUpdateCompanyProfile={saveCompanyProfile}
        projects={projects}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateUserProfile={(updatedUser) => {
          setCurrentUser(updatedUser);
          saveUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
          try {
            localStorage.setItem('mulaka_current_user', JSON.stringify(updatedUser));
          } catch (e) {
            console.error(e);
          }
        }}
      />

      {/* Admin Security & Database Audit Log Modal */}
      <AdminSecurityLogModal
        isOpen={isSecurityLogModalOpen}
        onClose={() => setIsSecurityLogModalOpen(false)}
        securityLogs={securityLogs}
        auditLogs={auditLogs}
      />
    </div>
  );
}
