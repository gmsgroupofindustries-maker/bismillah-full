import React, { useState, useEffect } from 'react';
import { Product } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';
import { fetchProductBySlug } from '../lib/api.ts';
import {
  X,
  ShoppingCart,
  Zap,
  MessageCircle,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Share2,
  Check,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart, setIsCheckoutOpen, setSelectedProductForModal } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      const prim =
        product.images?.find((img) => img.isPrimary)?.url ||
        product.images?.[0]?.url ||
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=700&q=80';
      setActiveImage(prim);

      // Fetch related products
      fetchProductBySlug(product.slug)
        .then((data) => {
          setRelatedProducts(data.relatedProducts || []);
        })
        .catch(() => {});
    }
  }, [product]);

  if (!product) return null;

  const activePrice = product.discountPrice ?? product.price;
  const discountPercent =
    product.discountPrice && product.discountPrice < product.price
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : null;

  const handleAddToCart = () => {
    addToCart(product, quantity, true);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, false);
    onClose();
    setIsCheckoutOpen(true);
  };

  const handleWhatsAppInquiry = () => {
    const text = `Hello Bismillah Motors, I am interested in:
*${product.name}*
SKU: ${product.sku}
Price: ৳${activePrice}
Stock status: ${product.stock > 0 ? 'In Stock' : 'Check Availability'}
Link: ${window.location.origin}/#${product.slug}`;

    const url = `https://wa.me/8801974060224?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header with Close */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-bold text-red-600 uppercase">{product.brand?.name}</span>
            <span>/</span>
            <span>{product.category?.name}</span>
            <span>/</span>
            <span className="font-mono text-gray-700">SKU: {product.sku}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Gallery */}
            <div className="space-y-3">
              <div className="aspect-square bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center justify-center overflow-hidden">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>

              {product.images && product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(img.url)}
                      className={`w-16 h-16 rounded-lg border p-1 shrink-0 bg-white transition-all cursor-pointer ${
                        activeImage === img.url
                          ? 'border-red-600 ring-2 ring-red-100'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info & Actions */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  {discountPercent && (
                    <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded shadow-xs">
                      {discountPercent}% OFF
                    </span>
                  )}
                  {product.isFeatured && (
                    <span className="bg-zinc-900 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      Featured
                    </span>
                  )}
                  {product.isPopular && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      Popular Pick
                    </span>
                  )}
                </div>

                <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight">
                  {product.name}
                </h1>

                {/* Compatibility */}
                {product.bikeModel && (
                  <div className="mt-2 text-xs font-semibold text-gray-700 bg-gray-100 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md">
                    <span>Compatible Bike:</span>
                    <strong className="text-red-700">{product.bikeModel.name}</strong>
                  </div>
                )}
              </div>

              {/* Price display */}
              <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-red-600">
                  ৳{activePrice.toLocaleString()}
                </span>
                {product.discountPrice && (
                  <span className="text-sm sm:text-base text-gray-400 line-through">
                    Regular: ৳{product.price.toLocaleString()}
                  </span>
                )}
                <span className="text-xs text-gray-500 ml-auto font-medium">Cash on Delivery</span>
              </div>

              {/* Stock Status */}
              <div className="flex items-center justify-between text-xs">
                {product.stock > 0 ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {product.stock <= 5
                      ? `Hurry! Only ${product.stock} left in stock`
                      : `In Stock (${product.stock} available in Jashore warehouse)`}
                  </span>
                ) : (
                  <span className="text-red-500 font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Currently Out of Stock
                  </span>
                )}
                <button
                  onClick={handleCopyLink}
                  className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Share'}</span>
                </button>
              </div>

              {/* Description */}
              <div className="text-xs text-gray-600 leading-relaxed border-t border-b border-gray-100 py-3">
                <p>{product.description}</p>
              </div>

              {/* Quantity selector */}
              {product.stock > 0 && (
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 cursor-pointer font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-bold text-gray-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 cursor-pointer font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">Total: ৳{(activePrice * quantity).toLocaleString()}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-red-600/20 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
                    className="py-3 px-4 bg-zinc-900 hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Buy Now</span>
                  </button>
                </div>

                <button
                  onClick={handleWhatsAppInquiry}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order or Inquire on WhatsApp (+8801974060224)</span>
                </button>
              </div>

              {/* Delivery info card */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-gray-600">
                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 flex items-start gap-2">
                  <Truck className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-gray-900">Courier Shipping</strong>
                    <span>Jashore ৳60 | Nationwide ৳120</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-gray-900">100% Genuine</strong>
                    <span>Direct OEM manufacturer seal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Carousel */}
          {relatedProducts.length > 0 && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider mb-3">
                Related Motorcycle Parts
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedProducts.map((rel) => {
                  const relPrice = rel.discountPrice ?? rel.price;
                  const relImage =
                    rel.images?.find((i) => i.isPrimary)?.url ||
                    rel.images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80';

                  return (
                    <div
                      key={rel.id}
                      onClick={() => {
                        setSelectedProductForModal(rel);
                      }}
                      className="bg-gray-50 rounded-xl p-2.5 border border-gray-200 hover:border-red-400 transition-all cursor-pointer group"
                    >
                      <div className="aspect-square bg-white rounded-lg p-2 mb-2 flex items-center justify-center overflow-hidden">
                        <img
                          src={relImage}
                          alt={rel.name}
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-red-600 uppercase block truncate">
                        {rel.brand?.name}
                      </span>
                      <h4 className="text-[11px] font-bold text-gray-800 line-clamp-2 leading-snug">
                        {rel.name}
                      </h4>
                      <span className="text-xs font-extrabold text-red-600 mt-1 block">
                        ৳{relPrice.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
