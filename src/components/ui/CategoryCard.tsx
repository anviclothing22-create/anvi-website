import React from 'react';
import type { Category } from '../../data/categories';
import './CategoryCard.css';

export interface CategoryCardProps {
  category: Category;
  featured?: boolean;
  onCategoryClick?: (category: Category) => void;
}

/**
 * ANVI Category Card
 * Editorial catalogue navigation card.
 * Photography carries the primary visual weight, with clean typography and an Explore action.
 */
export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  featured = false,
  onCategoryClick,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onCategoryClick) {
      e.preventDefault();
      onCategoryClick(category);
    }
  };

  return (
    <a
      href={`/shop/${category.slug}`}
      className={`anvi-category-card ${
        featured ? 'anvi-category-card--featured' : 'anvi-category-card--standard'
      }`}
      onClick={handleClick}
      aria-label={`Explore ${category.name} collection`}
    >
      <div className="anvi-category-media">
        <img
          src={category.image}
          alt={category.name}
          className="anvi-category-img"
          loading="lazy"
          decoding="async"
        />
        <div className="anvi-category-overlay" />
      </div>

      <div className="anvi-category-content">
        <div className="anvi-category-title-row">
          <h3 className="anvi-category-name">{category.name}</h3>
          <span className="anvi-category-arrow" aria-hidden="true">
            →
          </span>
        </div>
      </div>
    </a>
  );
};

export default CategoryCard;
