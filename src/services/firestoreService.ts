// src/services/firestoreService.ts
import {
  collection, addDoc, serverTimestamp, query,
  onSnapshot, orderBy, type Timestamp, runTransaction, doc, deleteDoc, updateDoc, setDoc
} from "firebase/firestore";
import { db } from "./firebaseConfig";

// --- INTERFACES ---
export interface Transaction {
  id: string;
  uid: string;
  type: 'income' | 'expense';
  amount: number;
  concept: string;
  createdAt: Timestamp;
  categoryId?: string;
  productId?: string;
  quantity?: number;
  items?: { productId: string; productName: string; quantity: number; salePrice: number; }[];
  paymentMethod?: string;
  discountAmount?: number;
}

export interface Category {
  id: string;
  uid: string;
  name: string;
  type: 'income' | 'expense';
  createdAt: Timestamp;
}

export interface Product {
  id: string;
  uid: string;
  name: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  createdAt: Timestamp;
  barcode?: string; // Campo para código de barras
}

export interface Debt {
  id: string;
  uid: string;
  type: 'receivable' | 'payable';
  personName: string;
  initialAmount: number;
  currentBalance: number;
  concept: string;
  createdAt: Timestamp;
  dueDate?: Timestamp;
}

export interface Payment {
  id: string;
  amount: number;
  createdAt: Timestamp;
}

export interface UserProfile {
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  receiptCounter?: number;
}

// --- FUNCIONES DE TRANSACCIONES ---
interface SaleDetails {
  productId: string;
  quantity: number;
}
export const addTransaction = async (uid: string, transactionData: Omit<Transaction, 'id' | 'createdAt' | 'uid'>, saleDetails?: SaleDetails) => {
  if (saleDetails && saleDetails.productId) {
    const productRef = doc(db, `users/${uid}/products`, saleDetails.productId);
    const userTransactionsCollection = collection(db, `users/${uid}/transactions`);
    try {
      await runTransaction(db, async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists()) { throw "¡El producto no existe!"; }
        const currentStock = productDoc.data().stock;
        const newStock = currentStock - saleDetails.quantity;
        if (newStock < 0) { throw "¡No hay suficiente stock para esta venta!"; }
        transaction.update(productRef, { stock: newStock });
        const newTransactionRef = doc(userTransactionsCollection);
        transaction.set(newTransactionRef, { ...transactionData, uid, createdAt: serverTimestamp() });
      });
      return { success: true };
    } catch (error) {
      console.error("Error en la transacción de venta: ", error);
      alert(error);
      return { success: false, error };
    }
  } else {
    try {
      const userTransactionsCollection = collection(db, `users/${uid}/transactions`);
      const docRef = await addDoc(userTransactionsCollection, { ...transactionData, uid, createdAt: serverTimestamp() });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error al añadir la transacción: ", error);
      return { success: false, error };
    }
  }
};

export const addMultiItemSale = async (uid: string, items: { product: Product, quantity: number }[], categoryId: string, paymentMethod: string, discountAmount: number) => {
  const userTransactionsCollection = collection(db, `users/${uid}/transactions`);
  const subtotal = items.reduce((sum, item) => sum + (item.product.salePrice * item.quantity), 0);
  const finalTotal = subtotal - discountAmount;
  
  try {
    await runTransaction(db, async (transaction) => {
      for (const item of items) {
        const productRef = doc(db, `users/${uid}/products`, item.product.id);
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists()) { throw `El producto ${item.product.name} ya no existe.`; }
        const newStock = productDoc.data().stock - item.quantity;
        if (newStock < 0) { throw `Stock insuficiente para ${item.product.name}.`; }
        transaction.update(productRef, { stock: newStock });
      }
      const newTransactionRef = doc(userTransactionsCollection);
      transaction.set(newTransactionRef, {
        uid,
        type: 'income',
        amount: finalTotal,
        concept: `Venta de ${items.length} productos diferentes`,
        categoryId,
        createdAt: serverTimestamp(),
        items: items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          salePrice: item.product.salePrice
        })),
        paymentMethod,
        discountAmount,
      });
    });
    return { success: true };
  } catch (error) {
    console.error("Error en la transacción de venta múltiple: ", error);
    alert(error);
    return { success: false, error };
  }
};

export const getTransactions = (uid: string, callback: (transactions: Transaction[]) => void) => {
  const userTransactionsCollection = collection(db, `users/${uid}/transactions`);
  const q = query(userTransactionsCollection, orderBy('createdAt', 'desc'));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const transactions: Transaction[] = [];
    querySnapshot.forEach((doc) => { transactions.push({ id: doc.id, ...doc.data() } as Transaction); });
    callback(transactions);
  });
  return unsubscribe;
};
export const updateTransaction = async (uid: string, transactionId: string, transactionData: Partial<Transaction>) => {
  const transactionRef = doc(db, `users/${uid}/transactions`, transactionId);
  try { await updateDoc(transactionRef, transactionData); return { success: true }; }
  catch (error) { console.error("Error al actualizar la transacción: ", error); return { success: false, error }; }
};
export const deleteTransaction = async (uid: string, transactionId: string) => {
  const transactionRef = doc(db, `users/${uid}/transactions`, transactionId);
  try { await deleteDoc(transactionRef); return { success: true }; }
  catch (error) { console.error("Error al eliminar la transacción: ", error); return { success: false, error }; }
};

