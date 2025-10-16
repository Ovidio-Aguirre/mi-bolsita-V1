// src/pages/HomePage/components/TransactionList.tsx
import { type Transaction } from '../../../services/firestoreService';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Skeleton from '@mui/material/Skeleton';

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  onEdit: (transaction: Transaction) => void;
}

export const TransactionList = ({ transactions, loading, onEdit }: TransactionListProps) => {
  if (loading) {
    return <Skeleton variant="rectangular" width="100%" height={200} />;
  }
  if (transactions.length === 0) {
    return <Typography sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>Aún no tienes movimientos.</Typography>;
  }
  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {transactions.map((transaction) => (
        <ListItemButton key={transaction.id} onClick={() => onEdit(transaction)} divider>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: transaction.type === 'income' ? 'green' : 'red' }}>
              {transaction.type === 'income' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            </Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={transaction.concept} 
            secondary={transaction.createdAt?.toDate().toLocaleDateString('es-SV')}
          />
          <Typography variant="body1" fontWeight="bold">
            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
          </Typography>
        </ListItemButton>
      ))}
    </List>
  );
};