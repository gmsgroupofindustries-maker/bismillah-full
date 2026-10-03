import React, { useState } from 'react';
import { useCart } from '../context/CartContext.tsx';
import {
  CheckCircle2,
  MessageCircle,
  Copy,
  Check,
  PackageCheck,
  X,
  ExternalLink,
} from 'lucide-react';

export const OrderSuccessModal: React.FC = () => {
  const { orderSuccessData, setOrderSuccessData, setIsOrderTrackerOpen } = useCart();
  const [copied, setCopied] = useState(false);

  if (!orderSuccessData) return null;

  const { order, whatsappUrl, whatsappMessage } = orderSuccessData;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-auto p-6 sm:p-8 text-center space-y-5">
        {/* Close */}
        <button
          onClick={() => setOrderSuccessData(null)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full">
            Order Successfully Placed
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
            Thank You, {order.customerName}!
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Your Cash on Delivery order has been registered in the Bismillah Motors system.
          </p>
        </div>

        {/* Order Number Box */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5 text-left text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Order ID:</span>
            <span className="font-mono font-extrabold text-red-600 text-sm">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Delivery Address:</span>
            <span className="font-medium text-gray-800 text-right truncate max-w-[240px]">
              {order.customerAddress}, {order.customerDistrict}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Payment:</span>
            <span className="font-bold text-emerald-700">Cash on Delivery (৳{order.totalAmount})</span>
          </div>
        </div>

        {/* Primary Call to Action: ORDER ON WHATSAPP */}
        <div className="space-y-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/30 group cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            <span>Send Order on WhatsApp (+8801974060224)</span>
            <ExternalLink className="w-4 h-4 opacity-80" />
          </a>
          <p className="text-[11px] text-gray-500">
            Clicking above sends your pre-formatted order directly to our shop staff for instant confirmation and parcel dispatch!
          </p>
        </div>

        {/* Copy message or track buttons */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
          <button
            onClick={handleCopyMessage}
            className="flex-1 py-2 px-3 border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Receipt' : 'Copy Receipt'}</span>
          </button>

          <button
            onClick={() => {
              setOrderSuccessData(null);
              setIsOrderTrackerOpen(true);
            }}
            className="flex-1 py-2 px-3 bg-zinc-900 hover:bg-black rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PackageCheck className="w-3.5 h-3.5 text-red-500" />
            <span>Track Status</span>
          </button>
        </div>
      </div>
    </div>
  );
};
