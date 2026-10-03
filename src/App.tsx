import React, { useState, useEffect, useCallback } from 'react';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { Header } from './components/Header.tsx';
import { HeroBannerSlider } from './components/HeroBannerSlider.tsx';
import { ProductSliderMarquee } from './components/ProductSliderMarquee.tsx';
import { CategoryNav } from './components/CategoryNav.tsx';
import { BrandBar } from './components/BrandBar.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductFilterSidebar } from './components/ProductFilterSidebar.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrderSuccessModal } from './components/OrderSuccessModal.tsx';
import { OrderTrackerModal } from './components/OrderTrackerModal.tsx';
import { FloatingWhatsApp } from './components/FloatingWhatsApp.tsx';
import { Footer } from './components/Footer.tsx';
import { AdminLoginModal } from './components/admin/AdminLoginModal.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import {
  fetchProducts,
  fetchCategories,
  fetchBrands,
  fetchBikeBrands,
  getAdminToken,
} from './lib/api.ts';
import { Product, Category, Brand, BikeBrand, FilterState } from './types.ts';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Phone,
  Sparkles,
  ShieldCheck,
  Truck,
  CheckCircle,
} from 'lucide-react';
import { AuthProvider } from './context/AuthContext.tsx';
import { SHOP_INFO } from './server/constants.ts';

