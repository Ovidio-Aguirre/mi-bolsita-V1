// src/components/common/Layout.tsx
import { type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { signOutUser } from '../../services/authService';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import SettingsIcon from '@mui/icons-material/Settings';
import InventoryIcon from '@mui/icons-material/Inventory';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ReceiptIcon from '@mui/icons-material/Receipt'; // <-- 1. Importar ícono

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const handleLogout = async () => { await signOutUser(); };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar component="nav">
        <Toolbar>
          <Typography variant="h6" component={RouterLink} to="/home" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
            Mi Bolsita
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {/* 2. Añadir nuevo enlace */}
            <Link component={RouterLink} to="/invoicing" sx={{ color: '#fff', marginRight: 2 }}>
              <Button startIcon={<ReceiptIcon />} sx={{ color: 'inherit' }}>Facturación</Button>
            </Link>
            <Link component={RouterLink} to="/reminders" sx={{ color: '#fff', marginRight: 2 }}>
              <Button startIcon={<NotificationsIcon />} sx={{ color: 'inherit' }}>Recordatorios</Button>
            </Link>
            <Link component={RouterLink} to="/reports" sx={{ color: '#fff', marginRight: 2 }}>
              <Button startIcon={<AssessmentIcon />} sx={{ color: 'inherit' }}>Reportes</Button>
            </Link>
            <Link component={RouterLink} to="/debts" sx={{ color: '#fff', marginRight: 2 }}>
              <Button startIcon={<RequestQuoteIcon />} sx={{ color: 'inherit' }}>Deudas</Button>
            </Link>
            <Link component={RouterLink} to="/inventory" sx={{ color: '#fff', marginRight: 2 }}>
              <Button startIcon={<InventoryIcon />} sx={{ color: 'inherit' }}>Inventario</Button>
            </Link>
            <Link component={RouterLink} to="/settings" sx={{ color: '#fff', marginRight: 2 }}>
              <Button startIcon={<SettingsIcon />} sx={{ color: 'inherit' }}>Configuración</Button>
            </Link>
            <Button color="inherit" onClick={handleLogout}>Salir</Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ p: 3, width: '100%' }}>
        <Toolbar /> 
        {children}
      </Container>
    </Box>
  );
};