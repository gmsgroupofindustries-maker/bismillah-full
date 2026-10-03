import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Search,
  ShoppingCart,
  ShieldCheck,
  PackageCheck,
  Menu,
  X,
  Sparkles,
  User,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { FilterState } from '../types.ts';
import { Logo } from './Logo.tsx';

interface HeaderProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ filters, onFilterChange, onOpenAdmin }) => {
  const { totalItems, subtotal, setIsCartOpen, setIsOrderTrackerOpen } = useCart();
  const { currentUser, userProfile, isAdmin, signInWithGoogle, signOut, loading: authLoading } = useAuth();
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ search: searchInput, page: 1 });
  };

  const selectBrandFilter = (brandSlug: string) => {
    onFilterChange({ brand: brandSlug, category: undefined, bikeBrand: undefined, page: 1 });
    setMobileMenuOpen(false);
  };

  const selectCategoryFilter = (catSlug: string) => {
    onFilterChange({ category: catSlug, brand: undefined, page: 1 });
    setMobileMenuOpen(false);
  };

  const resetAll = () => {
    setSearchInput('');
    onFilterChange({
      category: undefined,
      brand: undefined,
      bikeBrand: undefined,
      bikeModel: undefined,
      search: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      page: 1,
    });
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
      {/* 1. Top Bar */}
      <div className="bg-zinc-950 text-zinc-300 text-xs py-2 px-4 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap items-center gap-4 text-center md:text-left justify-center">
            <a
              href="tel:+8801974060224"
              className="flex items-center gap-1.5 hover:text-red-400 transition-colors font-medium text-white"
            >
              <Phone className="w-3.5 h-3.5 text-red-500" />
              <span>+8801974060224</span>
            </a>
            <span className="hidden sm:inline text-zinc-600">|</span>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>Jashore Sadar, 7400, Bangladesh</span>
            </div>
            <span className="hidden md:inline text-zinc-600">|</span>
            <span className="hidden md:inline text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine OEM Parts Guaranteed
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOrderTrackerOpen(true)}
              className="flex items-center gap-1 hover:text-white transition-colors text-zinc-300 cursor-pointer"
            >
              <PackageCheck className="w-3.5 h-3.5 text-red-500" />
              <span>Track Order</span>
            </button>
            <span className="text-zinc-600">|</span>
            <a
              href="mailto:marianatrench6900@gmail.com"
              className="hidden lg:flex items-center gap-1 hover:text-white transition-colors text-zinc-400"
            >
              <Mail className="w-3.5 h-3.5 text-zinc-500" />
              <span>marianatrench6900@gmail.com</span>
            </a>
            <span className="hidden lg:inline text-zinc-600">|</span>
            <button
              onClick={onOpenAdmin}
              className="text-xs text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation & Search */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          {/* Logo */}
          <div
            onClick={resetAll}
            className="flex items-center cursor-pointer shrink-0"
          >
            <Logo size="md" />
          </div>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl relative items-center"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search motorcycle parts, model (e.g. R15 V3, Gixxer, RTR 4V)..."
                className="w-full pl-4 pr-10 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-hidden focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all shadow-2xs"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    onFilterChange({ search: undefined, page: 1 });
                  }}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs px-1"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center justify-center transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* User Account / Google Sign-In */}
            <div className="relative">
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || 'User'}
                        className="w-7 h-7 rounded-full object-cover border border-red-200"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">
                        {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="hidden sm:inline text-xs font-semibold text-gray-800 max-w-[100px] truncate">
                      {currentUser.displayName?.split(' ')[0] || 'Account'}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900 truncate">{currentUser.displayName || 'Customer'}</p>
                        <p className="text-[11px] text-gray-500 truncate">{currentUser.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">
                            Store Admin
                          </span>
                        )}
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenAdmin();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4" /> Admin Portal
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setIsOrderTrackerOpen(true);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                      >
                        <PackageCheck className="w-4 h-4 text-gray-400" /> My Orders / Track
                      </button>

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          await signOut();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      await signInWithGoogle();
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50/50 text-gray-700 transition-all text-xs font-semibold cursor-pointer shadow-2xs"
                  title="Sign in with Google"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-3 px-3 py-2 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-700 rounded-lg transition-all cursor-pointer group"
              aria-label="Open cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-red-600 group-hover:scale-105 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold text-gray-500 leading-none">Cart</span>
                <span className="text-xs font-extrabold text-red-700 leading-tight">
                  ৳{subtotal.toLocaleString()}
                </span>
              </div>
            </button>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden mt-3">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search parts by name, model, SKU..."
              className="w-full pl-3.5 pr-10 py-2 text-xs rounded-lg border border-gray-300 focus:outline-hidden focus:border-red-600"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-2.5 bg-red-600 text-white rounded-md"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* 3. Category & Brand Fast Navigation Bar */}
      <nav className="border-t border-gray-100 bg-gray-50/80 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs font-semibold text-gray-700">
          <div className="flex items-center gap-1">
            <button
              onClick={resetAll}
              className={`px-3 py-2.5 transition-colors cursor-pointer border-b-2 ${
                !filters.brand && !filters.category
                  ? 'border-red-600 text-red-600 bg-white font-bold'
                  : 'border-transparent hover:text-red-600'
              }`}
            >
              All Parts
            </button>
            <button
              onClick={() => selectBrandFilter('yamaha')}
              className={`px-3 py-2.5 transition-colors cursor-pointer border-b-2 ${
                filters.brand === 'yamaha'
                  ? 'border-red-600 text-red-600 bg-white font-bold'
                  : 'border-transparent hover:text-red-600'
              }`}
            >
              Yamaha Parts
            </button>
            <button
              onClick={() => selectBrandFilter('suzuki')}
              className={`px-3 py-2.5 transition-colors cursor-pointer border-b-2 ${
                filters.brand === 'suzuki'
                  ? 'border-red-600 text-red-600 bg-white font-bold'
                  : 'border-transparent hover:text-red-600'
              }`}
            >
              Suzuki Parts
            </button>
            <button
              onClick={() => selectBrandFilter('tvs')}
              className={`px-3 py-2.5 transition-colors cursor-pointer border-b-2 ${
                filters.brand === 'tvs'
                  ? 'border-red-600 text-red-600 bg-white font-bold'
                  : 'border-transparent hover:text-red-600'
              }`}
            >
              TVS Parts
            </button>
            <button
              onClick={() => selectBrandFilter('bajaj')}
              className={`px-3 py-2.5 transition-colors cursor-pointer border-b-2 ${
                filters.brand === 'bajaj'
                  ? 'border-red-600 text-red-600 bg-white font-bold'
                  : 'border-transparent hover:text-red-600'
              }`}
            >
              Bajaj Parts
            </button>
            <button
              onClick={() => selectCategoryFilter('stickers-and-accessories')}
              className={`px-3 py-2.5 transition-colors cursor-pointer border-b-2 flex items-center gap-1 ${
                filters.category === 'stickers-and-accessories'
                  ? 'border-red-600 text-red-600 bg-white font-bold'
                  : 'border-transparent hover:text-red-600 text-amber-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Stickers & Decals
            </button>
          </div>

          <div className="flex items-center gap-3 text-gray-500 py-1">
            <span className="text-[11px] font-medium bg-red-100/60 text-red-700 px-2 py-0.5 rounded">
              Cash on Delivery Across BD
            </span>
          </div>
        </div>
      </nav>

      {/* 4. Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white p-4 space-y-3 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={resetAll}
              className="p-2.5 bg-gray-100 rounded text-left hover:bg-red-50 hover:text-red-600"
            >
              All Parts
            </button>
            <button
              onClick={() => selectBrandFilter('yamaha')}
              className="p-2.5 bg-gray-100 rounded text-left hover:bg-red-50 hover:text-red-600"
            >
              Yamaha Parts
            </button>
            <button
              onClick={() => selectBrandFilter('suzuki')}
              className="p-2.5 bg-gray-100 rounded text-left hover:bg-red-50 hover:text-red-600"
            >
              Suzuki Parts
            </button>
            <button
              onClick={() => selectBrandFilter('tvs')}
              className="p-2.5 bg-gray-100 rounded text-left hover:bg-red-50 hover:text-red-600"
            >
              TVS Parts
            </button>
            <button
              onClick={() => selectBrandFilter('bajaj')}
              className="p-2.5 bg-gray-100 rounded text-left hover:bg-red-50 hover:text-red-600"
            >
              Bajaj Parts
            </button>
            <button
              onClick={() => selectCategoryFilter('stickers-and-accessories')}
              className="p-2.5 bg-amber-50 text-amber-800 rounded text-left font-bold"
            >
              ✨ Stickers & Decals
            </button>
          </div>

          <div className="pt-2 border-t border-gray-200 flex flex-col gap-2">
            <button
              onClick={() => {
                setIsOrderTrackerOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 px-3 text-xs font-semibold bg-zinc-900 text-white rounded flex items-center justify-center gap-2"
            >
              <PackageCheck className="w-4 h-4 text-red-500" /> Track My Order
            </button>
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 px-3 text-xs font-semibold border border-gray-300 rounded text-gray-700"
            >
              Admin Login
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
