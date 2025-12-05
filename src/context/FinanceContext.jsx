import { createContext, useContext, useState, useEffect } from 'react';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
  // Load from localStorage or default
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [
      { id: 1, description: 'Salário', amount: 5200, type: 'income', date: '2023-10-01', category: 'Salário' },
      { id: 2, description: 'Supermercado', amount: 450, type: 'expense', date: '2023-10-05', category: 'Alimentação' },
    ];
  });

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('users');
    // Initialize empty, replacing old default if it matches exactly or just clean it up
    if (!saved) return []; 
    const parsed = JSON.parse(saved);
    // Migration: Remove 'Eu' and 'Cônjuge' if they exist (based on user request)
    return parsed.filter(u => u !== 'Eu' && u !== 'Cônjuge');
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  const addTransaction = (transaction) => {
    setTransactions(prev => [{ ...transaction, id: Date.now() }, ...prev]);
  };

  const removeTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addGoal = (goal) => {
    setGoals(prev => [{ ...goal, id: Date.now() }, ...prev]);
  };

  const removeGoal = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const addUser = (name) => {
    if (!users.includes(name)) {
      setUsers(prev => [...prev, name]);
    }
  };

  const removeUser = (name) => {
    setUsers(prev => prev.filter(u => u !== name));
  };

  const getBalance = () => {
    return transactions.reduce((acc, curr) => {
      return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
    }, 0);
  };

  const getIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  const getExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      goals,
      addTransaction,
      removeTransaction,
      addGoal,
      removeGoal,
      users,
      addUser,
      removeUser,
      getBalance,
      getIncome,
      getExpenses
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
