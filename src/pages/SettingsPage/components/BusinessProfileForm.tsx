// src/pages/SettingsPage/components/BusinessProfileForm.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { updateUserProfile } from '../../../services/firestoreService';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';

export const BusinessProfileForm = () => {
  const { currentUser } = useAuth();
  const { profile, loading } = useUserProfile();

  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setBusinessName(profile.businessName || '');
      setBusinessAddress(profile.businessAddress || '');
      setBusinessPhone(profile.businessPhone || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSaving(true);
    const profileData = {
      businessName: businessName.trim(),
      businessAddress: businessAddress.trim(),
      businessPhone: businessPhone.trim(),
    };
    await updateUserProfile(currentUser.uid, profileData);
    setIsSaving(false);
    alert("Perfil del negocio guardado.");
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h5" gutterBottom>Perfil del Negocio</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Esta información aparecerá en tus comprobantes de pago.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Nombre del Comercio" value={businessName} onChange={e => setBusinessName(e.target.value)} />
        <TextField label="Ubicación / Dirección" value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} />
        <TextField label="Teléfono de Contacto" value={businessPhone} onChange={e => setBusinessPhone(e.target.value)} />
        <Button type="submit" variant="contained" disabled={isSaving} sx={{ alignSelf: 'flex-start' }}>
          {isSaving ? 'Guardando...' : 'Guardar Perfil'}
        </Button>
      </Box>
    </Paper>
  );
};