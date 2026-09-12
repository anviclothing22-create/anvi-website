import React, { useState, useMemo } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { ProductSearch } from './components/ProductSearch';
import { ProductTable } from './components/ProductTable';
import { AddProductModal } from './modals/AddProductModal';
import { EditProductModal } from './modals/EditProductModal';
import { DeleteProductModal } from './modals/DeleteProductModal';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Product, ProductFormData } from '@/types/product';
import { Pagination } from '@/components/shared/Pagination';

export const ProductsPage: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    refreshProducts,
  } = useProducts();
  const { categories } = useCategories();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filtered products calculation
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const stock = item.stockQuantity ?? item.stock ?? 0;
      const catSlug = item.categorySlug || item.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const isActive = item.isActive ?? true;

      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.name.toLowerCase().includes(q);
        const matchSku = item.sku.toLowerCase().includes(q);
        const matchFabric = item.fabric?.toLowerCase().includes(q) || item.fabricCare?.toLowerCase().includes(q);
        if (!matchTitle && !matchSku && !matchFabric) return false;
      }

      // Category
      if (selectedCategory !== 'all' && catSlug !== selectedCategory && item.category !== selectedCategory) {
        return false;
      }

      // Status
      if (selectedStatus === 'in_stock' && stock < 10) return false;
      if (selectedStatus === 'low_stock' && (stock === 0 || stock >= 10)) return false;
      if (selectedStatus === 'out_of_stock' && stock !== 0) return false;
      if (selectedStatus === 'active' && !isActive) return false;
      if (selectedStatus === 'draft' && isActive) return false;

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  const handleAddSubmit = (data: ProductFormData) => {
    setActionLoading(true);
    setTimeout(() => {
      addProduct(data);
      setActionLoading(false);
      setIsAddOpen(false);
    }, 400);
  };

  const handleEditSubmit = (id: string, data: Partial<ProductFormData>) => {
    setActionLoading(true);
    setTimeout(() => {
      updateProduct(id, data);
      setActionLoading(false);
      setEditingProduct(null);
    }, 400);
  };

  const handleDeleteSubmit = (id: string) => {
    setActionLoading(true);
    setTimeout(() => {
      deleteProduct(id);
      setActionLoading(false);
      setDeletingProduct(null);
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Creations & Catalogue"
        subtitle={`Managing ${products.length} bespoke Indian ensembles, sarees, salwars, and kidswear.`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshProducts}
              className="text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setIsAddOpen(true)}
              className="text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Creation</span>
            </Button>
          </div>
        }
      />

      {/* Filter Controls */}
      <ProductSearch
        searchQuery={searchQuery}
        onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
        selectedCategory={selectedCategory}
        onCategoryChange={(cat) => { setSelectedCategory(cat); setCurrentPage(1); }}
        selectedStatus={selectedStatus}
        onStatusChange={(status) => { setSelectedStatus(status); setCurrentPage(1); }}
        categories={categories}
        onReset={handleResetFilters}
      />

      {/* Products Table */}
      <ProductTable
        products={paginatedProducts}
        onEdit={(p) => setEditingProduct(p)}
        onDelete={(p) => setDeletingProduct(p)}
        onToggleStatus={toggleProductStatus}
        onAddProduct={() => setIsAddOpen(true)}
        isFiltered={searchQuery !== '' || selectedCategory !== 'all' || selectedStatus !== 'all'}
      />

      {/* Pagination */}
      {filteredProducts.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Modals */}
      <AddProductModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddSubmit}
        loading={actionLoading}
      />

      <EditProductModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
        onUpdate={handleEditSubmit}
        loading={actionLoading}
      />

      <DeleteProductModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        product={deletingProduct}
        onConfirm={handleDeleteSubmit}
        loading={actionLoading}
      />
    </div>
  );
};
export default ProductsPage;
