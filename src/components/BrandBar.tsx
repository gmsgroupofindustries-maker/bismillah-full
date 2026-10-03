import React from 'react';
import { Brand, FilterState } from '../types.ts';

interface BrandBarProps {
  brands: Brand[];
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
}

export const BrandBar: React.FC<BrandBarProps> = ({ brands, filters, onFilterChange }) => {
  return (
    <div className="bg-gray-100 py-3 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 shrink-0">
          Filter by Brand:
        </span>
        <button
          onClick={() => onFilterChange({ brand: undefined, page: 1 })}
          className={`px-3 py-1 text-xs rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
            !filters.brand
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-300'
          }`}
        >
          All Brands
        </button>
        {brands.map((b) => {
          const isSelected = filters.brand === b.slug;
          return (
            <button
              key={b.id}
              onClick={() => onFilterChange({ brand: isSelected ? undefined : b.slug, page: 1 })}
              className={`px-3 py-1 text-xs rounded-full font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-300'
              }`}
            >
              <span>{b.name}</span>
              {b._count?.products !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-red-700 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {b._count.products}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
