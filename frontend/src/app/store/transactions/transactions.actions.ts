import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { 
  CreateTransactionRequest, 
  Transaction, 
  TransactionsSummary, 
  UpdateTransactionRequest 
} from '../../features/transactions/models/transactions';

export const TransactionActions = createActionGroup({
  source: 'Transactions',
  events: {
    'Load Dashboard': emptyProps(),
    'Load Dashboard Success': props<{ transactions: Transaction[]; summary: TransactionsSummary }>(),
    'Load Dashboard Failure': props<{ error: string }>(),

    'Load Summary': emptyProps(),
    'Load Summary Success': props<{ summary: TransactionsSummary }>(),
    'Load Summary Failure': props<{ error: string }>(),

    'Create Transaction': props<{ request: CreateTransactionRequest }>(),
    'Create Transaction Success': props<{ transaction: Transaction }>(),
    'Create Transaction Failure': props<{ error: string }>(),

    'Update Transaction': props<{ id: string; request: UpdateTransactionRequest }>(),
    'Update Transaction Success': props<{ transaction: Transaction }>(),
    'Update Transaction Failure': props<{ error: string }>(),

    'Delete Transaction': props<{ id: string }>(),
    'Delete Transaction Success': props<{ id: string }>(),
    'Delete Transaction Failure': props<{ error: string }>(),
  }
});
