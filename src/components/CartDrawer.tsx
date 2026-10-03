import React from 'react';
import { useCart } from '../context/CartContext.tsx';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    totalItems,
    setIsCheckoutOpen,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-zinc-950 text-white">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-red-500" />
              <h2 className="text-base font-extrabold uppercase tracking-wide">
                Your Shopping Cart ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-800">Your cart is currently empty</h3>
                <p className="text-xs text-gray-500 max-w-xs">
                  Discover genuine Yamaha, Suzuki, and TVS parts and add them to your cart.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 py-2 px-5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-xs">
                  <span className="text-gray-500">Items in Cart</span>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:underline font-semibold text-[11px] cursor-pointer"
                  >
                    Clear Cart
                  </button>
                </div>

                {cart.map(({ product, quantity }) => {
                  const activePrice = product.discountPrice ?? product.price;
                  const itemSubtotal = activePrice * quantity;
                  const image =
                    product.images?.find((img) => img.isPrimary)?.url ||
                    product.images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=200&q=80';

                  return (
                    <div
                      key={product.id}
                      className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex gap-3 items-center"
                    >
                      <img
                        src={image}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-contain bg-white p-1 border border-gray-200 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-red-600 uppercase">
                          {product.brand?.name}
                        </span>
                        <h4 className="text-xs font-bold text-gray-900 truncate">{product.name}</h4>
                        <div className="text-[11px] text-gray-500 font-mono">SKU: {product.sku}</div>

                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity control */}
                          <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden">
                            <button
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                              className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 py-0.5 text-xs font-bold text-gray-900">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              disabled={quantity >= product.stock}
                              className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-extrabold text-red-600">
                              ৳{itemSubtotal.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-gray-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer & Checkout Trigger */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charge</span>
                  <span className="text-emerald-700 font-medium">
                    Calculated at Checkout (৳60 / ৳120)
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-extrabold text-gray-900">
                  <span>Estimated Total</span>
                  <span className="text-red-600">৳{subtotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-red-100/70 border border-red-200 rounded-lg p-2.5 text-[11px] text-red-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  <strong>Cash on Delivery:</strong> Pay only when you receive and inspect your parcel!
                </span>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
              >
                <span>Proceed to Checkout (COD)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
