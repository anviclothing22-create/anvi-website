import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Category } from '@/types/category';

interface ProductSearchProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  categories: Category[];
  onReset: () => void;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  categories,
  onReset,
}) => {
  const hasFilters = searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all';

  return (
    <div className="bg-white p-4 rounded-2xl border border-anvi-sand/60 shadow-luxury-subtle flex flex-col md:flex-row items-stretch md:items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-anvi-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, SKU, or craftsmanship..."
          className="pl-9 h-10 text-xs"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-anvi-muted hover:text-anvi-charcoal"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Dropdown */}
      <div className="w-full md:w-48">
        <Select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="h-10 text-xs"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Status Dropdown */}
      <div className="w-full md:w-44">
        <Select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-10 text-xs"
        >
          <option value="all">All Stock Statuses</option>
          <option value="in_stock">In Stock (&gt;10)</option>
          <option value="low_stock">Low Stock (1-9)</option>
          <option value="out_of_stock">Sold Out (0)</option>
          <option value="active">Active Only</option>
          <option value="draft">Draft / Archived</option>
        </Select>
      </div>

      {/* Clear Filters Button */}
      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-anvi-maroon hover:bg-anvi-maroon/5 rounded-xl transition-colors font-medium border border-anvi-sand/60"
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      )}
    </div>
  );
};
export default ProductSearch;
