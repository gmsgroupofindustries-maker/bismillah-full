import React from 'react';
import { Category, FilterState } from '../types.ts';
import {
  Cog,
  Disc,
  Link as LinkIcon,
  Zap,
  Filter,
  Layers,
  Sparkles,
  Shield,
  Box,
} from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({ categories, filters, onFilterChange }) => {
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'engine-parts':
        return <Cog className="w-5 h-5" />;
      case 'brake-parts':
        return <Disc className="w-5 h-5" />;
      case 'chain-and-sprocket':
        return <LinkIcon className="w-5 h-5" />;
      case 'electrical':
        return <Zap className="w-5 h-5" />;
      case 'filters':
        return <Filter className="w-5 h-5" />;
      case 'clutch-parts':
        return <Layers className="w-5 h-5" />;
      case 'body-parts':
        return <Shield className="w-5 h-5" />;
      case 'stickers-and-accessories':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Box className="w-5 h-5" />;
    }
  };

  const handleCategoryClick = (slug: string) => {
    if (filters.category === slug) {
      onFilterChange({ category: undefined, page: 1 });
    } else {
      onFilterChange({ category: slug, page: 1 });
    }
  };

  return (
    <section className="bg-white py-6 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 uppercase tracking-tight">
              Browse by Category
            </h2>
            <p className="text-xs text-gray-500">Genuine components for all motorcycle systems</p>
          </div>
          {filters.category && (
            <button
              onClick={() => onFilterChange({ category: undefined, page: 1 })}
              className="text-xs font-semibold text-red-600 hover:text-red-700 underline"
            >
              Clear Category Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-2.5 sm:gap-3">
          {categories.map((cat) => {
            const isSelected = filters.category === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer group ${
                  isSelected
                    ? 'border-red-600 bg-red-50/80 text-red-700 shadow-xs ring-1 ring-red-500'
                    : 'border-gray-200 hover:border-red-300 hover:bg-gray-50/80 text-gray-700'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-colors ${
                    isSelected
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 group-hover:bg-red-100 text-gray-700 group-hover:text-red-600'
                  }`}
                >
                  {getCategoryIcon(cat.slug)}
                </div>
                <span className="text-[11px] font-bold leading-tight line-clamp-2">
                  {cat.name}
                </span>
                {cat._count?.products !== undefined && (
                  <span className="text-[10px] text-gray-600 mt-1">
                    {cat._count.products} parts
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
