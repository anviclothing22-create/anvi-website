import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { ShoppingBag } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';
import { useLiveProducts } from '../../hooks/useLiveProducts';
import { ProductCard } from '../../components/product/ProductCard';
import type { Product } from '../../lib/types';
import './WishlistPage.css';

export const WishlistPage: React.FC = () => {
  const productsData = useLiveProducts();
  const { wishlistIds, removeFromWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  // Match saved IDs against products dataset
  const savedProducts = useMemo(() => {
    return productsData.filter((p) => wishlistIds.includes(p.id));
  }, [productsData, wishlistIds]);

  const handleAddToBag = (product: Product) => {
    addItem({
      id: `${product.id}-${product.variants?.[0] || 'Free Size'}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      size: product.variants?.[0] || 'Free Size',
      image: product.images?.[0] || '/images/products/saree_ajrakh_1.jpg',
      slug: product.slug,
      openDrawer: true,
    });
  };

  const handleAddSampleWishlist = () => {
    if (productsData[0]) {
      toggleWishlist(productsData[0].id);
    }
  };

  return (
    <div className="anvi-wishlist-page">
      <div className="anvi-wishlist-container">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="anvi-wishlist-breadcrumb">
          <Link href="/">Home</Link>
          <span className="anvi-wishlist-breadcrumb-sep">/</span>
          <span className="anvi-wishlist-breadcrumb-current">Wishlist</span>
        </nav>

        {/* Empty State */}
        {savedProducts.length === 0 ? (
          <div className="anvi-wishlist-empty">
            <h1 className="anvi-wishlist-empty-title">Nothing saved yet.</h1>
            <p className="anvi-wishlist-empty-text">
              Curate your personal collection of timeless handloom sarees, contemporary
              salwars, and elevated separates crafted for moments worth remembering.
            </p>
            <Link href="/shop" className="anvi-wishlist-empty-btn">
              Explore Collections
            </Link>

            <div>
              <button
                type="button"
                className="anvi-wishlist-demo-btn"
                onClick={handleAddSampleWishlist}
              >
                + Save Sample Saree for Demo
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Page Header */}
            <div className="anvi-wishlist-header">
              <h1 className="anvi-wishlist-title">Wishlist</h1>
              <span className="anvi-wishlist-count">
                {savedProducts.length} {savedProducts.length === 1 ? 'saved piece' : 'saved pieces'}
              </span>
            </div>

            {/* Products Grid (Canonical ProductCard) */}
            <div className="anvi-wishlist-grid" role="list">
              {savedProducts.map((product) => (
                <div key={product.id} role="listitem">
                  <ProductCard
                    product={product}
                    actionSlot={
                      <div className="anvi-wishlist-card-actions">
                        <button
                          type="button"
                          className="anvi-wishlist-add-btn"
                          onClick={() => handleAddToBag(product)}
                        >
                          <ShoppingBag size={13} strokeWidth={1.5} />
                          <span>Add to Bag</span>
                        </button>
                        <button
                          type="button"
                          className="anvi-wishlist-remove-link"
                          onClick={() => removeFromWishlist(product.id)}
                          aria-label={`Remove ${product.name} from wishlist`}
                        >
                          Remove
                        </button>
                      </div>
                    }
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
