// src/components/common/Layout.tsx
import { useState, type ReactNode } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { signOutUser } from '../../services/authService';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import ReceiptIcon from '@mui/icons-material/Receipt';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import InventoryIcon from '@mui/icons-material/Inventory';
import SettingsIcon from '@mui/icons-material/Settings';

interface LayoutProps { children: ReactNode; }

const navItems = [
  { text: 'Facturación', icon: <ReceiptIcon />, path: '/invoicing' },
  { text: 'Recordatorios', icon: <NotificationsIcon />, path: '/reminders' },
  { text: 'Reportes', icon: <AssessmentIcon />, path: '/reports' },
  { text: 'Deudas', icon: <RequestQuoteIcon />, path: '/debts' },
  { text: 'Inventario', icon: <InventoryIcon />, path: '/inventory' },
  { text: 'Configuración', icon: <SettingsIcon />, path: '/settings' },
];

export const Layout = ({ children }: LayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => { setMobileOpen((prevState) => !prevState); };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>Mi Bolsita</Typography>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={RouterLink} to={item.path} selected={location.pathname === item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar component="nav">
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component={RouterLink} to="/home" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
            Mi Bolsita
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navItems.map((item) => (
              <Button key={item.text} component={RouterLink} to={item.path} startIcon={item.icon} sx={{ color: '#fff' }}>
                {item.text}
              </Button>
            ))}
            <Button color="inherit" onClick={signOutUser}>Salir</Button>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 } }}>
        {drawer}
      </Drawer>

      <Container component="main" sx={{ p: { xs: 1, sm: 3 }, width: '100%' }}> {/* Padding ajustado para móvil */}
        <Toolbar /> 
        {children}
      </Container>
    </Box>
  );
};