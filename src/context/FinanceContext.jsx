import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Initial Data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
        const [transRes, goalsRes, usersRes] = await Promise.all([
            supabase.from('transactions').select('*').order('date', { ascending: false }),
            supabase.from('goals').select('*'),
            supabase.from('app_users').select('*')
        ]);

        if (transRes.data) setTransactions(transRes.data);
        if (goalsRes.data) setGoals(goalsRes.data);
        if (usersRes.data) setUsers(usersRes.data.map(u => u.name));
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        setLoading(false);
    }
  };

  const addTransaction = async (transaction) => {
    const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single();
    
    if (data && !error) {
        setTransactions(prev => [data, ...prev]);
    }
  };

  const removeTransaction = async (id) => {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

    if (!error) {
        setTransactions(prev => prev.filter(t => t.id !== id));
    } else {
        console.error("Erro ao remover:", error);
    }
  };

  const updateTransaction = async (id, updatedTransaction) => {
    const { data, error } = await supabase
        .from('transactions')
        .update(updatedTransaction)
        .eq('id', id)
        .select()
        .single();
    
    if (data && !error) {
        setTransactions(prev => prev.map(t => t.id === id ? data : t));
    } else {
        console.error("Erro ao atualizar transação:", error);
        alert(`Erro ao atualizar: ${error?.message}`);
    }
  };

  const addGoal = async (goal) => {
    const { data, error } = await supabase
        .from('goals')
        .insert([goal])
        .select()
        .single();

    if (data && !error) {
        setGoals(prev => [data, ...prev]);
    }
  };

  const removeGoal = async (id) => {
    const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

    if (!error) {
        setGoals(prev => prev.filter(g => g.id !== id));
    }
  };

  const addUser = async (name) => {
    if (!users.includes(name)) {
        const { data, error } = await supabase
            .from('app_users')
            .insert([{ name }])
            .select()
            .single();
        
        if (data && !error) {
            setUsers(prev => [...prev, data.name]);
        }
    }
  };

  const removeUser = async (name) => {
    // Note: This matches by name, be careful if names are not unique. Schema enforces unique name.
    const { error } = await supabase
        .from('app_users')
        .delete()
        .eq('name', name);

    if (!error) {
        setUsers(prev => prev.filter(u => u !== name));
    }
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
      loading,
      addTransaction,
      removeTransaction,
      updateTransaction,
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
