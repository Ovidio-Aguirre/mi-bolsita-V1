// src/pages/InventoryPage/InventoryPage.tsx
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../hooks/useProducts';
import { addProduct, addMultipleProducts, type Product } from '../../services/firestoreService';
import { readInventoryExcel } from '../../services/excelReader';
import { Modal } from '../../components/common/Modal';
import { EditProductForm } from './components/EditProductForm';
import { BarcodeScanner } from './components/BarcodeScanner';
import styles from './InventoryPage.module.css';
import { IconButton, Button, Box } from '@mui/material'; // Importar Box y Button
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import UploadFileIcon from '@mui/icons-material/UploadFile';

export const InventoryPage = () => {
  const { currentUser } = useAuth();
  const { products, loading } = useProducts();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para el formulario de añadir
  const [name, setName] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('');
  const [barcode, setBarcode] = useState('');

  // Estados para el modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleOpenEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setSelectedProduct(null);
    setIsEditModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !name) return;
    const productData: Omit<Product, 'id'|'uid'|'createdAt'> = {
      name: name.trim(),
      costPrice: parseFloat(costPrice) || 0,
      salePrice: parseFloat(salePrice) || 0,
      stock: parseInt(stock, 10) || 0,
      barcode: barcode.trim(),
    };
    await addProduct(currentUser.uid, productData);
    // Limpiar formulario
    setName(''); setCostPrice(''); setSalePrice(''); setStock(''); setBarcode('');
  };

  // --- LÓGICA PARA IMPORTAR ---
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    const promise = new Promise(async (resolve, reject) => {
        try {
            const productsFromFile = await readInventoryExcel(file);
            if (productsFromFile.length === 0) {
                throw new Error("El archivo Excel está vacío o no tiene el formato correcto (Columnas: Nombre, Costo, Venta, Stock, CodigoBarras).");
            }
            await addMultipleProducts(currentUser.uid, productsFromFile);
            resolve(`¡${productsFromFile.length} productos importados con éxito!`);
        } catch (error: any) {
            console.error("Error al importar:", error);
            reject(error.message || "Error al procesar el archivo Excel.");
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    });

    toast.promise(promise, {
        loading: 'Importando productos...',
        success: (message) => `${message}`,
        error: (err) => `Error: ${err}`,
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  // --- FIN DE NUEVA LÓGICA ---

  return (
    <>
      <div className={styles.container}>
        <Link to="/home">← Volver a la página principal</Link>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <h1>Gestión de Inventario</h1>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={triggerFileInput}
          >
            Importar Excel
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            style={{ display: 'none' }}
          />
        </Box>
        
        <div className={styles.formContainer}>
          <h2>Añadir Nuevo Producto</h2>
          <form onSubmit={handleSubmit} className={styles.formGrid}>
            <div style={{ position: 'relative' }}>
              <input type="text" value={barcode} onChange={e => setBarcode(e.target.value)} placeholder="Código de Barras" style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }} />
              <IconButton onClick={() => setIsScannerOpen(true)} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}>
                <QrCodeScannerIcon />
              </IconButton>
            </div>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del producto" required />
            <input type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} placeholder="Precio Costo ($)" step="0.01" />
            <input type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} placeholder="Precio Venta ($)" step="0.01" />
            <input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="Stock inicial" step="1" />
            <button type="submit">Añadir Producto</button>
          </form>
        </div>

        <div className={styles.tableContainer}>
          <h2>Lista de Productos</h2>
          {loading ? <p>Cargando productos...</p> : (
            <table className={styles.productTable}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Costo</th>
                  <th>Venta</th>
                  <th>Stock</th>
                  <th>Código Barras</th> {/* Columna añadida */}
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} onClick={() => handleOpenEditModal(product)} style={{ cursor: 'pointer' }}>
                    <td>{product.name}</td>
                    <td>${product.costPrice.toFixed(2)}</td>
                    <td>${product.salePrice.toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td>{product.barcode || '-'}</td> {/* Mostrar código de barras */}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedProduct && (
        <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal}>
          <EditProductForm product={selectedProduct} onClose={handleCloseEditModal} />
        </Modal>
      )}
      
      <Modal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)}>
        <BarcodeScanner 
          onScanSuccess={(text) => {
            setBarcode(text);
            setIsScannerOpen(false);
          }}
          onClose={() => setIsScannerOpen(false)}
        />
      </Modal>
    </>
  );
};