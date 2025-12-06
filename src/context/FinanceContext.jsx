import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Derived state for current month filtering
  const filteredTransactions = transactions.filter(t => {
    // Robust string comparison YYYY-MM
    // t.date is YYYY-MM-DD
    const tYearMonth = t.date.slice(0, 7);
    const currentYear = currentDate.getFullYear();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentYearMonth = `${currentYear}-${currentMonth}`;
    
    return tYearMonth === currentYearMonth;
  });

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
        if (goalsRes.data) {
            const formattedGoals = goalsRes.data.map(g => ({
                ...g,
                // Map snake_case from DB to camelCase for App
                targetAmount: g.target_amount, 
                currentAmount: g.current_amount
            }));
            setGoals(formattedGoals);
        }
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
    // Map camelCase to snake_case for DB
    const goalDb = {
        description: goal.description,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount,
        deadline: goal.deadline,
        context: goal.context
    };

    const { data, error } = await supabase
        .from('goals')
        .insert([goalDb])
        .select()
        .single();

    if (data && !error) {
        // Map back to camelCase for local state
        const newGoal = {
            ...data,
            targetAmount: data.target_amount,
            currentAmount: data.current_amount
        };
        setGoals(prev => [newGoal, ...prev]);
    } else {
        console.error("Erro ao adicionar meta:", error);
        alert(`Erro ao salvar meta: ${error?.message}`);
    }
  };

  const removeGoal = async (id) => {
    const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

    if (!error) {
        setGoals(prev => prev.filter(g => g.id !== id));
    } else {
        console.error("Erro ao remover meta:", error);
        alert(`Erro ao remover meta: ${error?.message}`);
    }
  };

  const updateGoal = async (id, updatedGoal) => {
    // Map camelCase to snake_case for DB
    const goalDb = {
        description: updatedGoal.description,
        target_amount: updatedGoal.targetAmount,
        current_amount: updatedGoal.currentAmount,
        deadline: updatedGoal.deadline && updatedGoal.deadline !== '' ? updatedGoal.deadline : null,
        context: updatedGoal.context
    };

    const { data, error } = await supabase
        .from('goals')
        .update(goalDb)
        .eq('id', id)
        .select()
        .single();
    
    if (data && !error) {
        // Map back to camelCase for local state
        const newGoal = {
            ...data,
            targetAmount: data.target_amount,
            currentAmount: data.current_amount
        };
        setGoals(prev => prev.map(g => g.id === id ? newGoal : g));
    } else {
        console.error("Erro ao atualizar meta:", error);
        alert(`Erro ao atualizar meta: ${error?.message}`);
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

  const nextMonth = () => {
    setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() + 1);
        return newDate;
    });
  };

  const prevMonth = () => {
    setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() - 1);
        return newDate;
    });
  };

  const getBalance = () => {
    // Balance is usually total, but user might want monthly cashflow
    // Let's keep getBalance as TOTAL (all time) for "Accumulated" 
    // and add getMonthlyBalance for the period
    return transactions.reduce((acc, curr) => {
      return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
    }, 0);
  };

  const getMonthlyBalance = () => {
    return filteredTransactions.reduce((acc, curr) => {
      return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
    }, 0);
  };

  const getMonthlyIncome = () => {
      return filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);
  };

  const getMonthlyExpenses = () => {
      return filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);
  };

  // Re-expose legacy getIncome/getExpenses as monthly for backward compatibility if desired, 
  // currently Dashboard calls getIncome() / getExpenses(). 
  // Let's UPDATE Dashboard to call getMonthlyIncome/Expenses 
  // OR aliasing them here to force monthly view on cards.
  // Let's alias them to filtered versions for now.

  return (
    <FinanceContext.Provider value={{
      transactions,
      filteredTransactions,
      goals,
      loading,
      currentDate,
      nextMonth,
      prevMonth,
      addTransaction,
      removeTransaction,
      updateTransaction,
      addGoal,
      removeGoal,
      updateGoal,
      users,
      addUser,
      removeUser,
      getBalance, // Total
      getMonthlyBalance, // Monthly
      getIncome: getMonthlyIncome, // Alias for Dashboard
      getExpenses: getMonthlyExpenses // Alias for Dashboard
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
