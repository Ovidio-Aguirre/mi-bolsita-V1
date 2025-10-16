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
import { Typography } from "@mui/material";

export const HomePage = () => {
  const { transactions, loading } = useTransactions();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  
  // Estados para el modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleOpenAddModal = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setIsAddModalOpen(true);
  };
  
  const handleOpenEditModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <BalanceSummary />
      <DashboardCharts />
      <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
        Movimientos Recientes
      </Typography>
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
    </>
  );
};