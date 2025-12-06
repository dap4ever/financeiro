import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Target, Trash2, Pencil } from 'lucide-react';

const Goals = () => {
    const { goals, addGoal, removeGoal, updateGoal } = useFinance();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [description, setDescription] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [context, setContext] = useState('individual');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description || !targetAmount) return;

        const goalData = {
            description,
            targetAmount: targetAmount ? parseFloat(targetAmount) : 0,
            currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
            deadline: deadline || null,
            context
        };

        if (editingId) {
            updateGoal(editingId, goalData);
        } else {
            addGoal(goalData);
        }

        resetForm();
    };

    const resetForm = () => {
        setDescription('');
        setTargetAmount('');
        setCurrentAmount('0');
        setDeadline('');
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleEdit = (goal) => {
        setEditingId(goal.id);
        setDescription(goal.description);
        setTargetAmount(goal.targetAmount);
        setCurrentAmount(goal.currentAmount);
        setDeadline(goal.deadline || '');
        setContext(goal.context);
        setIsFormOpen(true);
    };

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

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="page-title">Metas e Planos</h2>
                <button 
                    onClick={() => {
                        resetForm();
                        setIsFormOpen(!isFormOpen);
                    }}
                    className="btn btn-primary"
                >
                    <Plus size={20} />
                    Nova Meta
                </button>
            </div>

             {/* Form Modal / Panel */}
             {isFormOpen && (
                <div className="card mb-8">
                    <h3 className="card-title mb-4" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-primary)' }}>
                        {editingId ? 'Editar Meta' : 'Adicionar Meta'}
                    </h3>
                    <form onSubmit={handleSubmit} className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Descrição do Objetivo</label>
                            <input 
                                type="text" 
                                className="form-input"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Ex: Viagem para Europa, Reserva de Emergência"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Valor Alvo (R$)</label>
                             <input 
                                type="tel" 
                                className="form-input"
                                value={targetAmount === '' ? '' : formatCurrency(targetAmount)}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    const numberValue = Number(value) / 100;
                                    setTargetAmount(numberValue || '');
                                }}
                                placeholder="R$ 0,00"
                            />
                        </div>
                         <div className="form-group">
                            <label className="form-label">Valor Atual (R$)</label>
                            <input 
                                type="tel" 
                                className="form-input"
                                value={currentAmount === '' ? '' : formatCurrency(currentAmount)}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    const numberValue = Number(value) / 100;
                                    setCurrentAmount(numberValue || '');
                                }}
                                placeholder="R$ 0,00"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Data Alvo</label>
                            <input 
                                type="date" 
                                className="form-input"
                                value={deadline}
                                onChange={e => setDeadline(e.target.value)}
                            />
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
                        <div className="flex justify-end gap-2 mt-4" style={{ gridColumn: '1 / -1' }}>
                             <button 
                                type="button" 
                                onClick={resetForm}
                                className="btn btn-ghost"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                            >
                                {editingId ? 'Atualizar' : 'Salvar'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="dashboard-grid">
                {goals.map((goal) => {
                    const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                    return (
                        <div key={goal.id} className="card relative flex flex-col justify-between" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col items-start gap-3">
                                        <div style={{ backgroundColor: 'var(--bg-hover)', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-md)', color: 'var(--accent-secondary)', width: 'fit-content' }}>
                                            <Target size={24} />
                                        </div>
                                        <h3 className="font-bold text-lg leading-tight">{goal.description}</h3>
                                    </div>

                                    <div className="flex flex-col items-end gap-3">
                                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                                            {goal.context === 'family' ? 'Familiar' : 'Individual'}
                                        </span>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleEdit(goal)}
                                                className="btn btn-ghost"
                                                style={{ padding: 'var(--spacing-2)' }}
                                                title="Editar Meta"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if(window.confirm(`Tem certeza que deseja excluir a meta "${goal.description}"?`)) {
                                                        removeGoal(goal.id);
                                                    }
                                                }}
                                                className="btn btn-ghost text-danger"
                                                style={{ padding: 'var(--spacing-2)' }}
                                                title="Excluir Meta"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                
                                <div className="mb-2">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Progresso</span>
                                        <span className="font-medium">{progress}%</span>
                                    </div>
                                    <div style={{ height: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div 
                                            style={{ height: '100%', backgroundColor: 'var(--accent-secondary)', width: `${progress}%`, transition: 'width 0.5s ease' }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm text-muted mt-4">
                                    <span>Atual: <b style={{ color: 'var(--text-primary)' }}>{formatCurrency(goal.currentAmount)}</b></span>
                                    <span>Alvo: <b style={{ color: 'var(--text-primary)' }}>{formatCurrency(goal.targetAmount)}</b></span>
                                </div>
                            </div>
                             {goal.deadline && (
                                <div className="mt-4 pt-4 text-right text-muted" style={{ borderTop: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
                                    Meta para: {formatDate(goal.deadline)}
                                </div>
                            )}
                        </div>
                    );
                })}
                {goals.length === 0 && (
                    <div className="card text-center" style={{ gridColumn: '1 / -1', padding: 'var(--spacing-12)', color: 'var(--text-muted)' }}>
                        <Target size={48} style={{ margin: '0 auto', marginBottom: 'var(--spacing-4)', opacity: 0.2 }} />
                        <p>Nenhuma meta criada ainda. Comece definindo seus objetivos!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default Goals;
