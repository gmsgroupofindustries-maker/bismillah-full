import React, { useState, useEffect } from 'react';
import { Product, BikeBrand, FilterState } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  Banknote,
  Search,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface HeroBannerSliderProps {
  products: Product[];
  bikeBrands: BikeBrand[];
  onFilterChange: (filters: Partial<FilterState>) => void;
}

export const HeroBannerSlider: React.FC<HeroBannerSliderProps> = ({
  products,
  bikeBrands,
  onFilterChange,
}) => {
  const { addToCart, setIsCheckoutOpen, setSelectedProductForModal } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Bike selector state
  const [selectedBikeBrandSlug, setSelectedBikeBrandSlug] = useState('');
  const [selectedBikeModelSlug, setSelectedBikeModelSlug] = useState('');

  const activeBikeBrand = bikeBrands.find((b) => b.slug === selectedBikeBrandSlug);

  // Filter products by brand / category for individual slides
  const yamahaProducts = products.filter((p) => p.brand?.slug === 'yamaha').slice(0, 3);
  const suzukiProducts = products.filter((p) => p.brand?.slug === 'suzuki').slice(0, 3);
  const tvsProducts = products.filter((p) => p.brand?.slug === 'tvs').slice(0, 3);
  const stickerProducts = products
    .filter((p) => p.category?.slug === 'stickers-and-accessories')
    .slice(0, 3);

  // Fallback to general featured products if specific brand lists are short
  const featured = products.filter((p) => p.isFeatured || p.isPopular).slice(0, 3);

  const slides = [
    {
      id: 'slide-1',
      tagline: 'OFFICIAL STORE • EXPERIENCE THE QUALITY',
      title: 'Genuine Yamaha, Suzuki & TVS Parts',
      highlight: 'Up to 30% OFF',
      description:
        'Factory-sealed motorcycle components, heavy-duty electricals, and genuine spares delivered across Bangladesh with Cash on Delivery.',
      bgGradient: 'from-zinc-950 via-zinc-900 to-red-950/70',
      accentColor: 'text-red-500',
      badgeBg: 'bg-red-600/20 border-red-500/40 text-red-400',
      slideProducts: featured.length > 0 ? featured : products.slice(0, 3),
      filterAction: () => onFilterChange({ isFeatured: true, page: 1 }),
      ctaText: 'Explore Featured Parts',
    },
    {
      id: 'slide-2',
      tagline: 'YAMAHA GENUINE SPARES • R15 V3, V4 & MT-15',
      title: 'Precision Performance For Yamaha Riders',
      highlight: '100% OEM Tested',
      description:
        'Oxygen sensors, full wiring harnesses, ByBre brake calipers, throttle bodies, and authentic Yamalube fluids in stock at Jashore.',
      bgGradient: 'from-zinc-950 via-zinc-900 to-blue-950/70',
      accentColor: 'text-blue-400',
      badgeBg: 'bg-blue-600/20 border-blue-500/40 text-blue-400',
      slideProducts: yamahaProducts.length > 0 ? yamahaProducts : products.slice(3, 6),
      filterAction: () => onFilterChange({ brand: 'yamaha', page: 1 }),
      ctaText: 'Shop Yamaha Spares',
    },
    {
      id: 'slide-3',
      tagline: 'SUZUKI & TVS GENUINE PARTS • HEAVY DUTY',
      title: 'Gixxer 155 & Apache RTR 160 Spares',
      highlight: 'Cash on Delivery',
      description:
        'Induction-hardened chain sprockets, race-tuned ECUs, front telescopic forks, and fuel tanks ready for instant dispatch.',
      bgGradient: 'from-zinc-950 via-zinc-900 to-amber-950/70',
      accentColor: 'text-amber-400',
      badgeBg: 'bg-amber-600/20 border-amber-500/40 text-amber-400',
      slideProducts: suzukiProducts.length > 0 ? suzukiProducts : tvsProducts,
      filterAction: () => onFilterChange({ brand: 'suzuki', page: 1 }),
      ctaText: 'Shop Suzuki & TVS Parts',
    },
    {
      id: 'slide-4',
      tagline: 'BIKE GRAPHICS • 3D RESIN EMBOSSED',
      title: 'Waterproof 3D Tank Pads & Decal Kits',
      highlight: 'High Durability',
      description:
        'Scratch-resistant polyurethane dome protection and custom monster racing side decals for your motorcycle.',
      bgGradient: 'from-zinc-950 via-zinc-900 to-emerald-950/70',
      accentColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400',
      slideProducts: stickerProducts.length > 0 ? stickerProducts : products.slice(0, 3),
      filterAction: () => onFilterChange({ category: 'stickers-and-accessories', page: 1 }),
      ctaText: 'View Stickers & Decals',
    },
  ];

  // Auto-advance slides every 6 seconds if not hovered
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleBikeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      bikeBrand: selectedBikeBrandSlug || undefined,
      bikeModel: selectedBikeModelSlug || undefined,
      category: undefined,
      page: 1,
    });
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const activeSlide = slides[currentSlide];

  return (
    <div className="relative bg-zinc-950 text-white overflow-hidden border-b border-zinc-800">
      {/* Main Sliding Banner Container */}
      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Slide Content with smooth transition */}
        <div
          className={`w-full py-8 sm:py-12 md:py-14 px-4 bg-gradient-to-r ${activeSlide.bgGradient} transition-all duration-700 relative`}
        >
          {/* Background ambient motorcycle pattern */}
          <div
            className="absolute inset-0 opacity-15 bg-cover bg-center mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1920&q=80')`,
            }}
          />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Brand Hero Text with Official Logo */}
              <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
                {/* Official Logo Integration */}
                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-black border border-zinc-700/80 p-1 shadow-2xl shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src="/logo.jpg"
                      alt="Bismillah Motors Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider mb-1 bg-red-600/20 border-red-500/40 text-red-400">
                      <Sparkles className="w-3 h-3 text-red-400" />
                      <span>{activeSlide.tagline}</span>
                    </div>
                    <p className="text-xs font-bold text-zinc-300">
                      Jashore Sadar, 7400, Bangladesh
                    </p>
                  </div>
                </div>

                {/* Main Heading */}
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight">
                  {activeSlide.title} <br className="hidden sm:inline" />
                  <span className={`${activeSlide.accentColor} underline decoration-red-600/40 underline-offset-8`}>
                    {activeSlide.highlight}
                  </span>
                </h1>

                <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed mx-auto lg:mx-0">
                  {activeSlide.description}
                </p>

                {/* Badges */}
                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-[11px] font-semibold text-zinc-300">
                  <span className="bg-zinc-900/90 border border-zinc-800 px-3 py-1 rounded-md flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-red-500" /> 100% Genuine OEM
                  </span>
                  <span className="bg-zinc-900/90 border border-zinc-800 px-3 py-1 rounded-md flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-red-500" /> Courier Across All 64 Districts
                  </span>
                  <span className="bg-zinc-900/90 border border-zinc-800 px-3 py-1 rounded-md flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-emerald-400" /> Cash on Delivery
                  </span>
                </div>

                {/* Primary CTA */}
                <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <button
                    onClick={() => {
                      activeSlide.filterAction();
                      const el = document.getElementById('products-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer"
                  >
                    <span>{activeSlide.ctaText}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <a
                    href="https://wa.me/8801974060224?text=Hello%20Bismillah%20Motors,%20I%20am%20looking%20for%20bike%20parts."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-5 bg-zinc-900 hover:bg-black border border-zinc-700 text-zinc-200 text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>WhatsApp: +8801974060224</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Sliding Products Showcase Cards */}
              <div className="lg:col-span-6">
                <div className="bg-zinc-900/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-zinc-700/80 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-white">
                        Featured In This Collection
                      </h3>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-medium">Instant Add & Buy</span>
                  </div>

                  {/* 3 Sliding Product Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {activeSlide.slideProducts.map((prod) => {
                      const activePrice = prod.discountPrice ?? prod.price;
                      const discountPercent =
                        prod.discountPrice && prod.discountPrice < prod.price
                          ? Math.round(((prod.price - prod.discountPrice) / prod.price) * 100)
                          : null;
                      const imgUrl =
                        prod.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80';

                      return (
                        <div
                          key={prod.id}
                          onClick={() => setSelectedProductForModal(prod)}
                          className="bg-zinc-950/90 rounded-xl p-3 border border-zinc-800 hover:border-red-500 transition-all flex flex-col justify-between group cursor-pointer relative"
                        >
                          {discountPercent && (
                            <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                              {discountPercent}% OFF
                            </span>
                          )}

                          <div className="aspect-square bg-zinc-900 rounded-lg p-2 mb-2 flex items-center justify-center overflow-hidden">
                            <img
                              src={imgUrl}
                              alt={prod.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                            />
                          </div>

                          <div>
                            <span className="text-[9px] font-extrabold text-red-500 uppercase tracking-wider block truncate">
                              {prod.brand?.name}
                            </span>
                            <h4 className="text-[11px] font-bold text-zinc-100 line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                              {prod.name}
                            </h4>
                          </div>

                          <div className="mt-2 pt-2 border-t border-zinc-800/80">
                            <div className="flex items-baseline justify-between">
                              <span className="text-xs font-black text-red-500">
                                ৳{activePrice.toLocaleString()}
                              </span>
                              {prod.discountPrice && (
                                <span className="text-[10px] text-zinc-500 line-through">
                                  ৳{prod.price.toLocaleString()}
                                </span>
                              )}
                            </div>

                            {/* Dual action buttons right on the slider card! */}
                            <div className="grid grid-cols-2 gap-1.5 mt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(prod, 1, true);
                                }}
                                className="py-1 px-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer"
                                title="Add to Cart"
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
                                className="py-1 px-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold rounded flex items-center justify-center gap-0.5 cursor-pointer"
                                title="Buy Now"
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
              </div>
            </div>
          </div>
        </div>

        {/* Previous / Next Arrow Controls */}
        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/90 text-white border border-zinc-700 flex items-center justify-center transition-all z-20 cursor-pointer shadow-lg hover:scale-105"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/90 text-white border border-zinc-700 flex items-center justify-center transition-all z-20 cursor-pointer shadow-lg hover:scale-105"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Indicator Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentSlide === idx ? 'w-8 bg-red-600' : 'w-2 bg-zinc-600 hover:bg-zinc-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Docked Bike Finder Strip (Select Bike Model Fast) */}
      <div className="bg-zinc-900 border-t border-zinc-800 py-3.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <Search className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Find Exact Parts By Bike:
            </span>
          </div>

          <form onSubmit={handleBikeSearch} className="flex-1 w-full flex flex-col sm:flex-row items-center gap-2">
            <select
              value={selectedBikeBrandSlug}
              onChange={(e) => {
                setSelectedBikeBrandSlug(e.target.value);
                setSelectedBikeModelSlug('');
              }}
              className="w-full sm:w-1/2 bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2 text-xs focus:border-red-500 font-medium"
            >
              <option value="">-- Step 1: Select Bike Brand (Yamaha, Suzuki, TVS, Bajaj) --</option>
              {bikeBrands.map((bb) => (
                <option key={bb.id} value={bb.slug}>
                  {bb.name}
                </option>
              ))}
            </select>

            <select
              value={selectedBikeModelSlug}
              onChange={(e) => setSelectedBikeModelSlug(e.target.value)}
              disabled={!selectedBikeBrandSlug || !activeBikeBrand}
              className="w-full sm:w-1/2 bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2 text-xs focus:border-red-500 font-medium disabled:opacity-40"
            >
              <option value="">
                {!selectedBikeBrandSlug
                  ? '-- Step 2: Choose Bike Brand first --'
                  : '-- Step 2: Select Model (e.g. R15 V3, Gixxer, RTR 4V) --'}
              </option>
              {activeBikeBrand?.models.map((bm) => (
                <option key={bm.id} value={bm.slug}>
                  {bm.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={!selectedBikeBrandSlug}
              className="w-full sm:w-auto px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-xs rounded-lg transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Fitment</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
