import { useState, useContext } from 'react';
import './Expenses.css';
import { LanguageContext } from '../App';
import { useExpenses } from '../context/ExpensesContext';
import { formatDate } from '../utils/dateUtils';
import { useUser } from '../context/UserContext';

const Expenses = () => {
    const { t } = useContext(LanguageContext);
    const { expenses, addExpense, deleteExpense } = useExpenses();
    const user = useUser();
    const [showAddForm, setShowAddForm] = useState(false);

    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        date: '',
        field: '',
        description: '',
        paymentMethod: ''
    });

    const categories = [t('fertilizer'), t('seeds'), t('water'), t('labor'), t('equipment'), t('pesticides'), t('transport'), t('other')];
    const fields = ['North Field', 'East Field', 'West Field', 'South Field'];
    const paymentMethods = ['Cash', 'Bank Transfer', 'UPI', 'Credit Card'];

    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        const newExpense = {
            ...formData,
            amount: parseFloat(formData.amount)
        };
        addExpense(newExpense);
        setFormData({
            category: '',
            amount: '',
            date: '',
            field: '',
            description: '',
            paymentMethod: ''
        });
        setShowAddForm(false);
    };

    const handleDelete = (id) => {
        deleteExpense(id);
    };

    return (
        <div className="expenses-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{t('expenses')}</h1>
                    <p className="page-subtitle">{t('trackAllExpenses')}</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                    <span>➕</span>
                    {t('addExpense')}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="expense-summary grid grid-3">
                <div className="summary-card">
                    <div className="summary-icon">💰</div>
                    <div className="summary-info">
                        <div className="summary-label">{t('totalExpenses')}</div>
                        <div className="summary-value">₹{totalExpenses.toLocaleString()}</div>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">📊</div>
                    <div className="summary-info">
                        <div className="summary-label">{t('thisMonth')}</div>
                        <div className="summary-value">₹{(totalExpenses * 0.4).toLocaleString()}</div>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">📈</div>
                    <div className="summary-info">
                        <div className="summary-label">{t('averageMonth')}</div>
                        <div className="summary-value">₹{(totalExpenses / 6).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Add Expense Form */}
            {showAddForm && (
                <div className="add-form-container animate-fade-in">
                    <div className="card">
                        <h3 className="form-title">{t('addExpense')}</h3>
                        <form onSubmit={handleSubmit} className="expense-form">
                            <div className="form-grid">
                                <div className="input-group">
                                    <label className="input-label">{t('category')} *</label>
                                    <select
                                        className="input"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">{t('amount')} (₹) *</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">{t('date')} *</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">{t('field')} *</label>
                                    <select
                                        className="input"
                                        value={formData.field}
                                        onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                                        required
                                    >
                                        <option value="">Select field</option>
                                        {fields.map(field => (
                                            <option key={field} value={field}>{field}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">{t('paymentMethod')}</label>
                                    <select
                                        className="input"
                                        value={formData.paymentMethod}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    >
                                        {paymentMethods.map(method => (
                                            <option key={method} value={method}>{method}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group full-width">
                                    <label className="input-label">{t('description')}</label>
                                    <textarea
                                        className="input"
                                        placeholder="Add notes about this expense..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                                    {t('cancel')}
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {t('save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Expenses List */}
            <div className="expenses-list">
                <h3 className="list-title">{t('allExpenses')}</h3>
                <div className="expense-items">
                    {expenses.length > 0 ? (
                        expenses.map((expense) => (
                            <div key={expense.id} className="expense-item">
                                <div className="expense-icon">💸</div>
                                <div className="expense-main">
                                    <div className="expense-header">
                                        <span className="expense-category">{expense.category}</span>
                                        <span className="expense-amount">-₹{parseFloat(expense.amount).toLocaleString()}</span>
                                    </div>
                                    <div className="expense-details">
                                        <span>{expense.field}</span>
                                        <span>•</span>
                                        <span>{formatDate(expense.date)}</span>
                                        {expense.paymentMethod && (
                                            <>
                                                <span>•</span>
                                                <span>{expense.paymentMethod}</span>
                                            </>
                                        )}
                                        {user?.is_admin && expense.user_email && (
                                            <>
                                                <span>•</span>
                                                <span style={{ color: '#10b981' }}>👤 {expense.user_name}</span>
                                            </>
                                        )}
                                    </div>
                                    {expense.description && (
                                        <div className="expense-description">{expense.description}</div>
                                    )}
                                </div>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(expense.id)}
                                    title="Delete Expense"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                            <h3 style={{ marginBottom: '8px' }}>No expenses yet</h3>
                            <p>Click "Add Expense" above to record your first expense.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Expenses;
