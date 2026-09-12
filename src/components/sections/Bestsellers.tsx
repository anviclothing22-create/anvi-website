import React from 'react';
import { useLiveProducts } from '../../hooks/useLiveProducts';
import type { Product } from '../../lib/types';
import { ProductCard } from '../product/ProductCard';
import './Bestsellers.css';

export interface BestsellersProps {
  products?: Product[];
  heading?: string;
  viewAllHref?: string;
  onProductClick?: (product: Product) => void;
}

export const Bestsellers: React.FC<BestsellersProps> = ({
  products: propProducts,
  heading = 'BESTSELLERS',
  viewAllHref = '/collections/bestsellers',
  onProductClick,
}) => {
  const liveProducts = useLiveProducts();
  const products = propProducts || liveProducts;
  const displayProducts = products
    .filter((p) => p.isBestseller)
    .slice(0, 4);

  return (
    <section className="anvi-bestsellers" aria-labelledby="bestsellers-heading">
      <div className="anvi-bestsellers-container">
        {/* Centered Section Header matching Find Your Anvi & Reviews */}
        <div className="anvi-bestsellers-header">
          <span className="anvi-bestsellers-eyebrow">Most Coveted</span>
          <h2 id="bestsellers-heading" className="anvi-bestsellers-heading">
            {heading}
          </h2>
        </div>

        {/* 4-Across Desktop / 2-Across Mobile Grid */}
        <div className="anvi-bestsellers-grid">
          {displayProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onCardClick={onProductClick}
            />
          ))}
        </div>

        {/* Centered Action Button */}
        <div className="anvi-bestsellers-footer">
          <a href={viewAllHref} className="anvi-bestsellers-view-all">
            <span>View All Bestsellers</span>
            <span className="anvi-bestsellers-view-all-arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Bestsellers;
