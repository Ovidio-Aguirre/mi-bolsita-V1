// src/pages/InvoicingPage/InvoicingPage.tsx
import { useState } from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { ReceiptBuilder } from './components/ReceiptBuilder';
import { Modal } from '../../components/common/Modal';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';

export const InvoicingPage = () => {
    const { profile, loading: profileLoading } = useUserProfile();
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);

    const handleOpenBuilder = () => {
        if (!profile || !profile.businessName) {
            alert("Para generar un comprobante, primero completa el Perfil del Negocio en la sección de Configuración.");
            return;
        }
        setIsBuilderOpen(true);
    };

    return (
        <>
            <Box>
                <Typography variant="h4" component="h1" gutterBottom>Facturación</Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                    <Button variant="contained" color="primary" onClick={handleOpenBuilder}>
                        Crear Comprobante de Pago
                    </Button>
                    <Button variant="outlined" disabled>Factura Consumidor Final</Button>
                    <Button variant="outlined" disabled>Crédito Fiscal</Button>
                </Box>

                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">Información</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Usa el botón "Crear Comprobante de Pago" para construir un nuevo recibo de venta con múltiples productos y registrar la transacción.
                    </Typography>
                    
                    {profileLoading ? <CircularProgress sx={{ mt: 2 }} /> : (
                        !profile?.businessName && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                Aún no has configurado los datos de tu negocio. 
                                <Link component={RouterLink} to="/settings"> Ve a Configuración para rellenar tu perfil</Link>.
                            </Alert>
                        )
                    )}
                </Paper>
            </Box>

            {profile && (
                <Modal isOpen={isBuilderOpen} onClose={() => setIsBuilderOpen(false)}>
                    <ReceiptBuilder profile={profile} onClose={() => setIsBuilderOpen(false)} />
                </Modal>
            )}
        </>
    );
};