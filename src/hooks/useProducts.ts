// src/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProducts, type Product } from '../services/firestoreService';

export const useProducts = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = getProducts(currentUser.uid, (newProducts) => {
        setProducts(newProducts);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  return { products, loading };
};