// src/hooks/useUserProfile.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, type UserProfile } from '../services/firestoreService';

export const useUserProfile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = getUserProfile(currentUser.uid, (userProfile) => {
        setProfile(userProfile);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  return { profile, loading };
};