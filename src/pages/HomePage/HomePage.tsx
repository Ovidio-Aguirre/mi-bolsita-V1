// src/pages/HomePage/HomePage.tsx
import { useState } from "react";
import { useTransactions } from "../../hooks/useTransactions";
import { type Transaction } from "../../services/firestoreService";
import { AddTransactionButtons } from "./components/AddTransactionButtons";
import { BalanceSummary } from "./components/BalanceSummary";
import { TransactionList } from "./components/TransactionList";
import { Modal } from "../../components/common/Modal";
import { TransactionForm } from "./components/TransactionForm";
import { EditTransactionForm } from "./components/EditTransactionForm";
import { DashboardCharts } from "./components/DashboardCharts";
import { DailyClosingModal } from "./components/DailyClosingModal"; // <-- 1. Importar
import { Typography, Button } from "@mui/material";

export const HomePage = () => {
  const { transactions, loading } = useTransactions();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false); // <-- 2. Nuevo estado

  const handleOpenAddModal = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setIsAddModalOpen(true);
  };
  
  const handleOpenEditModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  // --- 3. Nueva lógica para filtrar transacciones del día ---
  const getTodaysTransactions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Inicio del día
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Inicio del día siguiente

    return transactions.filter(t => {
      const transactionDate = t.createdAt.toDate();
      return transactionDate >= today && transactionDate < tomorrow;
    });
  };

  return (
    <>
      <BalanceSummary />
      <DashboardCharts />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', marginBottom: '16px' }}>
        <Typography variant="h5" component="h2">
          Movimientos Recientes
        </Typography>
        {/* <-- 4. Nuevo Botón de Cierre de Caja --> */}
        <Button variant="contained" onClick={() => setIsClosingModalOpen(true)}>
          Cerrar Día
        </Button>
      </div>

      <TransactionList 
        transactions={transactions} 
        loading={loading}
        onEdit={handleOpenEditModal}
      />
      <AddTransactionButtons 
        onIncomeClick={() => handleOpenAddModal('income')}
        onExpenseClick={() => handleOpenAddModal('expense')}
      />
      
      {/* Modal para añadir */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <TransactionForm 
            transactionType={transactionType}
            onClose={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Modal para editar */}
      {selectedTransaction && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <EditTransactionForm 
            transaction={selectedTransaction}
            onClose={() => setIsEditModalOpen(false)}
          />
        </Modal>
      )}

      {/* <-- 5. Nuevo Modal para Cierre de Caja --> */}
      <Modal isOpen={isClosingModalOpen} onClose={() => setIsClosingModalOpen(false)}>
        <DailyClosingModal 
            transactions={getTodaysTransactions()}
            onClose={() => setIsClosingModalOpen(false)}
        />
      </Modal>
    </>
  );
};