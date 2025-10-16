// src/pages/InvoicingPage/components/ReceiptBuilder.tsx
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useProducts } from '../../../hooks/useProducts';
import { type Product, type UserProfile, addMultiItemSale, updateUserProfile } from '../../../services/firestoreService';
import { generateReceiptPDF } from '../../../services/receiptGenerator';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import InputAdornment from '@mui/material/InputAdornment';

interface ReceiptBuilderProps { profile: UserProfile; onClose: () => void; }
interface CartItem { product: Product; quantity: number; }

export const ReceiptBuilder = ({ profile, onClose }: ReceiptBuilderProps) => {
  const { currentUser } = useAuth();
  const { products } = useProducts();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountValue, setDiscountValue] = useState(0);
  const [cashTendered, setCashTendered] = useState<number | '' >('');

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
  const handleRemoveItem = (productId: string) => { setCart(cart.filter(item => item.product.id !== productId)); };

  const subtotal = cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
  const calculatedDiscount = discountType === 'fixed' ? discountValue : (subtotal * discountValue) / 100;
  const finalTotal = subtotal - calculatedDiscount;
  const change = (typeof cashTendered === 'number' && cashTendered > finalTotal) ? cashTendered - finalTotal : 0;

  const handleGenerate = async () => {
    if (!currentUser || cart.length === 0) return;
    if (paymentMethod === 'Efectivo' && (typeof cashTendered !== 'number' || cashTendered < finalTotal)) {
        alert("El monto recibido debe ser un número mayor o igual al total a pagar.");
        return;
    }

    setIsLoading(true);
    const currentReceiptNumber = profile.receiptCounter || 0;
    const newReceiptNumber = currentReceiptNumber + 1;
    await addMultiItemSale(currentUser.uid, cart, '', paymentMethod, calculatedDiscount);
    await updateUserProfile(currentUser.uid, { receiptCounter: newReceiptNumber });
    generateReceiptPDF(cart, profile, newReceiptNumber, paymentMethod, calculatedDiscount, typeof cashTendered === 'number' ? cashTendered : undefined);
    setIsLoading(false);
    onClose();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Crear Comprobante de Venta</Typography>
      
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
        <Select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} size="small" sx={{ flex: 3 }}>
          <MenuItem value="" disabled>Selecciona un producto</MenuItem>
          {products.map(p => <MenuItem key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</MenuItem>)}
        </Select>
        <TextField type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} size="small" sx={{ flex: 1 }} inputProps={{ min: 1 }} />
        <IconButton color="primary" onClick={handleAddItem}><AddCircleIcon /></IconButton>
      </Box>
      <List>
        {cart.map(item => (
          <ListItem key={item.product.id} divider secondaryAction={<IconButton edge="end" onClick={() => handleRemoveItem(item.product.id)}><DeleteIcon color="error" /></IconButton>}>
            <ListItemText primary={`${item.quantity} x ${item.product.name}`} secondary={`@ $${item.product.salePrice.toFixed(2)} c/u`} />
            <Typography fontWeight="bold">${(item.quantity * item.product.salePrice).toFixed(2)}</Typography>
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>Opciones de Pago</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField label="Descuento" type="number" value={discountValue} onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)} size="small" InputProps={{ startAdornment: <InputAdornment position="start">{discountType === 'fixed' ? '$' : '%'}</InputAdornment>,}}/>
          <ToggleButtonGroup value={discountType} exclusive onChange={(_e, newType) => { if (newType) setDiscountType(newType as 'fixed' | 'percentage') }} size="small">
            <ToggleButton value="fixed">$</ToggleButton>
            <ToggleButton value="percentage">%</ToggleButton>
          </ToggleButtonGroup>
          <Select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} size="small" sx={{ minWidth: 120 }}>
            <MenuItem value="Efectivo">Efectivo</MenuItem>
            <MenuItem value="Tarjeta">Tarjeta</MenuItem>
            <MenuItem value="Transferencia">Transferencia</MenuItem>
            <MenuItem value="Otro">Otro</MenuItem>
          </Select>
          {paymentMethod === 'Efectivo' && (
            <TextField
              label="Efectivo Recibido"
              type="number"
              value={cashTendered}
              onChange={e => setCashTendered(e.target.value === '' ? '' : parseFloat(e.target.value))}
              size="small"
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />
          )}
        </Box>
      </Box>

      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Typography>Subtotal: ${subtotal.toFixed(2)}</Typography>
        <Typography color="error">Descuento: -${calculatedDiscount.toFixed(2)}</Typography>
        <Typography variant="h5">Total: ${finalTotal.toFixed(2)}</Typography>
        {paymentMethod === 'Efectivo' && typeof cashTendered === 'number' && cashTendered > finalTotal && (
          <Typography variant="h6" color="primary">Cambio: ${change.toFixed(2)}</Typography>
        )}
        <Button variant="contained" onClick={handleGenerate} disabled={isLoading || cart.length === 0} sx={{ mt: 2 }}>
          {isLoading ? 'Generando...' : 'Generar Comprobante y Registrar'}
        </Button>
      </Box>
    </Box>
  );
};