// --- FUNCIONES DE CATEGORÍAS ---
export const addCategory = async (uid: string, name: string, type: 'income' | 'expense') => {
  try {
    const userCategoriesCollection = collection(db, `users/${uid}/categories`);
    const docRef = await addDoc(userCategoriesCollection, { uid, name, type, createdAt: serverTimestamp() });
    return { success: true, id: docRef.id };
  } catch (error) { console.error("Error al añadir la categoría: ", error); return { success: false, error }; }
};
export const getCategories = (uid: string, callback: (categories: Category[]) => void) => {
  const userCategoriesCollection = collection(db, `users/${uid}/categories`);
  const q = query(userCategoriesCollection, orderBy('name'));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const categories: Category[] = [];
    querySnapshot.forEach((doc) => { categories.push({ id: doc.id, ...doc.data() } as Category); });
    callback(categories);
  });
  return unsubscribe;
};
export const updateCategory = async (uid: string, categoryId: string, newName: string) => {
  const categoryRef = doc(db, `users/${uid}/categories`, categoryId);
  try { await updateDoc(categoryRef, { name: newName }); return { success: true }; }
  catch (error) { console.error("Error al actualizar la categoría: ", error); return { success: false, error }; }
};
export const deleteCategory = async (uid: string, categoryId: string) => {
  const categoryRef = doc(db, `users/${uid}/categories`, categoryId);
  try { await deleteDoc(categoryRef); return { success: true }; }
  catch (error) { console.error("Error al eliminar la categoría: ", error); return { success: false, error }; }
};

// --- FUNCIONES PARA PRODUCTOS ---
export const addProduct = async (uid: string, productData: Omit<Product, 'id' | 'uid' | 'createdAt'>) => {
  try {
    const userProductsCollection = collection(db, `users/${uid}/products`);
    const docRef = await addDoc(userProductsCollection, { ...productData, uid, createdAt: serverTimestamp() });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error al añadir el producto: ", error); return { success: false, error };
  }
};
export const getProducts = (uid: string, callback: (products: Product[]) => void) => {
  const userProductsCollection = collection(db, `users/${uid}/products`);
  const q = query(userProductsCollection, orderBy('name'));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const products: Product[] = [];
    querySnapshot.forEach((doc) => { products.push({ id: doc.id, ...doc.data() } as Product); });
    callback(products);
  });
  return unsubscribe;
};
export const updateProduct = async (uid: string, productId: string, productData: Partial<Omit<Product, 'id' | 'uid' | 'createdAt'>>) => {
  const productRef = doc(db, `users/${uid}/products`, productId);
  try {
    await updateDoc(productRef, productData);
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar el producto: ", error); return { success: false, error };
  }
};
export const deleteProduct = async (uid: string, productId: string) => {
  const productRef = doc(db, `users/${uid}/products`, productId);
  try { await deleteDoc(productRef); return { success: true }; }
  catch (error) { console.error("Error al eliminar el producto: ", error); return { success: false, error }; }
};

// --- FUNCIONES PARA DEUDAS ---
export const addDebt = async (uid: string, debtData: Omit<Debt, 'id' | 'createdAt' | 'uid' | 'currentBalance' | 'dueDate'> & { dueDate?: Timestamp }) => {
    try {
        const userDebtsCollection = collection(db, `users/${uid}/debts`);
        const docRef = await addDoc(userDebtsCollection, {
            ...debtData,
            uid,
            currentBalance: debtData.initialAmount,
            createdAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error al añadir la deuda: ", error);
        return { success: false, error };
    }
};
export const getDebts = (uid: string, callback: (debts: Debt[]) => void) => {
  const userDebtsCollection = collection(db, `users/${uid}/debts`);
  const q = query(userDebtsCollection, orderBy('createdAt', 'desc'));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const debts: Debt[] = [];
    querySnapshot.forEach((doc) => { debts.push({ id: doc.id, ...doc.data() } as Debt); });
    callback(debts);
  });
  return unsubscribe;
};
export const addPaymentToDebt = async (uid: string, debtId: string, paymentAmount: number) => {
  const debtRef = doc(db, `users/${uid}/debts`, debtId);
  const paymentsCollectionRef = collection(debtRef, 'payments');
  try {
    await runTransaction(db, async (transaction) => {
      const debtDoc = await transaction.get(debtRef);
      if (!debtDoc.exists()) { throw "La deuda no existe."; }
      const currentBalance = debtDoc.data().currentBalance;
      const newBalance = currentBalance - paymentAmount;
      if (newBalance < 0) { throw "El monto del abono no puede ser mayor que el saldo pendiente."; }
      if (paymentAmount <= 0) { throw "El monto del abono debe ser positivo."; }
      transaction.update(debtRef, { currentBalance: newBalance });
      const newPaymentRef = doc(paymentsCollectionRef);
      transaction.set(newPaymentRef, { amount: paymentAmount, createdAt: serverTimestamp() });
    });
    return { success: true };
  } catch (error) {
    console.error("Error al registrar el abono: ", error);
    alert(error);
    return { success: false, error };
  }
};
export const deleteDebt = async (uid: string, debtId: string) => {
  const debtRef = doc(db, `users/${uid}/debts`, debtId);
  try { await deleteDoc(debtRef); return { success: true }; }
  catch (error) { console.error("Error al eliminar la deuda: ", error); return { success: false, error }; }
};

// --- FUNCIONES PARA PERFIL DE USUARIO ---
export const updateUserProfile = async (uid: string, profileData: Partial<UserProfile>) => {
  const profileRef = doc(db, `users/${uid}`);
  try {
    await setDoc(profileRef, profileData, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar el perfil: ", error);
    return { success: false, error };
  }
};
export const getUserProfile = (uid: string, callback: (profile: UserProfile | null) => void) => {
  const profileRef = doc(db, `users/${uid}`);
  const unsubscribe = onSnapshot(profileRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as UserProfile);
    } else {
      callback(null);
    }
  });
  return unsubscribe;
};