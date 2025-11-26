import { useState, useContext } from 'react';
import './Expenses.css';
import { LanguageContext } from '../App';
import { useRevenue } from '../context/RevenueContext';
import { formatDate } from '../utils/dateUtils';

const Revenue = () => {
    const { t } = useContext(LanguageContext);
    const { revenue, addRevenue, deleteRevenue } = useRevenue();
    const [showAddForm, setShowAddForm] = useState(false);

    const [formData, setFormData] = useState({
        source: '',
        product: '',
        amount: '',
        date: '',
        quantity: '',
        paymentReceived: false
    });

    const sources = ['Crop Sale', 'Government Subsidy', 'Insurance Claim', 'Contract Farming', 'Other'];

    const totalRevenue = revenue.reduce((sum, rev) => sum + parseFloat(rev.amount || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addRevenue(formData);
        setFormData({
            source: '',
            product: '',
            amount: '',
            date: '',
            quantity: '',
            paymentReceived: false
        });
        setShowAddForm(false);
    };

    const handleDelete = async (id) => {
        await deleteRevenue(id);
    };

    return (
        <div className="expenses-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{t('revenue')}</h1>
                    <p className="page-subtitle">{t('trackAllRevenue')}</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                    <span>➕</span>
                    {t('addRevenue')}
                </button>
            </div>

            <div className="expense-summary grid grid-3">
                <div className="summary-card">
                    <div className="summary-icon" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))', border: '1px solid rgba(34, 197, 94, 0.3)' }}>💰</div>
                    <div className="summary-info">
                        <div className="summary-label">Total Revenue</div>
                        <div className="summary-value" style={{ color: 'var(--success-400)' }}>₹{totalRevenue.toLocaleString()}</div>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))', border: '1px solid rgba(34, 197, 94, 0.3)' }}>📊</div>
                    <div className="summary-info">
                        <div className="summary-label">This Month</div>
                        <div className="summary-value" style={{ color: 'var(--success-400)' }}>₹{(totalRevenue * 0.6).toLocaleString()}</div>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))', border: '1px solid rgba(34, 197, 94, 0.3)' }}>📈</div>
                    <div className="summary-info">
                        <div className="summary-label">Average/Month</div>
                        <div className="summary-value" style={{ color: 'var(--success-400)' }}>₹{(totalRevenue / 3).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Add Revenue Form */}
            {showAddForm && (
                <div className="add-form-container animate-fade-in">
                    <div className="card">
                        <h3 className="form-title">Add New Revenue</h3>
                        <form onSubmit={handleSubmit} className="expense-form">
                            <div className="form-grid">
                                <div className="input-group">
                                    <label className="input-label">Source *</label>
                                    <select
                                        className="input"
                                        value={formData.source}
                                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                        required
                                    >
                                        <option value="">Select source</option>
                                        {sources.map(src => (
                                            <option key={src} value={src}>{src}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Amount (₹) *</label>
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
                                    <label className="input-label">Date *</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Product/Crop *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g., Wheat, Rice, Cotton"
                                        value={formData.product}
                                        onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Quantity</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g., 500 kg"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    />
                                </div>

                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save Revenue
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="expenses-list">
                <h3 className="list-title">All Revenue</h3>
                <div className="expense-items">
                    {revenue.length > 0 ? (
                        revenue.map((rev) => (
                            <div key={rev.id} className="revenue-item">
                                <div className="revenue-icon">💰</div>
                                <div className="revenue-main">
                                    <div className="revenue-header">
                                        <span className="revenue-source">{rev.source}</span>
                                        <span className="revenue-amount">+₹{parseFloat(rev.amount).toLocaleString()}</span>
                                    </div>
                                    <div className="revenue-details">
                                        <span>{rev.product || 'N/A'}</span>
                                        <span>•</span>
                                        <span>{formatDate(rev.date)}</span>
                                        {rev.quantity && (
                                            <>
                                                <span>•</span>
                                                <span>{rev.quantity} units</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(rev.id)}
                                    title="Delete Revenue"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
                            <h3 style={{ marginBottom: '8px' }}>No revenue yet</h3>
                            <p>Click "Add Revenue" above to record your first revenue entry.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Revenue;
