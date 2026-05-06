import React from 'react';
import { useCart } from './context/CartContext';
import './ProductDetails.css';

interface Product {
  id: number;
  category_id?: number;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  is_active?: boolean;
  category?: string;
  image?: string;
}

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack }) => {
  const [quantity, setQuantity] = React.useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    }, quantity);
  };

  return (
    <div className="product-details-container">
      <button className="back-btn" onClick={onBack}>
        &larr; Vissza a termékekhez
      </button>
      <div className="product-details-content">
        <div className="product-details-image">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-details-info">
          <span className="product-category">{product.category || 'Egyéb'}</span>
          <h2 className="product-title">{product.name}</h2>
          {product.sku && <p className="product-sku">Cikkszám: {product.sku}</p>}
          <div className="product-price-large">{product.price.toLocaleString('hu-HU')} Ft</div>
          <p className="product-description">
            {product.description || 'Nincs elérhető leírás a termékhez. Kérjük, érdeklődjön ügyfélszolgálatunkon további információkért.'}
          </p>
          
          <div className="product-actions" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '2rem' }}>
            <div className="quantity-selector">
              <button 
                className="qty-btn"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <div className="qty-value">
                {quantity} <span className="qty-unit">db</span>
              </div>
              <button 
                className="qty-btn"
                onClick={() => setQuantity(prev => prev + 1)}
              >
                +
              </button>
            </div>
            <button className="add-to-cart-large-btn" onClick={handleAddToCart} style={{ flex: 1 }}>
              Kosárba teszem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
