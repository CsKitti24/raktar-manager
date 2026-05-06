import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductDetails from '../ProductDetails';
import CategoryFilter from '../components/CategoryFilter';
import ProductList from '../components/ProductList';
import '../Home.css';

interface Category {
  id: number;
  name: string;
}

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
  image_url?: string;
}

const HomePage: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthError('A termékek és kategóriák megtekintéséhez jelentkezzen be!');
        setCategories([]);
        setAllProducts([]);
        return;
      }

      setAuthError(null);
      const headers = { 'Authorization': `Bearer ${token}` };

      try {
        const catRes = await fetch('/api/product/categories', { headers });
        if (!catRes.ok) throw new Error('Nem sikerült betölteni a kategóriákat');
        const catData: Category[] = await catRes.json();
        setCategories(catData);

        const prodRes = await fetch('/api/product/products', { headers });
        if (!prodRes.ok) throw new Error('Nem sikerült betölteni a termékeket');
        const prodData: Product[] = await prodRes.json();

        const mappedProducts = prodData.map(p => {
          const cat = catData.find(c => c.id === p.category_id);
          return {
            ...p,
            category: cat ? cat.name : 'Egyéb',
            image: p.image_url || '/images/default.jpg'
          };
        });
        setAllProducts(mappedProducts);

      } catch (err) {
        console.error(err);
        setAuthError('Hiba történt az adatok betöltésekor. Lehet, hogy nincs megfelelő jogosultsága (pl. token lejárt).');
      }
    };

    fetchApiData();
  }, [isLoggedIn]);

  const popularProducts: Product[] = [];
  const usedCategories = new Set<string>();
  for (const product of allProducts) {
    if (product.category && !usedCategories.has(product.category)) {
      popularProducts.push(product);
      usedCategories.add(product.category);
    }
    if (popularProducts.length === 4) break;
  }

  const displayedProducts = activeCategory
    ? allProducts.filter(p => p.category === activeCategory)
    : allProducts;

  if (selectedProduct) {
    return <ProductDetails product={selectedProduct} onBack={() => setSelectedProduct(null)} />;
  }

  const handleAddToCart = (product: Product) => {
    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    });
    // Opcionálisan: Toast értesítés megjelenítése
  };

  return (
    <>
      {isLoggedIn && (
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryClick={setActiveCategory}
        />
      )}
      <div className="container">
        <section className="category-section">
          <div className="category-header">
            <h2>{activeCategory ? activeCategory : 'Összes termék'}</h2>
          </div>

          {authError ? (
            <div className="auth-error-message" style={{ textAlign: 'center', padding: '40px', color: '#ff6b6b' }}>
              <h3>{authError}</h3>
              <p>Jelentkezz be a termékek böngészéséhez.</p>
            </div>
          ) : (
            <ProductList
              products={displayedProducts}
              isActiveCategory={!!activeCategory}
              onProductClick={setSelectedProduct}
              onAddToCart={handleAddToCart}
            />
          )}
        </section>
      </div>
    </>
  );
};

export default HomePage;
