import React, { useState } from 'react';
import { Category, Brand, BikeBrand, FilterState } from '../types.ts';
import { RotateCcw, Filter, Check, SlidersHorizontal } from 'lucide-react';

interface ProductFilterSidebarProps {
  categories: Category[];
  brands: Brand[];
  bikeBrands: BikeBrand[];
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
}

export const ProductFilterSidebar: React.FC<ProductFilterSidebarProps> = ({
  categories,
  brands,
  bikeBrands,
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const [minPriceInput, setMinPriceInput] = useState<string>(
    filters.minPrice !== undefined ? String(filters.minPrice) : ''
  );
  const [maxPriceInput, setMaxPriceInput] = useState<string>(
    filters.maxPrice !== undefined ? String(filters.maxPrice) : ''
  );

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      minPrice: minPriceInput ? parseFloat(minPriceInput) : undefined,
      maxPrice: maxPriceInput ? parseFloat(maxPriceInput) : undefined,
      page: 1,
    });
  };

  const activeBikeBrand = bikeBrands.find((b) => b.slug === filters.bikeBrand);

  return (
    <aside className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-red-600" />
          <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">Filters</h3>
        </div>
        <button
          onClick={() => {
            setMinPriceInput('');
            setMaxPriceInput('');
            onClearFilters();
          }}
          className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" /> Clear All
        </button>
      </div>

      {/* Stock Filter Toggle */}
      <div>
        <label className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer">
          <span className="text-xs font-bold text-gray-800">In Stock Only</span>
          <input
            type="checkbox"
            checked={Boolean(filters.inStock)}
            onChange={(e) => onFilterChange({ inStock: e.target.checked ? true : undefined, page: 1 })}
            className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
          />
        </label>
      </div>

      {/* Categories Filter */}
      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 mb-2.5">
          Categories
        </h4>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          {categories.map((c) => {
            const isSelected = filters.category === c.slug;
            return (
              <button
                key={c.id}
                onClick={() => onFilterChange({ category: isSelected ? undefined : c.slug, page: 1 })}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-red-50 text-red-700 font-bold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="truncate">{c.name}</span>
                {c._count?.products !== undefined && (
                  <span className="text-[10px] text-gray-600 shrink-0">
                    ({c._count.products})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 mb-2.5">
          Brand
        </h4>
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
          {brands.map((b) => {
            const isSelected = filters.brand === b.slug;
            return (
              <button
                key={b.id}
                onClick={() => onFilterChange({ brand: isSelected ? undefined : b.slug, page: 1 })}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-red-50 text-red-700 font-bold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="truncate">{b.name}</span>
                {b._count?.products !== undefined && (
                  <span className="text-[10px] text-gray-600 shrink-0">
                    ({b._count.products})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bike Compatibility Filter */}
      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 mb-2.5">
          Bike Compatibility
        </h4>

        {/* Bike Brand selection */}
        <select
          value={filters.bikeBrand || ''}
          onChange={(e) =>
            onFilterChange({
              bikeBrand: e.target.value || undefined,
              bikeModel: undefined,
              page: 1,
            })
          }
          className="w-full text-xs bg-gray-50 border border-gray-300 rounded-lg p-2 text-gray-800 focus:outline-hidden focus:border-red-600 mb-2"
        >
          <option value="">All Bike Brands</option>
          {bikeBrands.map((bb) => (
            <option key={bb.id} value={bb.slug}>
              {bb.name}
            </option>
          ))}
        </select>

        {/* Bike Model selection */}
        {activeBikeBrand && (
          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {activeBikeBrand.models.map((bm) => {
              const isSelected = filters.bikeModel === bm.slug;
              return (
                <button
                  key={bm.id}
                  onClick={() => onFilterChange({ bikeModel: isSelected ? undefined : bm.slug, page: 1 })}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-red-50 text-red-700 font-bold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="truncate">{bm.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 mb-2.5 flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" /> Price Range (BDT ৳)
        </h4>
        <form onSubmit={handlePriceApply} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                placeholder="Min ৳"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 focus:border-red-600"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max ৳"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 focus:border-red-600"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-1.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded transition-colors cursor-pointer"
          >
            Apply Price Filter
          </button>
        </form>
      </div>
    </aside>
  );
};
