import React, { useState } from 'react';
import { BikeBrand, FilterState } from '../types.ts';
import { Search, ShieldCheck, Truck, Banknote, MessageCircle, ChevronRight } from 'lucide-react';

interface HeroBannerProps {
  bikeBrands: BikeBrand[];
  onFilterChange: (filters: Partial<FilterState>) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ bikeBrands, onFilterChange }) => {
  const [selectedBikeBrandSlug, setSelectedBikeBrandSlug] = useState('');
  const [selectedBikeModelSlug, setSelectedBikeModelSlug] = useState('');

  const activeBikeBrand = bikeBrands.find((b) => b.slug === selectedBikeBrandSlug);

  const handleBikeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      bikeBrand: selectedBikeBrandSlug || undefined,
      bikeModel: selectedBikeModelSlug || undefined,
      category: undefined,
      page: 1,
    });

    const productsEl = document.getElementById('products-section');
    if (productsEl) {
      productsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-zinc-950 text-white overflow-hidden border-b border-zinc-800">
      {/* Background Graphic Effect */}
      <div
        className="absolute inset-0 opacity-25 bg-cover bg-center mix-blend-luminosity"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1920&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-radial from-red-900/30 via-zinc-950/80 to-zinc-950" />

      <div className="relative max-w-7xl mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading and Tagline */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Jashore Sadar, 7400, Bangladesh
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-sans uppercase leading-tight">
              Ride Your Dream, <br className="hidden sm:inline" />
              <span className="text-red-500 underline decoration-red-600/50 underline-offset-8">
                Authentic & Genuine
              </span>{' '}
              Parts.
            </h1>

            <p className="text-zinc-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Bangladesh’s premier destination for genuine Yamaha, Suzuki, and TVS motorcycle
              spare parts, performance upgrades, and custom stickers. Order with{' '}
              <strong className="text-white font-semibold">Cash on Delivery</strong> and instant{' '}
              <strong className="text-emerald-400 font-semibold">WhatsApp ordering</strong>.
            </p>

            {/* Quick Action Badges */}
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-medium">
              <span className="bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-md text-zinc-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-red-500" /> 100% Genuine Guaranteed
              </span>
              <span className="bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-md text-zinc-300 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-red-500" /> Delivery Across All 64 Districts
              </span>
              <span className="bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-md text-zinc-300 flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-emerald-500" /> Cash on Delivery Only
              </span>
            </div>
          </div>

          {/* Right Column: Find Parts by Bike Widget */}
          <div className="lg:col-span-5">
            <div className="bg-zinc-900/90 backdrop-blur-md p-5 sm:p-6 rounded-xl border border-zinc-700/80 shadow-2xl shadow-black/60">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <h3 className="font-bold text-sm sm:text-base text-white uppercase tracking-wider">
                    Find Parts For Your Bike
                  </h3>
                </div>
                <span className="text-[11px] text-zinc-400 font-medium">Exact Fit</span>
              </div>

              <form onSubmit={handleBikeSearch} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    1. Select Bike Manufacturer
                  </label>
                  <select
                    value={selectedBikeBrandSlug}
                    onChange={(e) => {
                      setSelectedBikeBrandSlug(e.target.value);
                      setSelectedBikeModelSlug('');
                    }}
                    className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:border-red-500"
                  >
                    <option value="">-- Choose Manufacturer (Yamaha, Suzuki, TVS...) --</option>
                    {bikeBrands.map((b) => (
                      <option key={b.id} value={b.slug}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    2. Select Bike Model
                  </label>
                  <select
                    value={selectedBikeModelSlug}
                    onChange={(e) => setSelectedBikeModelSlug(e.target.value)}
                    disabled={!selectedBikeBrandSlug || !activeBikeBrand}
                    className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:border-red-500 disabled:opacity-50"
                  >
                    <option value="">
                      {!selectedBikeBrandSlug
                        ? '-- Select Manufacturer first --'
                        : '-- Choose Bike Model (e.g. R15 V3, Gixxer...) --'}
                    </option>
                    {activeBikeBrand?.models.map((m) => (
                      <option key={m.id} value={m.slug}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!selectedBikeBrandSlug}
                  className="w-full mt-2 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Compatible Parts</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-3.5 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                <span>Need help identifying part?</span>
                <a
                  href="https://wa.me/8801974060224?text=Hello%20Bismillah%20Motors,%20I%20need%20help%20finding%20parts%20for%20my%20bike."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Ask on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
