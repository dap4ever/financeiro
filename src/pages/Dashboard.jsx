import { useFinance } from '../context/FinanceContext';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const { getBalance, getIncome, getExpenses, transactions, users } = useFinance();

    const balance = getBalance();
    const income = getIncome();
    const expenses = getExpenses();

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const lastTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    }, [transactions]);

    const chartData = useMemo(() => {
        const data = users.map(user => {
            const userTransactions = transactions.filter(t => t.owner === user);
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
        const noOwnerTransactions = transactions.filter(t => !t.owner);
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
    }, [transactions, users]);

    return (
      <div>
        <h2 className="page-title">Visão Geral</h2>
        <div className="dashboard-grid">
          {/* Card Saldo */}
          <div className="card">
            <h3 className="card-title">Saldo Total</h3>
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
                <div className="mt-4 p-4 text-center text-muted" style={{ backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }}>
                    Funcionalidade de metas em breve.
                </div>
            </div>
        </div>
      </div>
    );
  };
  
  export default Dashboard;
