import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Trash2 } from 'lucide-react';

const Transactions = () => {
    const { transactions, addTransaction, removeTransaction, users, addUser } = useFinance();
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    // Form State
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense'); // income or expense
    const [category, setCategory] = useState('');
    const [context, setContext] = useState('individual'); // individual or family
    const [owner, setOwner] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description || !amount || !category) return;

        // Auto-add new owner if not exists
        if (owner) {
            addUser(owner);
        }

        addTransaction({
            description,
            amount: parseFloat(amount),
            type,
            category,
            category,
            context,
            owner,
            date
        });

        // Reset form
        setDescription('');
        setAmount('');
        setCategory('');
        setContext('individual');
        setOwner('');
        setIsFormOpen(false);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="page-title">Transações</h2>
                <button 
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="btn btn-primary"
                >
                    <Plus size={20} />
                    Nova Transação
                </button>
            </div>

            {/* Form Modal / Panel */}
            {isFormOpen && (
                <div className="card mb-8">
                    <h3 className="card-title mb-4" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-primary)' }}>Adicionar Transação</h3>
                    <form onSubmit={handleSubmit} className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
                        <div className="form-group">
                            <label className="form-label">Descrição</label>
                            <input 
                                type="text" 
                                className="form-input"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Ex: Supermercado"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Valor (R$)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                className="form-input"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tipo</label>
                            <div className="flex gap-4" style={{ marginTop: 'var(--spacing-2)' }}>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="type" 
                                        value="expense" 
                                        checked={type === 'expense'} 
                                        onChange={() => setType('expense')}
                                    />
                                    <span className="text-danger">Despesa</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="type" 
                                        value="income" 
                                        checked={type === 'income'} 
                                        onChange={() => setType('income')}
                                    />
                                    <span className="text-success">Receita</span>
                                </label>
                            </div>
                        </div>
                         <div className="form-group">
                            <label className="form-label">Categoria</label>
                            <select 
                                className="form-select"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                <option value="">Selecione...</option>
                                <option value="Alimentação">Alimentação</option>
                                <option value="Moradia">Moradia</option>
                                <option value="Lazer">Lazer</option>
                                <option value="Saúde">Saúde</option>
                                <option value="Salário">Salário</option>
                                <option value="Investimentos">Investimentos</option>
                                <option value="Outros">Outros</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Contexto</label>
                            <select 
                                className="form-select"
                                value={context}
                                onChange={e => setContext(e.target.value)}
                            >
                                <option value="individual">Individual</option>
                                <option value="family">Familiar</option>
                            </select>
                        </div>
                        <div className="form-group">
                             <label className="form-label">Responsável</label>
                             <input 
                                 type="text"
                                 className="form-input"
                                 value={owner}
                                 onChange={e => setOwner(e.target.value)}
                                 list="users-list"
                                 placeholder="Digite ou selecione..."
                             />
                             <datalist id="users-list">
                                 {users.map(u => (
                                     <option key={u} value={u} />
                                 ))}
                             </datalist>
                        </div>
                         <div className="form-group">
                            <label className="form-label">Data</label>
                            <input 
                                type="date" 
                                className="form-input"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-4" style={{ gridColumn: '1 / -1' }}>
                             <button 
                                type="button" 
                                onClick={() => setIsFormOpen(false)}
                                className="btn btn-ghost"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                            >
                                Salvar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Transactions List */}
            <div className="card table-container" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Descrição</th>
                            <th>Categoria</th>
                            <th>Data</th>
                            <th className="text-right">Valor</th>
                            <th className="text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((t) => (
                            <tr key={t.id}>
                                <td className="font-medium">{t.description}</td>
                                <td className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                                    {t.category} 
                                    <span style={{ marginLeft: '8px', fontSize: '0.7em', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                        {t.context === 'family' ? 'Familiar' : 'Individual'}
                                    </span>
                                    {t.owner && (
                                        <span style={{ marginLeft: '4px', fontSize: '0.7em', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-hover)', color: 'var(--accent-primary)' }}>
                                            {t.owner}
                                        </span>
                                    )}
                                </td>
                                <td className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>{formatDate(t.date)}</td>
                                <td className={`text-right font-bold ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                </td>
                                <td className="text-center">
                                    <button 
                                        onClick={() => removeTransaction(t.id)}
                                        className="btn btn-ghost"
                                        style={{ padding: 'var(--spacing-2)' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center text-muted" style={{ padding: 'var(--spacing-8)' }}>
                                    Nenhuma transação encontrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default Transactions;
