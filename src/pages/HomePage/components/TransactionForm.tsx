// src/pages/HomePage/components/TransactionForm.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useCategories } from '../../../hooks/useCategories';
import { useProducts } from '../../../hooks/useProducts';
import { type Product, addTransaction, addMultiItemSale } from '../../../services/firestoreService';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

const formStyles = { display: 'flex', flexDirection: 'column', gap: 2, minWidth: '400px' } as const;

interface CartItem { product: Product; quantity: number; }
interface TransactionFormProps {
  transactionType: 'income' | 'expense';
  onClose: () => void;
}

export const TransactionForm = ({ transactionType, onClose }: TransactionFormProps) => {
  const { currentUser } = useAuth();
  const { categories } = useCategories();
  const { products } = useProducts();

  // Estados del formulario
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para ventas
  const [isSale, setIsSale] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const total = cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);

  const availableCategories = categories.filter(c => c.type === transactionType);

  useEffect(() => {
    setCart([]);
    setIsSale(false);
  }, [transactionType]);

  const handleAddItem = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const existingItemIndex = cart.findIndex(item => item.product.id === product.id);
    if (existingItemIndex > -1) {
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += quantity;
      setCart(newCart);
    } else {
      setCart([...cart, { product, quantity }]);
    }
    setSelectedProductId(''); setQuantity(1);
  };

  const handleRemoveItem = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !categoryId) {
      alert("Por favor, selecciona una categoría.");
      return;
    }
    
    setIsLoading(true);

    if (isSale) {
      if (cart.length === 0) {
        alert("Añade al menos un producto a la venta.");
        setIsLoading(false);
        return;
      }
      // CORRECCIÓN: Pasamos los argumentos que faltaban (con valores por defecto)
      await addMultiItemSale(currentUser.uid, cart, categoryId, 'Efectivo', 0);
    } else {
      const transactionData = {
        type: transactionType, amount: parseFloat(amount),
        concept: concept.trim(), categoryId
      };
      await addTransaction(currentUser.uid, transactionData);
    }
    
    setIsLoading(false);
    onClose();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={formStyles}>
      <Typography variant="h5">Registrar nuevo {transactionType === 'income' ? 'Ingreso' : 'Gasto'}</Typography>
      
      {transactionType === 'income' && (
        <FormControlLabel control={<Checkbox checked={isSale} onChange={e => setIsSale(e.target.checked)} />} label="¿Es una venta de inventario?" />
      )}

      {isSale ? (
        <>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} size="small" sx={{ flex: 3 }}>
              <MenuItem value="" disabled>Selecciona un producto</MenuItem>
              {products.map(p => <MenuItem key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</MenuItem>)}
            </Select>
            <TextField type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} size="small" sx={{ flex: 1 }} inputProps={{ min: 1 }} />
            <IconButton color="primary" onClick={handleAddItem}><AddCircleIcon /></IconButton>
          </Box>
          <List dense>
            {cart.map(item => (
              <ListItem key={item.product.id} secondaryAction={<IconButton edge="end" onClick={() => handleRemoveItem(item.product.id)}><DeleteIcon color="error" /></IconButton>}>
                <ListItemText primary={`${item.quantity} x ${item.product.name}`} secondary={`@ $${item.product.salePrice.toFixed(2)}`} />
              </ListItem>
            ))}
          </List>
          <Typography variant="h6" align="right">Total: ${total.toFixed(2)}</Typography>
        </>
      ) : (
        <>
          <TextField label="Monto ($)" type="number" value={amount} onChange={e => setAmount(e.target.value)} required autoFocus />
          <TextField label="Concepto o nota" value={concept} onChange={e => setConcept(e.target.value)} required />
        </>
      )}

      <FormControl fullWidth>
        <InputLabel>Categoría</InputLabel>
        <Select value={categoryId} label="Categoría" onChange={e => setCategoryId(e.target.value)} required>
          {availableCategories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
        </Select>
      </FormControl>

      <Button type="submit" variant="contained" disabled={isLoading} sx={{ mt: 1 }}>
        {isLoading ? 'Guardando...' : 'Guardar'}
      </Button>
    </Box>
  );
}