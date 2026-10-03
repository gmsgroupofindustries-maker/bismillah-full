import React from 'react';
import {
  Wrench,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { SHOP_INFO } from '../server/constants.ts';

interface FooterProps {
  onCategorySelect?: (slug: string) => void;
  onBrandSelect?: (slug: string) => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onCategorySelect, onBrandSelect, onOpenAdmin }) => {
  return (
    <footer className="bg-zinc-950 text-zinc-300 pt-12 pb-8 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 space-y-10">
        {/* Top 3 Selling Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-8 border-b border-zinc-800">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="w-10 h-10 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                100% Genuine Bike Parts
              </h4>
              <p className="text-[11px] text-zinc-400">Authentic Yamaha, Suzuki & TVS factory seals</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="w-10 h-10 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Nationwide Cash on Delivery
              </h4>
              <p className="text-[11px] text-zinc-400">Jashore local ৳60 | All 64 Districts ৳120</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="w-10 h-10 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Hassle-Free Replacement
              </h4>
              <p className="text-[11px] text-zinc-400">Guaranteed fitment support via WhatsApp</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-black border border-zinc-700/80 p-0.5 shadow-lg shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.jpg"
                  alt="Bismillah Motors Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-xl font-extrabold text-white tracking-tight uppercase">
                  Bismillah <span className="text-red-500">Motors</span>
                </span>
                <p className="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase">
                  Yamaha • Suzuki • TVS Parts & Stickers
                </p>
                <span className="text-[9px] font-extrabold uppercase text-amber-500 tracking-widest block mt-0.5">
                  Experience the Quality
                </span>
              </div>
            </div>

            <p className="text-zinc-400 leading-relaxed text-xs max-w-sm">
              Your trusted motorcycle parts specialist in Jashore, Bangladesh. Delivering OEM
              crankshafts, fuel tanks, wiring harnesses, brake assemblies, chain sprockets, and
              waterproof 3D bike decals right to your doorstep.
            </p>

            <div className="space-y-2 pt-1 text-zinc-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span>{SHOP_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <a href={`tel:${SHOP_INFO.phone}`} className="hover:text-white font-semibold">
                  {SHOP_INFO.phone} (Call / WhatsApp)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <a href={`mailto:${SHOP_INFO.email}`} className="hover:text-white">
                  {SHOP_INFO.email}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top Categories</h4>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <button
                  onClick={() => onCategorySelect?.('engine-parts')}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  Engine Parts & Valves
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategorySelect?.('brake-parts')}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  Brake Discs & Calipers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategorySelect?.('chain-and-sprocket')}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  Chain Sprocket Kits
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategorySelect?.('electrical')}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  Electrical & ECUs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategorySelect?.('stickers-and-accessories')}
                  className="hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  3D Tank Pads & Stickers
                </button>
              </li>
            </ul>
          </div>

          {/* Motorcycle Brands */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">OEM Brands</h4>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <button
                  onClick={() => onBrandSelect?.('yamaha')}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  Yamaha Genuine Parts (R15, MT15, FZS)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onBrandSelect?.('suzuki')}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  Suzuki Genuine Parts (Gixxer, SF)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onBrandSelect?.('tvs')}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  TVS Genuine Parts (Apache RTR, Metro)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onBrandSelect?.('bajaj')}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  Bajaj Genuine Parts (Pulsar, Platina)
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Customer Support</h4>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <a
                  href={`https://wa.me/${SHOP_INFO.whatsappRaw}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  Direct WhatsApp Support
                </a>
              </li>
              <li>
                <span>Cash on Delivery Policy</span>
              </li>
              <li>
                <span>Sundarban / Steadfast Dispatch</span>
              </li>
              <li>
                <button onClick={onOpenAdmin} className="text-zinc-500 hover:text-red-400">
                  Staff / Admin Login
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-3">
          <p>© {new Date().getFullYear()} Bismillah Motors, Jashore Sadar. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Cash on Delivery</span>
            <span>•</span>
            <span>WhatsApp Ordering</span>
            <span>•</span>
            <span>Sundarban Courier</span>
            <span>•</span>
            <span>Steadfast Courier</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
