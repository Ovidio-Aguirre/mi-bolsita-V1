// src/hooks/useDebts.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDebts, type Debt } from '../services/firestoreService';

export const useDebts = () => {
  const { currentUser } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = getDebts(currentUser.uid, (newDebts) => {
        setDebts(newDebts);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  return { debts, loading };
};