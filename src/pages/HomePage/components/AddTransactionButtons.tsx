// src/pages/HomePage/components/AddTransactionButtons.tsx
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface AddTransactionButtonsProps {
  onIncomeClick: () => void;
  onExpenseClick: () => void;
}

export const AddTransactionButtons = ({ onIncomeClick, onExpenseClick }: AddTransactionButtonsProps) => {
  return (
    <Box sx={{ '& > :not(style)': { m: 1 }, position: 'fixed', bottom: 24, right: 24 }}>
      <Fab sx={{ backgroundColor: 'red', color: 'white' }} aria-label="add expense" onClick={onExpenseClick}>
        <RemoveIcon />
      </Fab>
      <Fab sx={{ backgroundColor: 'green', color: 'white' }} aria-label="add income" onClick={onIncomeClick}>
        <AddIcon />
      </Fab>
    </Box>
  );
};