const MainShop: React.FC = () => {
  const { selectedProductForModal, setSelectedProductForModal } = useCart();

  // Shop state
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [bikeBrands, setBikeBrands] = useState<BikeBrand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    page: 1,
    sort: 'newest',
  });

  // Admin state
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Initial metadata and taxonomies load
  const loadTaxonomies = useCallback(async () => {
    try {
      const [cats, brs, bbs, feat] = await Promise.all([
        fetchCategories(),
        fetchBrands(),
        fetchBikeBrands(),
        fetchProducts({ isFeatured: true, limit: 6 } as any),
      ]);
      setCategories(cats);
      setBrands(brs);
      setBikeBrands(bbs);
      setFeaturedProducts(feat.products || []);
    } catch (e) {
      console.error('Failed to load initial data:', e);
    }
  }, []);

  useEffect(() => {
    loadTaxonomies();
  }, [loadTaxonomies]);

  // Load products whenever filters change
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchProducts(filters);
      setProducts(res.products);
      setTotalProducts(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      sort: 'newest',
    });
  };

  const handleOpenAdmin = () => {
    const token = getAdminToken();
    if (token) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-red-500 selection:text-white">
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AutoPartsStore',
            name: 'Bismillah Motors',
            description:
              'Genuine Yamaha, Suzuki, TVS motorcycle spare parts and stickers in Jashore, Bangladesh.',
            telephone: SHOP_INFO.phone,
            email: SHOP_INFO.email,
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Jashore Sadar',
              postalCode: '7400',
              addressCountry: 'BD',
            },
            paymentAccepted: 'Cash on Delivery',
            priceRange: '৳৳',
          }),
        }}
      />

      {/* Header */}
      <Header
        filters={filters}
        onFilterChange={handleFilterChange}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Hero Banner Slider with Products & Official Logo */}
      <HeroBannerSlider
        products={products.length > 0 ? products : featuredProducts}
        bikeBrands={bikeBrands}
        onFilterChange={handleFilterChange}
      />

      {/* Category Icons Navigation */}
      <CategoryNav
        categories={categories}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Brand Horizontal Filter Bar */}
      <BrandBar brands={brands} filters={filters} onFilterChange={handleFilterChange} />

      {/* Horizontal Sliding Products Marquee */}
      <ProductSliderMarquee
        products={featuredProducts.length > 0 ? featuredProducts : products}
      />

      {/* Main Catalog Body */}
      <main id="products-section" className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Active Filter Chips & Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-gray-200 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">
                {filters.category
                  ? categories.find((c) => c.slug === filters.category)?.name || 'Motorcycle Parts'
                  : filters.brand
                  ? `${brands.find((b) => b.slug === filters.brand)?.name || ''} Parts`
                  : 'All Motorcycle Parts & Accessories'}
              </h2>
              <span className="text-xs bg-red-100 text-red-700 font-extrabold px-2 py-0.5 rounded-full">
                {totalProducts} Items
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing genuine motorcycle components ready for immediate dispatch
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
            {/* Mobile Filter toggle button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-red-600" />
              <span>Filters</span>
            </button>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-gray-500 font-semibold hidden sm:inline">SORT:</span>
              <select
                value={filters.sort || 'newest'}
                onChange={(e) => handleFilterChange({ sort: e.target.value, page: 1 })}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-red-600 shadow-2xs cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Pills (Click to remove) */}
        {(filters.category ||
          filters.brand ||
          filters.bikeBrand ||
          filters.bikeModel ||
          filters.search ||
          filters.inStock ||
          filters.minPrice !== undefined ||
          filters.maxPrice !== undefined) && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-red-50/50 rounded-xl border border-red-100 text-xs">
            <span className="font-extrabold text-red-900 uppercase text-[11px]">Active Filters:</span>
            {filters.category && (
              <span className="inline-flex items-center gap-1 bg-white border border-red-200 text-red-700 px-2.5 py-1 rounded-md font-semibold">
                Category: {categories.find((c) => c.slug === filters.category)?.name}
                <button
                  onClick={() => handleFilterChange({ category: undefined, page: 1 })}
                  className="hover:text-red-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.brand && (
              <span className="inline-flex items-center gap-1 bg-white border border-red-200 text-red-700 px-2.5 py-1 rounded-md font-semibold">
                Brand: {brands.find((b) => b.slug === filters.brand)?.name}
                <button
                  onClick={() => handleFilterChange({ brand: undefined, page: 1 })}
                  className="hover:text-red-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.bikeBrand && (
              <span className="inline-flex items-center gap-1 bg-white border border-red-200 text-red-700 px-2.5 py-1 rounded-md font-semibold">
                Bike: {bikeBrands.find((b) => b.slug === filters.bikeBrand)?.name}
                <button
                  onClick={() => handleFilterChange({ bikeBrand: undefined, bikeModel: undefined, page: 1 })}
                  className="hover:text-red-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.bikeModel && (
              <span className="inline-flex items-center gap-1 bg-white border border-red-200 text-red-700 px-2.5 py-1 rounded-md font-semibold">
                Model: {filters.bikeModel}
                <button
                  onClick={() => handleFilterChange({ bikeModel: undefined, page: 1 })}
                  className="hover:text-red-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center gap-1 bg-white border border-red-200 text-red-700 px-2.5 py-1 rounded-md font-semibold">
                Keyword: "{filters.search}"
                <button
                  onClick={() => handleFilterChange({ search: undefined, page: 1 })}
                  className="hover:text-red-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.inStock && (
              <span className="inline-flex items-center gap-1 bg-white border border-red-200 text-red-700 px-2.5 py-1 rounded-md font-semibold">
                In Stock Only
                <button
                  onClick={() => handleFilterChange({ inStock: undefined, page: 1 })}
                  className="hover:text-red-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
              <span className="inline-flex items-center gap-1 bg-white border border-red-200 text-red-700 px-2.5 py-1 rounded-md font-semibold">
                Price: ৳{filters.minPrice || 0} - ৳{filters.maxPrice || '∞'}
                <button
                  onClick={() => handleFilterChange({ minPrice: undefined, maxPrice: undefined, page: 1 })}
                  className="hover:text-red-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="text-red-600 hover:underline font-bold text-xs ml-auto cursor-pointer"
            >
              Reset All
            </button>
          </div>
        )}

        {/* 2-Column Layout: Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1 sticky top-24">
            <ProductFilterSidebar
              categories={categories}
              brands={brands}
              bikeBrands={bikeBrands}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Product Grid Area */}
          <div className="lg:col-span-3 space-y-8">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-white rounded-xl border border-gray-200">
                <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                <p className="text-xs font-bold text-gray-500">Loading Bismillah Motors Inventory...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-gray-200 p-8 space-y-3">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                  <SlidersHorizontal className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No motorcycle parts matched your search</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Try clearing some filter criteria, searching by different keywords, or check our
                  WhatsApp support for custom parts procurement.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-2 py-2 px-6 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                {/* 4-column product grid matching bikepartsbd */}
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200 text-xs">
                    <span className="text-gray-500">
                      Showing page <strong>{filters.page || 1}</strong> of{' '}
                      <strong>{totalPages}</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          handleFilterChange({
                            page: Math.max(1, (filters.page || 1) - 1),
                          })
                        }
                        disabled={(filters.page || 1) <= 1}
                        className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                        title="Previous page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => handleFilterChange({ page: p })}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            (filters.page || 1) === p
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {p}
                        </button>
                      ))}

                      <button
                        onClick={() =>
                          handleFilterChange({
                            page: Math.min(totalPages, (filters.page || 1) + 1),
                          })
                        }
                        disabled={(filters.page || 1) >= totalPages}
                        className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                        title="Next page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Featured Products Showcase Section */}
        {featuredProducts.length > 0 && (
          <section className="mt-16 pt-10 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[11px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Handpicked Genuine Parts
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">
                  Featured Motorcycle Parts
                </h3>
              </div>
              <button
                onClick={() => handleFilterChange({ isFeatured: true, page: 1 })}
                className="text-xs font-extrabold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
              >
                View All Featured →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {featuredProducts.map((fp) => (
                <ProductCard key={`feat-${fp.id}`} product={fp} />
              ))}
            </div>
          </section>
        )}

        {/* Support & Hotlines Banner (matching bikepartsbd.net) */}
        <section className="mt-16 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 text-center space-y-3 shadow-xs">
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest block">
            Genuine Parts এর সাথে অভিজ্ঞ পরামর্শের জন্য কল দিন :
          </span>
          <a
            href={`tel:${SHOP_INFO.phone}`}
            className="text-2xl sm:text-4xl font-black text-gray-900 hover:text-red-600 transition-colors inline-block tracking-tight font-mono"
          >
            {SHOP_INFO.phone}
          </a>
          <p className="text-xs text-gray-500 max-w-lg mx-auto">
            Contact our senior motorcycle mechanics in Jashore Sadar for exact part compatibility,
            engine tuning advice, or wholesale orders.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-gray-700">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Cash on Delivery Guaranteed
            </span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1.5 text-blue-700">
              <Truck className="w-4 h-4 text-blue-600" /> Sundarban & Steadfast Courier
            </span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1.5 text-red-700">
              <ShieldCheck className="w-4 h-4 text-red-600" /> 100% Original Japanese & Indian Parts
            </span>
          </div>
        </section>
      </main>

      {/* Mobile Filter Slide-Over Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            onClick={() => setMobileFilterOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl p-4 overflow-y-auto animate-in slide-in-from-left">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200">
              <h3 className="font-bold text-sm text-gray-900 uppercase">Filter Products</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ProductFilterSidebar
              categories={categories}
              brands={brands}
              bikeBrands={bikeBrands}
              filters={filters}
              onFilterChange={(f) => {
                handleFilterChange(f);
                setMobileFilterOpen(false);
              }}
              onClearFilters={() => {
                handleClearFilters();
                setMobileFilterOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProductForModal && (
        <ProductDetailModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
        />
      )}

      {/* Shopping Cart Drawer */}
      <CartDrawer />

      {/* Cash on Delivery Checkout Modal */}
      <CheckoutModal />

      {/* Order Confirmed & WhatsApp Ordering Modal */}
      <OrderSuccessModal />

      {/* Customer Order Tracker Modal */}
      <OrderTrackerModal />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoginOpen(false);
          setIsAdminDashboardOpen(true);
        }}
      />

      {/* Admin Full Management Dashboard */}
      {isAdminDashboardOpen && (
        <AdminDashboard
          categories={categories}
          brands={brands}
          bikeBrands={bikeBrands}
          onClose={() => setIsAdminDashboardOpen(false)}
          onRefreshData={() => {
            loadTaxonomies();
            loadProducts();
          }}
        />
      )}

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp />

      {/* Footer */}
      <Footer
        onCategorySelect={(slug) => handleFilterChange({ category: slug, page: 1 })}
        onBrandSelect={(slug) => handleFilterChange({ brand: slug, page: 1 })}
        onOpenAdmin={handleOpenAdmin}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainShop />
      </CartProvider>
    </AuthProvider>
  );
}
