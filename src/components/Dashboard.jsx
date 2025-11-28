import { useState, useContext, useMemo } from 'react';
import './Dashboard.css';
import { LanguageContext } from '../App';
import { useExpenses } from '../context/ExpensesContext';
import { useRevenue } from '../context/RevenueContext';
import { useCrops } from '../context/CropsContext';
import { useFields } from '../context/FieldsContext';
import FarmingBot from './FarmingBot';
import { formatDate } from '../utils/dateUtils';
import { useUser } from '../context/UserContext';
import { exportToExcel } from '../utils/excelExport';



const Dashboard = () => {
    const { t } = useContext(LanguageContext);
    const { expenses, addExpense } = useExpenses();
    const { revenue, addRevenue } = useRevenue();
    const { crops, addCrop } = useCrops();
    const { fields } = useFields();
    const user = useUser();

    // Generate dynamic season options
    const generateSeasonOptions = () => {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const seasons = [];

        // If we're in Jul-Dec, current season is current year to next year
        // If we're in Jan-Jun, current season is previous year to current year
        const currentSeasonStartYear = currentMonth >= 6 ? currentYear : currentYear - 1;

        // Generate 5 season options (current + 4 previous)
        for (let i = 0; i < 5; i++) {
            const startYear = currentSeasonStartYear - i;
            const endYear = startYear + 1;
            seasons.push(`${startYear}-${endYear.toString().slice(-2)}`);
        }

        return seasons;
    };

    const seasonOptions = useMemo(() => generateSeasonOptions(), []);
    const [selectedSeason, setSelectedSeason] = useState(seasonOptions[0]);
    const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
    const [showRecordSaleModal, setShowRecordSaleModal] = useState(false);
    const [showAddCropModal, setShowAddCropModal] = useState(false);
    const [showChatbot, setShowChatbot] = useState(false);

    const [expenseFormData, setExpenseFormData] = useState({
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        field: '',
        description: '',
        paymentMethod: ''
    });

    const categories = [t('fertilizer'), t('seeds'), t('water'), t('labor'), t('equipment'), t('pesticides'), t('transport'), t('other')];
    const fieldOptions = fields.length > 0 ? fields.map(f => f.name) : ['North Field', 'East Field', 'West Field', 'South Field'];
    const paymentMethods = ['Cash', 'Bank Transfer', 'UPI', 'Credit Card'];

    const handleAddExpense = (e) => {
        e.preventDefault();
        addExpense({
            ...expenseFormData,
            amount: parseFloat(expenseFormData.amount)
        });
        setShowAddExpenseModal(false);
        setExpenseFormData({
            category: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            field: '',
            description: '',
            paymentMethod: ''
        });
    };

    // Get current season date range (simple implementation)
    const getCurrentSeasonDates = () => {
        const currentYear = new Date().getFullYear();
        const month = new Date().getMonth();
        // Simplified: Jul-Jun seasons
        if (month >= 6) { // Jul-Dec
            return {
                start: new Date(currentYear, 6, 1),
                end: new Date(currentYear + 1, 5, 30)
            };
        } else { // Jan-Jun
            return {
                start: new Date(currentYear - 1, 6, 1),
                end: new Date(currentYear, 5, 30)
            };
        }
    };

    const getPreviousSeasonDates = () => {
        const current = getCurrentSeasonDates();
        return {
            start: new Date(current.start.getFullYear() - 1, current.start.getMonth(), 1),
            end: new Date(current.end.getFullYear() - 1, current.end.getMonth(), current.end.getDate())
        };
    };

    // Calculate stats with season comparison
    const stats = useMemo(() => {
        const currentSeason = getCurrentSeasonDates();
        const previousSeason = getPreviousSeasonDates();

        const filterBySeason = (items, season) => {
            return items.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= season.start && itemDate <= season.end;
            });
        };

        const currentRevenue = filterBySeason(revenue, currentSeason);
        const previousRevenue = filterBySeason(revenue, previousSeason);
        const currentExpenses = filterBySeason(expenses, currentSeason);
        const previousExpenses = filterBySeason(expenses, previousSeason);

        const totalRevenue = revenue.reduce((sum, rev) => sum + parseFloat(rev.amount || 0), 0);
        const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
        const netProfit = totalRevenue - totalExpenses;

        const currentSeasonRevenue = currentRevenue.reduce((sum, rev) => sum + parseFloat(rev.amount || 0), 0);
        const previousSeasonRevenue = previousRevenue.reduce((sum, rev) => sum + parseFloat(rev.amount || 0), 0);
        const revenueChange = previousSeasonRevenue > 0
            ? (((currentSeasonRevenue - previousSeasonRevenue) / previousSeasonRevenue) * 100).toFixed(1)
            : 0;

        const currentSeasonExpenses = currentExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
        const previousSeasonExpenses = previousExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
        const expenseChange = previousSeasonExpenses > 0
            ? (((currentSeasonExpenses - previousSeasonExpenses) / previousSeasonExpenses) * 100).toFixed(1)
            : 0;

        const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

        return {
            totalRevenue,
            totalExpenses,
            netProfit,
            revenueChange,
            expenseChange,
            profitMargin,
            activeCrops: crops.filter(c => c.status === 'Growing' || c.status === 'Planted').length,
            totalFields: 12,
            harvestReady: crops.filter(c => c.status === 'Harvest Ready').length,
        };
    }, [revenue, expenses, crops]);

    const recentExpenses = expenses.slice(0, 4);
    const recentRevenue = revenue.slice(0, 4);

    const [newSale, setNewSale] = useState({
        source: 'Crop Sale',
        product: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        quantity: '',
        paymentReceived: false
    });

    const [showUploadPhotoModal, setShowUploadPhotoModal] = useState(false);
    const [newPhoto, setNewPhoto] = useState({
        cropId: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        file: null
    });

    const [newCropData, setNewCropData] = useState({
        name: '',
        variety: '',
        field_id: '',
        area: '',
        planted_date: new Date().toISOString().split('T')[0],
        expected_harvest_date: '',
        status: 'Planted',
        progress: 0,
        health: 'Good',
        notes: ''
    });

    const cropStatus = crops.slice(0, 4).map(crop => ({
        name: crop.name,
        field: crop.field_name || 'N/A',
        status: crop.status,
        progress: crop.progress,
        health: crop.health
    }));

    const handleRecordSaleSubmit = async (e) => {
        e.preventDefault();

        // Add revenue via API
        await addRevenue(newSale);

        // Reset and close
        setNewSale({
            source: 'Crop Sale',
            product: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            quantity: '',
            paymentReceived: false
        });
        setShowRecordSaleModal(false);
    };

    const handleUploadPhotoSubmit = (e) => {
        e.preventDefault();
        // In a real app, we would upload the file to a server here
        console.log("Uploading photo:", newPhoto);

        // Reset and close
        setNewPhoto({
            cropId: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
            file: null
        });
        setShowUploadPhotoModal(false);
    };

    const handleAddCropSubmit = async (e) => {
        e.preventDefault();

        // Add crop via API
        await addCrop(newCropData);

        // Reset and close
        setNewCropData({
            name: '',
            variety: '',
            field_id: '',
            area: '',
            planted_date: new Date().toISOString().split('T')[0],
            expected_harvest_date: '',
            status: 'Planted',
            progress: 0,
            health: 'Good',
            notes: ''
        });
        setShowAddCropModal(false);
    };

    const handleExportExcel = () => {
        // Calculate stats for the report
        const totalRev = revenue.reduce((sum, rev) => sum + parseFloat(rev.amount || 0), 0);
        const totalExp = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
        const profit = totalRev - totalExp;

        const reportStats = {
            totalRevenue: totalRev,
            totalExpenses: totalExp,
            netProfit: profit
        };

        // Get all expenses and revenue (not just recent 5)
        const allExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
        const allRevenue = [...revenue].sort((a, b) => new Date(b.date) - new Date(a.date));

        // Get active crops
        const activeCrops = crops.map(crop => ({
            name: crop.name,
            field: crop.field_name || 'Unknown',
            status: crop.status,
            progress: crop.progress,
            health: crop.health
        }));

        exportToExcel(user, reportStats, allExpenses, allRevenue, activeCrops);
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1 className="page-title">{t('dashboard')}</h1>
                    <p className="page-subtitle">{t('welcomeBack')}</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-primary"
                        onClick={handleExportExcel}
                        style={{ marginRight: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <span>📊</span>
                        Export Excel
                    </button>
                    <select
                        className="input season-select"
                        value={selectedSeason}
                        onChange={(e) => setSelectedSeason(e.target.value)}
                    >
                        {seasonOptions.map((season) => (
                            <option key={season} value={season}>
                                {t('season')} {season}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats Grid - Only 3 cards */}
            <div className="stats-grid grid grid-3">
                <div className="stat-card">
                    <div className="stat-icon revenue">💵</div>
                    <div className="stat-info">
                        <div className="stat-label">{t('totalRevenue')}</div>
                        <div className="stat-value">₹{stats.totalRevenue.toLocaleString()}</div>
                        <div className={`stat-change ${stats.revenueChange >= 0 ? 'positive' : 'negative'}`}>
                            {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange}% {t('fromLastSeason')}
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon expense">💳</div>
                    <div className="stat-info">
                        <div className="stat-label">{t('totalExpenses')}</div>
                        <div className="stat-value">₹{stats.totalExpenses.toLocaleString()}</div>
                        <div className={`stat-change ${stats.expenseChange <= 0 ? 'positive' : 'negative'}`}>
                            {stats.expenseChange >= 0 ? '+' : ''}{stats.expenseChange}% {t('fromLastSeason')}
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon profit">💰</div>
                    <div className="stat-info">
                        <div className="stat-label">{t('netProfit')}</div>
                        <div className="stat-value">₹{stats.netProfit.toLocaleString()}</div>
                        <div className={`stat-change ${stats.profitMargin >= 0 ? 'positive' : 'negative'}`}>
                            {stats.profitMargin >= 0 ? '+' : ''}{stats.profitMargin}% {t('margin')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-grid">
                {/* Crop Status */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2 className="section-title">{t('cropStatus')}</h2>
                        <button className="btn btn-sm btn-secondary">{t('viewAll')}</button>
                    </div>
                    <div className="crop-list">
                        {cropStatus.map((crop, index) => (
                            <div key={index} className="crop-item">
                                <div className="crop-header">
                                    <div>
                                        <div className="crop-name">{crop.name}</div>
                                        <div className="crop-field">{crop.field}</div>
                                    </div>
                                    <span className={`badge ${crop.status === 'Harvest Ready' ? 'badge-success' :
                                        crop.status === 'Growing' ? 'badge-info' : 'badge-warning'
                                        }`}>
                                        {crop.status}
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${crop.progress}%` }}
                                    ></div>
                                </div>
                                <div className="crop-footer">
                                    <span className="crop-progress">{crop.progress}% Complete</span>
                                    <span className={`crop-health ${crop.health.toLowerCase()}`}>
                                        {crop.health === 'Excellent' ? '🟢' : '🟡'} {crop.health}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Expenses */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2 className="section-title">{t('recentExpenses')}</h2>
                        <button className="btn btn-sm btn-secondary">{t('viewAll')}</button>
                    </div>
                    <div className="transaction-list">
                        {recentExpenses.map((expense) => (
                            <div key={expense.id} className="transaction-item">
                                <div className="transaction-icon expense">💸</div>
                                <div className="transaction-info">
                                    <div className="transaction-title">{expense.category}</div>
                                    <div className="transaction-subtitle">{expense.field} • {formatDate(expense.date)}</div>
                                </div>
                                <div className="transaction-amount expense">-₹{expense.amount.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Revenue */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2 className="section-title">{t('recentRevenue')}</h2>
                        <button className="btn btn-sm btn-secondary">{t('viewAll')}</button>
                    </div>
                    <div className="transaction-list">
                        {recentRevenue.map((rev) => (
                            <div key={rev.id} className="transaction-item">
                                <div className="transaction-icon revenue">💰</div>
                                <div className="transaction-info">
                                    <div className="transaction-title">{rev.source}</div>
                                    <div className="transaction-subtitle">{rev.product || 'N/A'} • {formatDate(rev.date)}</div>
                                </div>
                                <div className="transaction-amount revenue">+₹{parseFloat(rev.amount).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="dashboard-section quick-actions-section">
                    <div className="section-header">
                        <h2 className="section-title">{t('quickActions')}</h2>
                    </div>
                    <div className="quick-actions">
                        <button className="action-card" onClick={() => setShowAddExpenseModal(true)}>
                            <span className="action-icon">➕</span>
                            <span className="action-label">{t('addExpense')}</span>
                        </button>
                        <button className="action-card" onClick={() => setShowRecordSaleModal(true)}>
                            <span className="action-icon">💵</span>
                            <span className="action-label">{t('recordSale')}</span>
                        </button>
                        <button className="action-card" onClick={() => setShowAddCropModal(true)}>
                            <span className="action-icon">🌱</span>
                            <span className="action-label">{t('newCrop')}</span>
                        </button>
                        <button className="action-card" onClick={() => setShowUploadPhotoModal(true)}>
                            <span className="action-icon">📸</span>
                            <span className="action-label">{t('uploadPhoto')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Expense Modal */}
            {showAddExpenseModal && (
                <div className="modal-overlay">
                    <div className="modal-content card animate-fade-in">
                        <div className="modal-header">
                            <h3 className="modal-title">{t('addExpense')}</h3>
                            <button className="close-btn" onClick={() => setShowAddExpenseModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddExpense}>
                            <div className="form-grid">
                                <div className="input-group">
                                    <label className="input-label">{t('category')} *</label>
                                    <select
                                        className="input"
                                        value={expenseFormData.category}
                                        onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat, index) => (
                                            <option key={index} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">{t('amount')} (₹) *</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="0.00"
                                        value={expenseFormData.amount}
                                        onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">{t('date')} *</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={expenseFormData.date}
                                        onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">{t('crop')} / {t('field')}</label>
                                    <select
                                        className="input"
                                        value={expenseFormData.field}
                                        onChange={(e) => setExpenseFormData({ ...expenseFormData, field: e.target.value })}
                                    >
                                        <option value="">Select Crop</option>
                                        {cropStatus.map((crop, index) => (
                                            <option key={index} value={crop.name}>{crop.name} ({crop.field})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">{t('paymentMethod')}</label>
                                    <select
                                        className="input"
                                        value={expenseFormData.paymentMethod}
                                        onChange={(e) => setExpenseFormData({ ...expenseFormData, paymentMethod: e.target.value })}
                                    >
                                        <option value="">Select Payment Method</option>
                                        {paymentMethods.map((method, index) => (
                                            <option key={index} value={method}>{method}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-group full-width">
                                    <label className="input-label">{t('description')}</label>
                                    <textarea
                                        className="input"
                                        rows="3"
                                        value={expenseFormData.description}
                                        onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="form-actions" style={{ marginTop: '20px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddExpenseModal(false)}>
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

            {/* Record Sale Modal */}
            {showRecordSaleModal && (
                <div className="modal-overlay">
                    <div className="modal-content card animate-fade-in">
                        <div className="modal-header">
                            <h3 className="modal-title">{t('recordSale')}</h3>
                            <button className="close-btn" onClick={() => setShowRecordSaleModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleRecordSaleSubmit}>
                            <div className="form-grid">
                                <div className="input-group">
                                    <label className="input-label">Source *</label>
                                    <select
                                        className="input"
                                        value={newSale.source}
                                        onChange={(e) => setNewSale({ ...newSale, source: e.target.value })}
                                        required
                                    >
                                        <option value="Crop Sale">Crop Sale</option>
                                        <option value="Government Subsidy">Government Subsidy</option>
                                        <option value="Insurance Claim">Insurance Claim</option>
                                        <option value="Contract Farming">Contract Farming</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Product/Crop *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g., Wheat, Rice"
                                        value={newSale.product}
                                        onChange={(e) => setNewSale({ ...newSale, product: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Quantity</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g. 100 kg"
                                        value={newSale.quantity}
                                        onChange={(e) => setNewSale({ ...newSale, quantity: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Amount (₹) *</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="0.00"
                                        value={newSale.amount}
                                        onChange={(e) => setNewSale({ ...newSale, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Date *</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={newSale.date}
                                        onChange={(e) => setNewSale({ ...newSale, date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-actions" style={{ marginTop: '20px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowRecordSaleModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save Sale
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Upload Photo Modal */}
            {showUploadPhotoModal && (
                <div className="modal-overlay">
                    <div className="modal-content card animate-fade-in">
                        <div className="modal-header">
                            <h3 className="modal-title">{t('uploadPhoto')}</h3>
                            <button className="close-btn" onClick={() => setShowUploadPhotoModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleUploadPhotoSubmit}>
                            <div className="form-grid">
                                <div className="input-group">
                                    <label className="input-label">Select Crop</label>
                                    <select
                                        className="input"
                                        value={newPhoto.cropId}
                                        onChange={(e) => setNewPhoto({ ...newPhoto, cropId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Crop</option>
                                        {cropStatus.map((crop, index) => (
                                            <option key={index} value={crop.name}>
                                                {crop.name} ({crop.field})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={newPhoto.date}
                                        onChange={(e) => setNewPhoto({ ...newPhoto, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group full-width">
                                    <label className="input-label">Photo</label>
                                    <div className="file-upload-container">
                                        <input
                                            type="file"
                                            id="photo-upload"
                                            className="file-input"
                                            accept="image/*"
                                            onChange={(e) => setNewPhoto({ ...newPhoto, file: e.target.files[0] })}
                                            required
                                        />
                                        <label htmlFor="photo-upload" className="file-upload-label">
                                            {newPhoto.file ? newPhoto.file.name : 'Choose a photo or drag & drop'}
                                        </label>
                                    </div>
                                </div>
                                <div className="input-group full-width">
                                    <label className="input-label">Description / Notes</label>
                                    <textarea
                                        className="input"
                                        rows="3"
                                        placeholder="Add notes about crop health, growth stage, etc."
                                        value={newPhoto.description}
                                        onChange={(e) => setNewPhoto({ ...newPhoto, description: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="form-actions" style={{ marginTop: '20px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadPhotoModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Upload Photo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add New Crop Modal */}
            {showAddCropModal && (
                <div className="modal-overlay">
                    <div className="modal-content card animate-fade-in">
                        <div className="modal-header">
                            <h3 className="modal-title">{t('newCrop')}</h3>
                            <button className="close-btn" onClick={() => setShowAddCropModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddCropSubmit}>
                            <div className="form-grid">
                                <div className="input-group">
                                    <label className="input-label">Crop Name *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g., Wheat, Rice, Tomato"
                                        value={newCropData.name}
                                        onChange={(e) => setNewCropData({ ...newCropData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Variety</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g., Basmati, IR64"
                                        value={newCropData.variety}
                                        onChange={(e) => setNewCropData({ ...newCropData, variety: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Field *</label>
                                    <select
                                        className="input"
                                        value={newCropData.field_id}
                                        onChange={(e) => setNewCropData({ ...newCropData, field_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Field</option>
                                        {fields.map((field) => (
                                            <option key={field.id} value={field.id}>
                                                {field.name} ({field.area} {field.area_unit})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Area (acres)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="input"
                                        placeholder="e.g., 5.5"
                                        value={newCropData.area}
                                        onChange={(e) => setNewCropData({ ...newCropData, area: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Planted Date *</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={newCropData.planted_date}
                                        onChange={(e) => setNewCropData({ ...newCropData, planted_date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Expected Harvest Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={newCropData.expected_harvest_date}
                                        onChange={(e) => setNewCropData({ ...newCropData, expected_harvest_date: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Status</label>
                                    <select
                                        className="input"
                                        value={newCropData.status}
                                        onChange={(e) => setNewCropData({ ...newCropData, status: e.target.value })}
                                    >
                                        <option value="Planted">Planted</option>
                                        <option value="Growing">Growing</option>
                                        <option value="Harvest Ready">Harvest Ready</option>
                                        <option value="Harvested">Harvested</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Health Status</label>
                                    <select
                                        className="input"
                                        value={newCropData.health}
                                        onChange={(e) => setNewCropData({ ...newCropData, health: e.target.value })}
                                    >
                                        <option value="Excellent">Excellent</option>
                                        <option value="Good">Good</option>
                                        <option value="Fair">Fair</option>
                                        <option value="Poor">Poor</option>
                                    </select>
                                </div>
                                <div className="input-group full-width">
                                    <label className="input-label">Notes</label>
                                    <textarea
                                        className="input"
                                        rows="3"
                                        placeholder="Add any additional notes about this crop..."
                                        value={newCropData.notes}
                                        onChange={(e) => setNewCropData({ ...newCropData, notes: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="form-actions" style={{ marginTop: '20px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddCropModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Add Crop
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating AI Chatbot Button */}
            <button
                className="floating-bot-btn"
                onClick={() => setShowChatbot(true)}
                title="Ask Farming Assistant"
            >
                🤖
            </button>

            {/* AI Chatbot Modal */}
            {showChatbot && <FarmingBot onClose={() => setShowChatbot(false)} />}
        </div>
    );
};

export default Dashboard;
