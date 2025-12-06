import { useFinance } from '../context/FinanceContext';
import { useState, useMemo } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet, Calendar, ChevronLeft, ChevronRight, User, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [selectedUser, setSelectedUser] = useState('');
    const { 
        getMonthlyBalance, // Use monthly balance
        getIncome, 
        getExpenses, 
        filteredTransactions, // Use filtered logic
        users,
        currentDate,
        nextMonth,
        prevMonth,
        goals // Add goals to destructuring
    } = useFinance();

    // Filter logic for Dashboard (User + Month)
    const dashboardTransactions = useMemo(() => {
        if (!selectedUser) return filteredTransactions;
        return filteredTransactions.filter(t => t.owner === selectedUser);
    }, [filteredTransactions, selectedUser]);

    // Recalculate KPIs based on local filter
    const balance = dashboardTransactions.reduce((acc, curr) => {
        return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
    }, 0);

    const income = dashboardTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const expenses = dashboardTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');

        return `${day}/${month}/${year}`;
    };

    const calculateProgress = (current, target) => {
        if (!target) return 0;
        const percent = (current / target) * 100;
        return Math.min(percent, 100).toFixed(0);
    };

    const lastTransactions = useMemo(() => {
        return [...dashboardTransactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    }, [dashboardTransactions]);

    const chartData = useMemo(() => {
        const data = users.map(user => {
            const userTransactions = filteredTransactions.filter(t => t.owner === user);
            const userIncome = userTransactions
                .filter(t => t.type === 'income')
                .reduce((acc, curr) => acc + curr.amount, 0);
            const userExpense = userTransactions
                .filter(t => t.type === 'expense')
                .reduce((acc, curr) => acc + curr.amount, 0);
            
            return {
                name: user,
                Receitas: userIncome,
                Despesas: userExpense
            };
        });

        // Also add "Sem Dono" if there are transaction without owner
        const noOwnerTransactions = filteredTransactions.filter(t => !t.owner);
        if (noOwnerTransactions.length > 0) {
             const noOwnerIncome = noOwnerTransactions
                .filter(t => t.type === 'income')
                .reduce((acc, curr) => acc + curr.amount, 0);
            const noOwnerExpense = noOwnerTransactions
                .filter(t => t.type === 'expense')
                .reduce((acc, curr) => acc + curr.amount, 0);
            
            if (noOwnerIncome > 0 || noOwnerExpense > 0) {
                data.push({
                    name: 'Geral',
                    Receitas: noOwnerIncome,
                    Despesas: noOwnerExpense
                });
            }
        }

        return data;
    }, [filteredTransactions, users]);

    // Format current month for display (e.g., "Janeiro 2024")
    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="page-title">Visão Geral</h2>
            
            {/* Filters */}
            <div className="flex gap-4">
                {/* User Selector */}
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-border">
                    <User size={18} className="text-muted" />
                    <select 
                        value={selectedUser} 
                        onChange={e => setSelectedUser(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm font-medium pr-2"
                        style={{ minWidth: '120px' }}
                    >
                        <option value="">Todos</option>
                        {users.map(user => (
                            <option key={user} value={user}>{user}</option>
                        ))}
                    </select>
                </div>

                {/* Month Selector */}
                <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-lg border border-border">
                    <button onClick={prevMonth} className="btn btn-ghost p-1" title="Mês Anterior">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 font-medium min-w-[140px] justify-center">
                        <Calendar size={18} className="text-muted" />
                        <span>{capitalizedMonth}</span>
                    </div>
                        <button onClick={nextMonth} className="btn btn-ghost p-1" title="Próximo Mês">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
        <div className="dashboard-grid">
          {/* Card Saldo */}
          <div className="card">
            <h3 className="card-title">Saldo Mensal</h3>
            <p className={`card-value ${balance >= 0 ? 'text-primary' : 'text-danger'}`}>
                {formatCurrency(balance)}
            </p>
            <div className="mt-4 flex items-center text-sm text-muted">
              <span>Atualizado agora</span>
            </div>
          </div>
          
          <div className="card">
            <h3 className="card-title">Receitas</h3>
            <p className="card-value text-success">{formatCurrency(income)}</p>
          </div>
  
          <div className="card">
            <h3 className="card-title">Despesas</h3>
            <p className="card-value text-danger">{formatCurrency(expenses)}</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="card mt-6 mb-6" style={{ height: '400px' }}>
            <h3 className="font-bold mb-4" style={{ fontSize: 'var(--font-size-lg)' }}>Finanças por Responsável</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                    <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} tickFormatter={(value) => `R$ ${value}`} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        formatter={(value) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey="Receitas" fill="var(--accent-secondary)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Despesas" fill="var(--accent-danger)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
  
        <div className="two-col-grid">
            <div className="card">
                <h3 className="font-bold mb-4" style={{ fontSize: 'var(--font-size-lg)' }}>Últimas Transações</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                    {lastTransactions.length === 0 ? (
                        <p className="text-muted text-sm">Nenhuma transação recente.</p>
                    ) : (
                        lastTransactions.map((t) => (
                            <div key={t.id} className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-2)' }}>
                                <div>
                                    <p className="font-medium">{t.description}</p>
                                    <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                                        {t.category} • {formatDate(t.date)}
                                    </p>
                                </div>
                                <span className={`font-bold ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="card">
                <h3 className="font-bold mb-4" style={{ fontSize: 'var(--font-size-lg)' }}>Metas em Progresso</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                    {goals.length === 0 ? (
                         <p className="text-muted text-sm">Nenhuma meta cadastrada.</p>
                    ) : (
                        goals.slice(0, 3).map(goal => {
                            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                            return (
                                <div key={goal.id}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium">{goal.description}</span>
                                        <span className="text-muted">{progress}%</span>
                                    </div>
                                    <div style={{ height: '6px', backgroundColor: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div 
                                            style={{ height: '100%', backgroundColor: 'var(--accent-secondary)', width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
      </div>
    );
  };
  
  export default Dashboard;
