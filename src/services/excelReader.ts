// src/services/excelReader.ts
import * as XLSX from 'xlsx';
import { type Product } from './firestoreService';

// Define la estructura esperada de las columnas en el Excel
interface ExcelRow {
    Nombre?: string;
    Costo?: number;
    Venta?: number;
    Stock?: number;
    CodigoBarras?: string;
}

export const readInventoryExcel = (file: File): Promise<Omit<Product, 'id' | 'uid' | 'createdAt'>[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0]; // Tomar la primera hoja
                const worksheet = workbook.Sheets[sheetName];
                // Convertir la hoja a un array de objetos JSON
                const json: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

                // Mapear los datos del JSON al formato de nuestro Producto
                const products: Omit<Product, 'id' | 'uid' | 'createdAt'>[] = json
                    .filter(row => row.Nombre && typeof row.Nombre === 'string' && row.Nombre.trim() !== '') // Filtrar filas sin nombre
                    .map(row => ({
                        name: row.Nombre!.trim(), // Usamos '!' porque ya filtramos
                        costPrice: typeof row.Costo === 'number' ? row.Costo : 0,
                        salePrice: typeof row.Venta === 'number' ? row.Venta : 0,
                        stock: typeof row.Stock === 'number' ? Math.floor(row.Stock) : 0,
                        barcode: row.CodigoBarras ? String(row.CodigoBarras).trim() : undefined,
                    }));
                
                resolve(products);
            } catch (error) {
                reject("Error al leer el archivo Excel. Asegúrate de que tenga el formato correcto (Columnas: Nombre, Costo, Venta, Stock, CodigoBarras).");
            }
        };

        reader.onerror = (_error) => { // No necesitamos la variable error
            reject("Error al leer el archivo.");
        };

        reader.readAsBinaryString(file);
    });
};