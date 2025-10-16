import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCategories, type Category } from '../services/firestoreService';

export const useCategories = () => {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = getCategories(currentUser.uid, (newCategories) => {
        setCategories(newCategories);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  return { categories, loading };
};