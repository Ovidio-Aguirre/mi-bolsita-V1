// src/components/common/ProtectedRoute.tsx
// CÓDIGO CORREGIDO

import { type ReactNode } from 'react'; // <-- AQUÍ ESTÁ LA CORRECCIÓN
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Si no hay usuario, lo redirigimos a la página de login
    return <Navigate to="/" />;
  }

  // Si hay un usuario, mostramos el contenido de la página
  return children;
};