import React, { useState } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { trackOrder } from '../lib/api.ts';
import { Order } from '../types.ts';
import {
  X,
  Search,
  PackageCheck,
  CheckCircle2,
  Clock,
  Truck,
  Check,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export const OrderTrackerModal: React.FC = () => {
  const { isOrderTrackerOpen, setIsOrderTrackerOpen } = useCart();
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  if (!isOrderTrackerOpen) return null;

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setError('');
    setLoading(true);

    try {
      const res = await trackOrder(orderNumber.trim(), phone.trim() || undefined);
      setOrder(res);
    } catch (err: any) {
      setError(err.message || 'Order not found. Please verify your Order Number.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const currentStatusIndex = order ? statuses.indexOf(order.status) : -1;
  const isCancelled = order?.status === 'Cancelled';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-auto p-5 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-red-600" />
            <h2 className="text-base font-extrabold text-gray-900 uppercase">
              Track Motorcycle Parts Order
            </h2>
          </div>
          <button
            onClick={() => setIsOrderTrackerOpen(false)}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search form */}
        <form onSubmit={handleTrackSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                Order ID (e.g. BM-20261002-XXXX)
              </label>
              <input
                type="text"
                required
                placeholder="BM-202610..."
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="01712..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Track Order Status</span>
          </button>
        </form>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">
            {error}
          </div>
        )}

        {/* Order Details Output */}
        {order && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 text-xs">
              <div>
                <span className="text-gray-500 block text-[10px]">Order Number</span>
                <span className="font-mono font-bold text-gray-900">{order.orderNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-500 block text-[10px]">Current Status</span>
                <span
                  className={`font-black uppercase px-2 py-0.5 rounded text-[11px] ${
                    isCancelled
                      ? 'bg-red-100 text-red-700'
                      : order.status === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            {/* Timeline */}
            {!isCancelled ? (
              <div className="py-2">
                <div className="flex items-center justify-between relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-0" />
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 transition-all duration-500 -z-0"
                    style={{
                      width: `${(Math.max(0, currentStatusIndex) / (statuses.length - 1)) * 100}%`,
                    }}
                  />

                  {statuses.map((st, idx) => {
                    const isPassed = currentStatusIndex >= idx;
                    const isCurrent = currentStatusIndex === idx;

                    return (
                      <div key={st} className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isPassed
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white border-2 border-gray-300 text-gray-400'
                          } ${isCurrent ? 'ring-4 ring-emerald-100 scale-110' : ''}`}
                        >
                          {isPassed ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                        </div>
                        <span
                          className={`text-[9px] sm:text-[10px] font-bold mt-1.5 ${
                            isPassed ? 'text-gray-900' : 'text-gray-400'
                          }`}
                        >
                          {st}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-red-100 text-red-800 rounded-lg text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>This order was cancelled. Please contact us on WhatsApp for assistance.</span>
              </div>
            )}

            {/* Recipient & items summary */}
            <div className="text-xs space-y-1 text-gray-600 pt-2 border-t border-gray-200">
              <p>
                <strong>Customer:</strong> {order.customerName} ({order.customerPhone})
              </p>
              <p>
                <strong>Delivery Address:</strong> {order.customerAddress}, {order.customerDistrict}
              </p>
              <p>
                <strong>Total Amount:</strong> ৳{order.totalAmount} (Cash on Delivery)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
