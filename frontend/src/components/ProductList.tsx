import React from 'react';
import '../Home.css';

interface Product {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  sku: string;
  price: number;
  is_active: boolean;
  category?: string;
  image?: string;
}

interface ProductListProps {
  products: Product[];
  isActiveCategory: boolean;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, isActiveCategory, onProductClick, onAddToCart }) => {
  return (
    <div className={`products-grid ${!isActiveCategory ? 'popular-grid' : ''}`}>
      {products.map(product => (
        <div key={product.id} className="product-card" onClick={() => onProductClick(product)} style={{ cursor: 'pointer' }}>
          <div className="product-image-container">
            <img src={product.image} alt={product.name} />
          </div>
          <div className="product-details">
            <h3 className="product-name">{product.name}</h3>
            <div className="product-price">{product.price.toLocaleString('hu-HU')} Ft</div>
            <button className="add-to-cart-btn" onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}>Kosárba</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
