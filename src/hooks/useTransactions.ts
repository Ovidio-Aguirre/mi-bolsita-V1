import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTransactions, type Transaction } from '../services/firestoreService';

export const useTransactions = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = getTransactions(currentUser.uid, (newTransactions) => {
        setTransactions(newTransactions);
        setLoading(false);
      });
      // La limpieza se asegura de llamar a la función devuelta por getTransactions
      return () => unsubscribe();
    }
  }, [currentUser]);

  return { transactions, loading };
};