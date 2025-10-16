// src/pages/InventoryPage/components/EditProductForm.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { type Product, updateProduct, deleteProduct } from '../../../services/firestoreService';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';

interface EditProductFormProps {
  product: Product;
  onClose: () => void;
}

export const EditProductForm = ({ product, onClose }: EditProductFormProps) => {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setName(product.name);
    setCostPrice(product.costPrice.toString());
    setSalePrice(product.salePrice.toString());
    setStock(product.stock.toString());
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);
    const updatedData = {
      name: name.trim(),
      costPrice: parseFloat(costPrice) || 0,
      salePrice: parseFloat(salePrice) || 0,
      stock: parseInt(stock, 10) || 0,
    };

    const result = await updateProduct(currentUser.uid, product.id, updatedData);
    setIsLoading(false);

    if (result.success) {
      onClose();
    } else {
      alert("Hubo un error al actualizar el producto.");
    }
  };

  const handleDelete = async () => {
    if (!currentUser) return;
    const isConfirmed = window.confirm(`¿Estás seguro de que quieres eliminar el producto "${product.name}"?`);
    if (isConfirmed) {
      setIsLoading(true);
      await deleteProduct(currentUser.uid, product.id);
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Editar Producto</Typography>
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
          disabled={isLoading}
        >
          Eliminar
        </Button>
      </Box>

      <TextField label="Nombre del producto" value={name} onChange={e => setName(e.target.value)} required />
      <TextField label="Precio Costo ($)" type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} />
      <TextField label="Precio Venta ($)" type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} />
      <TextField label="Stock actual" type="number" value={stock} onChange={e => setStock(e.target.value)} />
      <Button type="submit" variant="contained" disabled={isLoading}>
        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </Box>
  );
};