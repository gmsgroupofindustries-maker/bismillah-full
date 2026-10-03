import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { BANGLADESH_DISTRICTS, SHOP_INFO } from '../server/constants.ts';
import { createOrder } from '../lib/api.ts';
import { saveOrderToFirestore } from '../lib/firestoreService.ts';
import {
  X,
  Truck,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Loader2,
  Banknote,
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    subtotal,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart,
    setOrderSuccessData,
  } = useCart();

  const { currentUser } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [district, setDistrict] = useState('Jashore');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (currentUser?.displayName && !name) {
      setName(currentUser.displayName);
    }
  }, [currentUser]);

  if (!isCheckoutOpen) return null;

  // Delivery calculation
  const isJashore = district.trim().toLowerCase() === 'jashore';
  const deliveryFee = isJashore ? SHOP_INFO.deliveryFeeJashore : SHOP_INFO.deliveryFeeNationwide;
  const grandTotal = subtotal + deliveryFee;

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (sameAsPhone) {
      setWhatsapp(val);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMessage('Please enter a valid 11-digit mobile number');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Please provide your complete delivery address');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createOrder({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerWhatsapp: (sameAsPhone ? phone : whatsapp || phone).trim(),
        customerDistrict: district,
        customerAddress: address.trim(),
        notes: notes.trim() || undefined,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });

      // Save order to Firebase Firestore for real-time cloud tracking
      try {
        await saveOrderToFirestore({
          orderId: `ord_${res.order.id}`,
          orderNumber: res.order.orderNumber,
          userId: currentUser?.uid,
          customerName: res.order.customerName,
          customerPhone: res.order.customerPhone,
          customerEmail: currentUser?.email || undefined,
          shippingAddress: res.order.customerAddress,
          district: res.order.customerDistrict,
          city: res.order.customerDistrict,
          items: cart.map((i) => ({
            productId: i.product.id,
            productName: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
            image: i.product.images[0]?.url || '',
          })),
          totalAmount: res.order.totalAmount,
          status: 'pending',
          paymentMethod: 'cod',
          notes: res.order.notes || undefined,
        });
      } catch (firestoreErr) {
        console.warn('Note: Order saved to database, Firestore sync log:', firestoreErr);
      }

      // Clear local cart
      clearCart();
      setIsCheckoutOpen(false);

      // Open Success & WhatsApp modal
      setOrderSuccessData({
        order: res.order,
        whatsappUrl: res.whatsappUrl,
        whatsappMessage: res.whatsappMessage,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-zinc-950 text-white">
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-extrabold uppercase tracking-wide">
                Cash on Delivery Checkout
              </h2>
              <p className="text-[11px] text-zinc-400">
                Pay in cash when your parts arrive at your doorstep
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmitOrder} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Mobile Number (11 digits) <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 01712345678"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600 font-mono"
                />
              </div>
            </div>

            {/* WhatsApp option */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3 text-xs space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-emerald-950">
                <input
                  type="checkbox"
                  checked={sameAsPhone}
                  onChange={(e) => {
                    setSameAsPhone(e.target.checked);
                    if (e.target.checked) setWhatsapp(phone);
                  }}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                <span>WhatsApp number is the same as Mobile Number</span>
              </label>

              {!sameAsPhone && (
                <div className="pt-1">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    WhatsApp Number (with country code or 01...)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +8801974060224"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-gray-300 focus:border-emerald-600 font-mono"
                  />
                </div>
              )}
            </div>

            {/* District & Delivery Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Delivery District <span className="text-red-600">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-hidden focus:border-red-600 font-medium"
                >
                  {BANGLADESH_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d} {d === 'Jashore' ? '(Local - ৳60 Delivery)' : '(Nationwide - ৳120 Delivery)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Delivery info card */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs flex items-center gap-2">
                <Truck className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <span className="font-bold text-gray-900 block">
                    {isJashore ? 'Jashore Sadar Local Delivery' : `${district} Courier Delivery`}
                  </span>
                  <span className="text-gray-500 text-[11px]">
                    Shipping: <strong className="text-red-600">৳{deliveryFee}</strong> (Sundarban / Steadfast / SA Paribahan)
                  </span>
                </div>
              </div>
            </div>

            {/* Full Street Address */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Full Delivery Address <span className="text-red-600">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="House / Holding number, Road / Area name, Thana / Upazila, Landmark..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-hidden focus:border-red-600"
              />
            </div>

            {/* Order Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Special Instructions / Courier Branch Preference (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Please send to Sundarban Courier Branch or call before delivery"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-hidden focus:border-red-600"
              />
            </div>

            {/* Order Items Summary */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <span className="text-[11px] font-extrabold uppercase text-gray-500 tracking-wider block">
                Order Review ({cart.length} unique parts)
              </span>
              <div className="max-h-28 overflow-y-auto space-y-1 text-xs pr-1">
                {cart.map(({ product, quantity }) => {
                  const price = product.discountPrice ?? product.price;
                  return (
                    <div key={product.id} className="flex justify-between text-gray-700">
                      <span className="truncate max-w-[280px]">
                        {quantity}x {product.name}
                      </span>
                      <span className="font-bold text-gray-900 shrink-0">
                        ৳{(price * quantity).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-gray-200 text-xs space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>Parts Subtotal:</span>
                  <span className="font-bold text-gray-900">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery ({district}):</span>
                  <span className="font-bold text-gray-900">৳{deliveryFee}</span>
                </div>
                <div className="pt-1 border-t border-gray-200 flex justify-between text-sm sm:text-base font-black text-gray-900">
                  <span>Grand Total (Pay on Delivery):</span>
                  <span className="text-red-600">৳{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Your Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Confirm Cash on Delivery Order (৳{grandTotal.toLocaleString()})</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
