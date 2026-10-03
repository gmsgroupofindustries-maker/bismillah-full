import React from 'react';
import { MessageCircle } from 'lucide-react';
import { SHOP_INFO } from '../server/constants.ts';

export const FloatingWhatsApp: React.FC = () => {
  const message = 'Hello Bismillah Motors, I want to inquire about motorcycle spare parts and stickers.';
  const whatsappUrl = `https://wa.me/${SHOP_INFO.whatsappRaw}?text=${encodeURIComponent(message)}`;

  return (
    <aside aria-label="Support and Quick Contact" className="fixed bottom-6 right-6 z-40">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Bismillah Motors on WhatsApp"
        className="flex items-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl shadow-emerald-500/50 hover:scale-105 transition-all duration-200 group cursor-pointer"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6 fill-current" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />
        </div>
        <div className="hidden sm:flex flex-col text-left pr-1">
          <span className="text-[10px] uppercase font-bold text-emerald-100 leading-none">
            Chat on WhatsApp
          </span>
          <span className="text-xs font-black tracking-wide leading-tight">
            +8801974060224
          </span>
        </div>
      </a>
    </aside>
  );
};
