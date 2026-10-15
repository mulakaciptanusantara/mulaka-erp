import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Search, Check, ExternalLink, X } from 'lucide-react';

interface GoogleMapPickerProps {
  value: string;
  onChange: (address: string, coords?: { lat: number; lng: number }) => void;
  defaultLat?: number;
  defaultLng?: number;
  label?: string;
}

export const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({
  value,
  onChange,
  defaultLat = -6.9532,
  defaultLng = 107.6912,
  label = 'Alamat Lokasi Proyek / Workshop',
}) => {
  const [address, setAddress] = useState(value);
  const [coords, setCoords] = useState({ lat: defaultLat, lng: defaultLng });
  const [showMapModal, setShowMapModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setAddress(value);
  }, [value]);

  const presetLocations = [
    { name: 'Jl. Gedebage Selatan No.70a, Rancabolang, Bandung', lat: -6.9532, lng: 107.6912, area: 'Gedebage' },
    { name: 'Jl. Bandung Inten No. 12, Buahbatu, Bandung', lat: -6.9515, lng: 107.6543, area: 'Buahbatu' },
    { name: 'Papyrus Residence Blok C-08, Dago Atas, Bandung', lat: -6.8654, lng: 107.6231, area: 'Dago' },
    { name: 'Komplek Permata Hijau, Rancaekek, Kab. Bandung', lat: -6.9697, lng: 107.7607, area: 'Rancaekek' },
    { name: 'Jl. Sukajadi Regency No. 18, Sukajadi, Bandung Barat', lat: -6.8872, lng: 107.5921, area: 'Sukajadi' },
    { name: 'Jl. Soekarno Hatta No. 512, Batununggal, Bandung', lat: -6.9389, lng: 107.6432, area: 'Soekarno Hatta' },
    { name: 'Jl. Riau No. 88, Citarum, Bandung Wetan', lat: -6.9082, lng: 107.6189, area: 'Riau' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const newAddr = searchQuery.trim();
    const newCoords = {
      lat: -6.91 + (Math.random() - 0.5) * 0.04,
      lng: 107.61 + (Math.random() - 0.5) * 0.04,
    };
    setCoords(newCoords);
    setAddress(newAddr);
    onChange(newAddr, newCoords);
    setSearchQuery('');
    setShowMapModal(false);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span>{label}</span>
        </label>
        <span className="text-[10px] text-slate-400 font-medium">Input Manual / Pilih Titik Peta</span>
      </div>

      <div className="relative flex items-center">
        <input
          type="text"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            onChange(e.target.value, coords);
          }}
          placeholder="Ketik alamat proyek atau pilih titik di peta..."
          className="w-full text-xs px-3.5 py-2.5 pr-20 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#1B2B4C] dark:focus:ring-blue-500 transition"
        />
        <div className="absolute right-1.5 flex items-center">
          <button
            type="button"
            onClick={() => setShowMapModal(true)}
            className="px-2.5 py-1 text-[11px] bg-[#1B2B4C] hover:bg-[#111C33] text-white dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg flex items-center gap-1 font-medium cursor-pointer shadow-xs transition"
          >
            <Navigation className="w-3 h-3 text-[#D4AF37]" />
            <span>Peta</span>
          </button>
        </div>
      </div>

      {/* Mini Map Preview */}
      <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 h-28 shadow-inner">
        <iframe
          title="Map Preview"
          src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=14&output=embed`}
          className="w-full h-full border-0 pointer-events-none opacity-90 dark:opacity-80"
          loading="lazy"
        />
        <div className="absolute bottom-1.5 left-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1 border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Lokasi: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
        </div>
        <button
          type="button"
          onClick={() => setShowMapModal(true)}
          className="absolute top-1.5 right-1.5 bg-white/90 dark:bg-slate-800/90 text-[#1B2B4C] dark:text-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs flex items-center gap-1 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-white transition"
        >
          <span>Pilih Titik Peta</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Full Modal Map */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700">
            <div className="px-5 py-3.5 bg-[#1B2B4C] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-bold text-sm">Pilih Lokasi Alamat Proyek</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-700 flex gap-2">
              <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari jalan, komplek, atau wilayah Bandung / Jabodetabek..."
                    className="w-full text-xs pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1B2B4C] hover:bg-[#111C33] text-white text-xs rounded-xl font-semibold cursor-pointer shadow-xs"
                >
                  Cari Lokasi
                </button>
              </form>
            </div>

            <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-700 flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold shrink-0">Wilayah Populer:</span>
              {presetLocations.map((loc) => (
                <button
                  key={loc.name}
                  type="button"
                  onClick={() => {
                    setCoords({ lat: loc.lat, lng: loc.lng });
                    setAddress(loc.name);
                    onChange(loc.name, { lat: loc.lat, lng: loc.lng });
                    setShowMapModal(false);
                  }}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-[#1B2B4C] hover:text-white dark:hover:bg-blue-600 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] text-slate-700 dark:text-slate-300 whitespace-nowrap transition cursor-pointer"
                >
                  {loc.area}
                </button>
              ))}
            </div>

            <div className="relative flex-1 min-h-[300px] bg-slate-200 dark:bg-slate-950">
              <iframe
                title="Full Map Modal"
                src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>

            <div className="px-5 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Koordinat: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowMapModal(false)}
                  className="px-4 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange(address, coords);
                    setShowMapModal(false);
                  }}
                  className="px-4 py-1.5 bg-[#1B2B4C] hover:bg-[#111C33] text-white rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Gunakan Lokasi Ini</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
