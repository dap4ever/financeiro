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
        return Math.min(percent, 100).toFixed(2);
    };

    // Calculate total goals and saved amount
    const totalGoalsAmount = useMemo(() => {
        return goals.reduce((acc, goal) => acc + goal.targetAmount, 0);
    }, [goals]);

    const totalSavedAmount = useMemo(() => {
        return goals.reduce((acc, goal) => acc + goal.currentAmount, 0);
    }, [goals]);

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
        <div className="flex justify-between items-center mb-8">
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
        <div className="dashboard-grid" style={{ marginBottom: 'var(--spacing-8)' }}>
          {/* Card Saldo */}
          <div className="card" style={{ padding: 'var(--spacing-6)' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--spacing-3)' }}>Saldo Mensal</h3>
            <p className={`card-value ${balance >= 0 ? 'text-primary' : 'text-danger'}`} style={{ marginBottom: 'var(--spacing-4)' }}>
                {formatCurrency(balance)}
            </p>
            <div className="flex items-center text-sm text-muted">
              <span>Atualizado agora</span>
            </div>
          </div>
          
          <div className="card" style={{ padding: 'var(--spacing-6)' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--spacing-3)' }}>Receitas</h3>
            <p className="card-value text-success">{formatCurrency(income)}</p>
          </div>
  
          <div className="card" style={{ padding: 'var(--spacing-6)' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--spacing-3)' }}>Despesas</h3>
            <p className="card-value text-danger">{formatCurrency(expenses)}</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="card" style={{ height: '420px', padding: 'var(--spacing-6)', marginBottom: 'var(--spacing-8)' }}>
            <h3 className="font-bold" style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-5)' }}>Finanças por Responsável</h3>
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
            <div className="card" style={{ padding: 'var(--spacing-6)' }}>
                <h3 className="font-bold" style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-5)' }}>Últimas Transações</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
                    {lastTransactions.length === 0 ? (
                        <p className="text-muted text-sm">Nenhuma transação recente.</p>
                    ) : (
                        lastTransactions.map((t) => (
                            <div key={t.id} className="flex justify-between items-center" style={{ paddingBottom: 'var(--spacing-4)', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ flex: 1 }}>
                                    <p className="font-medium" style={{ marginBottom: 'var(--spacing-1)', color: 'var(--text-primary)' }}>{t.description}</p>
                                    <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                                        {t.category} • {formatDate(t.date)}
                                    </p>
                                </div>
                                <span className={`font-bold ${t.type === 'income' ? 'text-success' : 'text-danger'}`} style={{ fontSize: 'var(--font-size-base)', whiteSpace: 'nowrap', marginLeft: 'var(--spacing-4)' }}>
                                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="card" style={{ padding: 'var(--spacing-6)', display: 'flex', flexDirection: 'column' }}>
                <h3 className="font-bold" style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-5)' }}>Metas em Progresso</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', flex: 1 }}>
                    {goals.length === 0 ? (
                         <p className="text-muted text-sm">Nenhuma meta cadastrada.</p>
                    ) : (
                        goals.slice(0, 3).map(goal => {
                            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                            return (
                                <div key={goal.id} style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: 'var(--bg-hover)' }}>
                                        <div style={{ height: '100%', backgroundColor: 'var(--accent-secondary)', width: `${progress}%`, transition: 'width 0.5s ease' }}></div>
                                    </div>
                                    <div style={{ padding: 'var(--spacing-4)' }}>
                                        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-2)' }}>
                                            <h4 className="font-semibold" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>{goal.description}</h4>
                                            <div style={{ 
                                                backgroundColor: 'var(--accent-secondary)', 
                                                color: 'white',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: 'var(--font-size-xs)',
                                                fontWeight: 'bold',
                                                minWidth: '52px',
                                                textAlign: 'center'
                                            }}>
                                                {progress}%
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-2" style={{ marginBottom: 'var(--spacing-3)' }}>
                                            <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                                                {formatCurrency(goal.currentAmount)}
                                            </span>
                                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                                de {formatCurrency(goal.targetAmount)}
                                            </span>
                                        </div>
                                        <div style={{ height: '10px', backgroundColor: 'var(--bg-hover)', borderRadius: '5px', overflow: 'hidden' }}>
                                            <div style={{ 
                                                height: '100%', 
                                                backgroundColor: 'var(--accent-secondary)', 
                                                width: `${progress}%`, 
                                                transition: 'width 0.5s ease',
                                                boxShadow: `${progress > 0 ? '0 0 8px rgba(34, 197, 94, 0.4)' : 'none'}`
                                            }}></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {goals.length > 0 && (
                    <div style={{ 
                        marginTop: 'var(--spacing-6)',
                        background: 'linear-gradient(135deg, var(--bg-hover) 0%, var(--bg-card) 100%)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--spacing-5)',
                        paddingLeft: '15px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)', alignItems: 'center' }}>
                            <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: 'var(--spacing-5)', paddingTop: 'var(--spacing-2)', paddingBottom: 'var(--spacing-2)' }}>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--spacing-2)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>
                                    Total em Metas
                                </div>
                                <div className="font-bold" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-primary)' }}>
                                    {formatCurrency(totalGoalsAmount)}
                                </div>
                            </div>
                            <div style={{ paddingLeft: 'var(--spacing-3)', paddingTop: 'var(--spacing-2)', paddingBottom: 'var(--spacing-2)' }}>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--spacing-2)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>
                                    Economizado
                                </div>
                                <div className="font-bold text-success" style={{ fontSize: 'var(--font-size-lg)' }}>
                                    {formatCurrency(totalSavedAmount)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    );
  };
  
  export default Dashboard;
