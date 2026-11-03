import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CATEGORIES } from '../constants/categories';

const TRANSACTIONS_KEY = '@expense_tracker_transactions';
const BUDGET_KEY = '@expense_tracker_budget';

export const getTransactions = async () => {
  try {
    const json = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    if (!json) {
      // Seed initial dummy transactions
      const initialData = [
        {
          id: '1',
          amount: 35000,
          categoryId: 'food',
          notes: 'Makan siang Nasi Padang + Es Teh',
          paymentMethod: 'cash',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          amount: 25000,
          categoryId: 'transport',
          notes: 'Ongkos Ojek Online ke Kantor',
          paymentMethod: 'qris',
          date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          amount: 150000,
          categoryId: 'shopping',
          notes: 'Belanja sabun dan perlengkapan mandi',
          paymentMethod: 'transfer',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          amount: 100000,
          categoryId: 'bills',
          notes: 'Beli Token Listrik PLN',
          paymentMethod: 'qris',
          date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        },
      ];
      await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(json);
  } catch (e) {
    console.error('Error reading transactions:', e);
    return [];
  }
};

export const addTransaction = async (newTx) => {
  try {
    const list = await getTransactions();
    const updated = [newTx, ...list];
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error adding transaction:', e);
    throw e;
  }
};

export const updateTransaction = async (updatedTx) => {
  try {
    const list = await getTransactions();
    const updated = list.map((item) => (item.id === updatedTx.id ? { ...item, ...updatedTx } : item));
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error updating transaction:', e);
    throw e;
  }
};

export const deleteTransaction = async (id) => {
  try {
    const list = await getTransactions();
    const updated = list.filter((item) => item.id !== id);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error deleting transaction:', e);
    throw e;
  }
};

export const clearAllTransactions = async () => {
  try {
    await AsyncStorage.removeItem(TRANSACTIONS_KEY);
    return [];
  } catch (e) {
    console.error('Error clearing data:', e);
    throw e;
  }
};

export const getMonthlyBudget = async () => {
  try {
    const val = await AsyncStorage.getItem(BUDGET_KEY);
    return val ? Number(val) : 3500000; // Default budget 3.5 juta
  } catch (e) {
    return 3500000;
  }
};

export const setMonthlyBudget = async (limit) => {
  try {
    await AsyncStorage.setItem(BUDGET_KEY, String(limit));
    return limit;
  } catch (e) {
    console.error('Error saving budget:', e);
    throw e;
  }
};

