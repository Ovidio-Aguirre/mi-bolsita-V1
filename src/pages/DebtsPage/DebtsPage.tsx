// src/pages/DebtsPage/DebtsPage.tsx
import { useState } from 'react';
import { useDebts } from '../../hooks/useDebts';
import { Modal } from '../../components/common/Modal';
import { AddDebtForm } from './components/AddDebtForm';
import { DebtDetailModal } from './components/DebtDetailModal';
import { type Debt } from '../../services/firestoreService';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';

export const DebtsPage = () => {
  const { debts, loading } = useDebts();
  const [tabIndex, setTabIndex] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  const handleOpenDetailModal = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsDetailModalOpen(true);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => { setTabIndex(newValue); };
  const receivables = debts.filter(d => d.type === 'receivable');
  const payables = debts.filter(d => d.type === 'payable');

  const renderDebtList = (debtList: Debt[]) => {
    if (debtList.length === 0) return <Typography sx={{ textAlign: 'center', mt: 4 }}>No hay deudas.</Typography>;
    return (
      <List>
        {debtList.map(debt => {
          const secondaryText = debt.dueDate 
            ? `${debt.concept} - Vence: ${debt.dueDate.toDate().toLocaleDateString('es-SV')}`
            : debt.concept;

          return (
            <ListItemButton key={debt.id} onClick={() => handleOpenDetailModal(debt)}>
              <ListItemText
                primary={debt.personName}
                secondary={secondaryText}
              />
              <Typography variant="h6">${debt.currentBalance.toFixed(2)}</Typography>
            </ListItemButton>
          );
        })}
      </List>
    );
  };

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h4" component="h1" gutterBottom>Gestión de Deudas</Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={handleTabChange}>
            <Tab label={`Me Deben (${receivables.length})`} />
            <Tab label={`Yo Debo (${payables.length})`} />
          </Tabs>
        </Box>

        {loading ? <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} /> : (
          <>
            {tabIndex === 0 && renderDebtList(receivables)}
            {tabIndex === 1 && renderDebtList(payables)}
          </>
        )}

        <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => setIsAddModalOpen(true)}>
          <AddIcon />
        </Fab>
      </Box>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <AddDebtForm onClose={() => setIsAddModalOpen(false)} />
      </Modal>

      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}>
        <DebtDetailModal debt={selectedDebt} onClose={() => setIsDetailModalOpen(false)} />
      </Modal>
    </>
  );
};