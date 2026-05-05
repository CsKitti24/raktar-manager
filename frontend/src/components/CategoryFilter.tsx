import React from 'react';
import '../Home.css';

interface Category {
  id: number;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string | null;
  onCategoryClick: (categoryName: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, activeCategory, onCategoryClick }) => {
  return (
    <div className="categories-nav">
      <span
        className={`category-link ${activeCategory === null ? 'active' : ''}`}
        onClick={() => onCategoryClick(null)}
      >
        Összes
      </span>
      <span className="category-separator">|</span>
      {categories.map((cat, index) => (
        <React.Fragment key={cat.id}>
          <span
            className={`category-link ${activeCategory === cat.name ? 'active' : ''}`}
            onClick={() => onCategoryClick(cat.name)}
          >
            {cat.name}
          </span>
          {index < categories.length - 1 && <span className="category-separator">|</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CategoryFilter;
