import React, { useRef } from 'react';
import { Product } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';
import { ChevronLeft, ChevronRight, ShoppingCart, Zap, Flame } from 'lucide-react';

interface ProductSliderMarqueeProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export const ProductSliderMarquee: React.FC<ProductSliderMarqueeProps> = ({
  products,
  title = 'Trending Deals & Popular Bike Parts',
  subtitle = 'Swipe or click arrows to explore hot selling genuine motorcycle components',
}) => {
  const { addToCart, setIsCheckoutOpen, setSelectedProductForModal } = useCart();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="bg-white py-8 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Title and Scroll Arrows */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={scrollLeft}
              className="w-8 h-8 rounded-full border border-gray-300 hover:border-red-600 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer text-gray-600 bg-gray-50 hover:bg-white"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollRight}
              className="w-8 h-8 rounded-full border border-gray-300 hover:border-red-600 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer text-gray-600 bg-gray-50 hover:bg-white"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sliding Products Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-3 pt-1 scroll-smooth"
        >
          {products.map((prod) => {
            const activePrice = prod.discountPrice ?? prod.price;
            const discountPercent =
              prod.discountPrice && prod.discountPrice < prod.price
                ? Math.round(((prod.price - prod.discountPrice) / prod.price) * 100)
                : null;
            const image =
              prod.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80';

            return (
              <div
                key={`slide-prod-${prod.id}`}
                onClick={() => setSelectedProductForModal(prod)}
                className="w-64 sm:w-72 shrink-0 bg-white rounded-xl border border-gray-200 hover:border-red-400 hover:shadow-lg transition-all p-3 flex flex-col justify-between group cursor-pointer relative"
              >
                {discountPercent && (
                  <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs">
                    {discountPercent}% OFF
                  </span>
                )}

                <div className="aspect-square bg-gray-50 rounded-lg p-3 mb-2 flex items-center justify-center overflow-hidden">
                  <img
                    src={image}
                    alt={prod.name}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider block">
                    {prod.brand?.name}
                  </span>
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                    {prod.name}
                  </h4>
                  {prod.bikeModel && (
                    <span className="text-[10px] text-gray-500 mt-1 block">
                      Fits: {prod.bikeModel.name}
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-black text-red-600">
                      ৳{activePrice.toLocaleString()}
                    </span>
                    {prod.discountPrice && (
                      <span className="text-[11px] text-gray-400 line-through">
                        ৳{prod.price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 mt-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(prod, 1, true);
                      }}
                      className="py-1.5 px-2 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(prod, 1, false);
                        setIsCheckoutOpen(true);
                      }}
                      className="py-1.5 px-2 bg-zinc-900 hover:bg-black text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>Buy</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
