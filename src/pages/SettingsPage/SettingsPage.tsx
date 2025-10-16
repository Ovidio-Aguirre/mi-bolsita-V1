// src/pages/SettingsPage/SettingsPage.tsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCategories } from '../../hooks/useCategories';
import { addCategory, type Category } from '../../services/firestoreService';
import { Modal } from '../../components/common/Modal';
import { EditCategoryForm } from './components/EditCategoryForm';
import { BusinessProfileForm } from './components/BusinessProfileForm';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';

export const SettingsPage = () => {
  const { currentUser } = useAuth();
  const { categories, loading } = useCategories();
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleOpenModal = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => { setIsModalOpen(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() === '' || !currentUser) return;
    await addCategory(currentUser.uid, newName.trim(), newType);
    setNewName('');
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ maxWidth: '900px', margin: 'auto' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Configuración
        </Typography>

        <BusinessProfileForm />

        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" gutterBottom>Gestión de Categorías</Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField 
              label="Nombre de la nueva categoría" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ flexGrow: 1 }}
            />
            <FormControl>
              <RadioGroup row value={newType} onChange={(e) => setNewType(e.target.value as typeof newType)}>
                <FormControlLabel value="income" control={<Radio size="small" />} label="Ingreso" />
                <FormControlLabel value="expense" control={<Radio size="small" />} label="Gasto" />
              </RadioGroup>
            </FormControl>
            <Button type="submit" variant="contained">Añadir</Button>
          </Box>
          
          <Grid container spacing={4}>
            <Grid xs={12} md={6}>
              <Typography variant="h6">Categorías de Ingreso</Typography>
              <List>
                {incomeCategories.map(cat => (
                  <ListItemButton key={cat.id} onClick={() => handleOpenModal(cat)}>{cat.name}</ListItemButton>
                ))}
              </List>
            </Grid>
            <Grid xs={12} md={6}>
              <Typography variant="h6">Categorías de Gasto</Typography>
              <List>
                {expenseCategories.map(cat => (
                  <ListItemButton key={cat.id} onClick={() => handleOpenModal(cat)}>{cat.name}</ListItemButton>
                ))}
              </List>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {selectedCategory && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          <EditCategoryForm category={selectedCategory} onClose={handleCloseModal} />
        </Modal>
      )}
    </>
  );
};