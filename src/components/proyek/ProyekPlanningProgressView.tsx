import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Filter, 
  RefreshCw, 
  Edit3, 
  Check, 
  Layers 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Project, DailyReport } from '../../types';

interface ProyekPlanningProgressViewProps {
  projects: Project[];
  dailyReports?: DailyReport[];
  onUpdateProjectWeeklyProgress?: (projectId: string, weeklyProgress: { [week: number]: number }) => void;
}

export const ProyekPlanningProgressView: React.FC<ProyekPlanningProgressViewProps> = ({ 
  projects,
  dailyReports = [],
  onUpdateProjectWeeklyProgress,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [isManualEditMode, setIsManualEditMode] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const selectedProj = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || projects[0];
  }, [projects, selectedProjectId]);

  const baselineWeeks = [2.5, 6.0, 13.0, 23.0, 36.0, 50.0, 64.0, 76.0, 86.0, 93.0, 98.0, 100.0];

  const [manualWeeklyData, setManualWeeklyData] = useState<{ [week: number]: number | '' }>({
    1: 2.5,
    2: 6.5,
    3: 14.5,
    4: 25.0,
    5: 38.5,
    6: 53.0,
    7: 68.5,
    8: '',
    9: '',
    10: '',
    11: '',
    12: '',
  });

  const sCurveData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const weekNum = i + 1;
      const baseVal = baselineWeeks[i];
      const rawAktual = manualWeeklyData[weekNum];
      const aktVal = typeof rawAktual === 'number' ? rawAktual : null;
      const deviasi = aktVal !== null ? aktVal - baseVal : null;
      return {
        minggu: `M-${weekNum}`,
        baseline: baseVal,
        aktual: aktVal,
        deviasi: deviasi !== null ? parseFloat(deviasi.toFixed(1)) : null,
      };
    });
  }, [manualWeeklyData]);

  const latestAktual = useMemo(() => {
    for (let i = 12; i >= 1; i--) {
      if (typeof manualWeeklyData[i] === 'number') {
        return { week: i, value: manualWeeklyData[i] as number };
      }
    }
    return { week: 1, value: 0 };
  }, [manualWeeklyData]);

  const baselineAtLatest = baselineWeeks[latestAktual.week - 1] || 0;
  const currentDeviasi = latestAktual.value - baselineAtLatest;

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base md:text-lg font-bold text-[#1B2B4C] dark:text-white">
              Planning &amp; Progress Kurva S (Auto-Sync &amp; Manual Edit)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tabel Kurva S terisi dari agregasi Laporan Harian (Daily Report), atau diisi secara manual per minggu.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {projects.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="text-xs font-bold text-[#1B2B4C] dark:text-white bg-transparent outline-none cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.nama_proyek}</option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={() => setIsManualEditMode(!isManualEditMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              isManualEditMode 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isManualEditMode ? 'Selesai Edit Manual' : 'Mode Edit Manual'}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 4 Status KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 block uppercase tracking-wider">
            Target Baseline Rencana
          </span>
          <strong className="text-base md:text-lg font-mono text-slate-800 dark:text-slate-200 font-bold mt-1 block">
            {baselineAtLatest.toFixed(1)}% (M-{latestAktual.week})
          </strong>
          <span className="text-[10px] text-slate-400">Jadwal Acuan Kontrak</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block uppercase tracking-wider">
            Realisasi Aktual Lapangan
          </span>
          <strong className="text-base md:text-lg font-mono text-emerald-700 dark:text-emerald-400 font-bold mt-1 block">
            {latestAktual.value.toFixed(1)}% (M-{latestAktual.week})
          </strong>
          <span className="text-[10px] text-slate-400">Fisik Terpasang Terverifikasi</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 block uppercase tracking-wider">
            Nilai Deviasi Jadwal
          </span>
          <strong className={`text-base md:text-lg font-mono font-bold mt-1 block ${
            currentDeviasi >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {currentDeviasi >= 0 ? `+${currentDeviasi.toFixed(1)}% (Lebih Cepat)` : `${currentDeviasi.toFixed(1)}% (Tertunda)`}
          </strong>
          <span className="text-[10px] text-slate-400">Perbandingan Aktual vs Rencana</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-[#1B2B4C] dark:text-slate-300 block uppercase tracking-wider">
            Status Pelaksanaan
          </span>
          <strong className="text-base md:text-lg text-[#1B2B4C] dark:text-white font-bold mt-1 block">
            {currentDeviasi >= 0 ? 'On-Track (Aman)' : 'Perlu Percepatan'}
          </strong>
          <span className="text-[10px] text-slate-400">Target Siap BAST</span>
        </div>
      </div>

      {/* Line Chart Kurva S */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm md:text-base text-[#1B2B4C] dark:text-white">
              Grafik Kurva S &bull; {selectedProj ? selectedProj.nama_proyek : 'Proyek Mulaka'}
            </h3>
            <p className="text-xs text-slate-400">Garis biru putus-putus: Baseline Rencana, Garis hijau tebal: Realisasi Aktual</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono font-semibold">
            <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-blue-600" /> Baseline Rencana (%)
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-emerald-600" /> Realisasi Aktual (%)
            </span>
          </div>
        </div>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sCurveData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B822" />
              <XAxis dataKey="minggu" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: any) => [`${v}%`, '']} />
              <Line 
                type="monotone" 
                dataKey="baseline" 
                name="Baseline Rencana" 
                stroke="#2563EB" 
                strokeWidth={2.5} 
                strokeDasharray="4 4" 
                dot={{ r: 3, fill: '#2563EB' }} 
              />
              <Line 
                type="monotone" 
                dataKey="aktual" 
                name="Realisasi Lapangan" 
                stroke="#10B981" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#10B981' }} 
                connectNulls={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
