// src/pages/LoginPage/LoginPage.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { signInWithGoogle } from '../../services/authService';

// Importaciones de MUI
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import GoogleIcon from '@mui/icons-material/Google';
import CircularProgress from '@mui/material/CircularProgress';

export const LoginPage = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && currentUser) {
      navigate('/home');
    }
  }, [currentUser, loading, navigate]);

  const handleGoogleLogin = async () => {
    const user = await signInWithGoogle();
    if (!user) {
      alert("Hubo un problema al iniciar sesión. Intenta de nuevo.");
    }
  };

  // Mientras se verifica si hay sesión, mostramos un loader
  if (loading) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
        </Box>
    );
  }

  // Si no hay usuario, mostramos la pantalla de login
  return (
    <Box 
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#f5f5f5',
            textAlign: 'center',
            padding: 3,
        }}
    >
      <Typography variant="h3" component="h1" gutterBottom>
        Bienvenido a Mi Bolsita
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        La forma más fácil de controlar tu negocio.
      </Typography>
      <Button 
        variant="contained" 
        size="large"
        startIcon={<GoogleIcon />}
        onClick={handleGoogleLogin}
        sx={{ 
            padding: '10px 24px', 
            fontSize: '1rem',
            backgroundColor: '#4285F4',
            '&:hover': {
                backgroundColor: '#357ae8',
            }
        }}
      >
        Ingresar con Google
      </Button>
    </Box>
  );
};