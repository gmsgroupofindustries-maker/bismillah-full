import React from 'react';
import { Product } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';
import { ShoppingCart, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, setIsCheckoutOpen, setSelectedProductForModal } = useCart();

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80';

  const discountPercent =
    product.discountPrice && product.discountPrice < product.price
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : null;

  const activePrice = product.discountPrice ?? product.price;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product, 1, false);
    setIsCheckoutOpen(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product, 1, true);
  };

  return (
    <div
      onClick={() => setSelectedProductForModal(product)}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-red-400 hover:shadow-xl transition-all duration-200 flex flex-col group cursor-pointer relative"
    >
      {/* Top Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
        {discountPercent !== null && discountPercent > 0 && (
          <span className="bg-red-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded shadow-xs">
            {discountPercent}% OFF
          </span>
        )}
        {product.isFeatured && (
          <span className="bg-zinc-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
            Featured
          </span>
        )}
      </div>

      {/* Product Image */}
      <div className="relative aspect-square w-full bg-gray-50 flex items-center justify-center overflow-hidden p-4">
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-zinc-800 text-white text-xs font-bold px-3 py-1 rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between gap-1 text-[11px] mb-1">
            <span className="font-bold text-red-600 uppercase tracking-wider">
              {product.brand?.name?.replace(' Genuine Parts', '') || 'Motorcycle Part'}
            </span>
            <span className="text-gray-400 truncate text-[10px]">
              {product.category?.name}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Compatibility badge */}
          {product.bikeModel && (
            <div className="mt-1.5 inline-block bg-gray-100 text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded">
              Fit: {product.bikeModel.name}
            </div>
          )}
        </div>

        {/* Pricing & Stock */}
        <div className="mt-3 pt-2.5 border-t border-gray-100">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-extrabold text-red-600">
              ৳{activePrice.toLocaleString()}
            </span>
            {product.discountPrice && (
              <span className="text-xs text-gray-400 line-through">
                ৳{product.price.toLocaleString()}
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center justify-between text-[11px]">
            {product.stock > 0 ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {product.stock <= 5 ? `Low Stock (${product.stock} left)` : 'In Stock'}
              </span>
            ) : (
              <span className="text-red-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Out of stock
              </span>
            )}
            <span className="text-gray-600 text-[10px]">SKU: {product.sku}</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-full py-2 px-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="w-full py-2 px-2 bg-zinc-900 hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
