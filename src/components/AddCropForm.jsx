import { useState, useContext } from 'react';
import { LanguageContext } from '../App';
import './Expenses.css'; // Reusing styles for now

const AddCropForm = ({ onSave, onCancel }) => {
    const { t } = useContext(LanguageContext);

    const [formData, setFormData] = useState({
        name: '',
        field: '',
        variety: '',
        area: '',
        planted: '',
        expectedHarvest: '',
        status: 'Planted',
        progress: 0,
        health: 'Good',
        image: '🌾'
    });

    const cropTypes = ['Wheat', 'Rice', 'Corn', 'Soybeans', 'Cotton', 'Barley', 'Sugarcane', 'Other'];
    const fields = ['North Field', 'East Field', 'West Field', 'South Field'];
    const statuses = ['Planted', 'Growing', 'Harvest Ready', 'Harvested'];
    const healthOptions = ['Excellent', 'Good', 'Fair', 'Poor'];
    const cropIcons = ['🌾', '🌽', '🌱', '🌿', '🥬', '🥕', '🍅', '🥔'];

    const handleSubmit = (e) => {
        e.preventDefault();
        const newCrop = {
            ...formData,
            progress: parseInt(formData.progress),
            area: formData.area
        };
        onSave(newCrop);
    };

    return (
        <div className="add-form-container animate-fade-in">
            <div className="card">
                <h3 className="form-title">{t('addCrop') || 'Add New Crop'}</h3>
                <form onSubmit={handleSubmit} className="expense-form">
                    <div className="form-grid">
                        <div className="input-group">
                            <label className="input-label">Crop Name *</label>
                            <select
                                className="input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            >
                                <option value="">Select crop</option>
                                {cropTypes.map(crop => (
                                    <option key={crop} value={crop}>{crop}</option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Variety *</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., HD-2967, Basmati"
                                value={formData.variety}
                                onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Field *</label>
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
                            <label className="input-label">Area *</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., 5 acres"
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Planted Date *</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.planted}
                                onChange={(e) => setFormData({ ...formData, planted: e.target.value })}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Expected Harvest *</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.expectedHarvest}
                                onChange={(e) => setFormData({ ...formData, expectedHarvest: e.target.value })}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Status</label>
                            <select
                                className="input"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                {statuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Health</label>
                            <select
                                className="input"
                                value={formData.health}
                                onChange={(e) => setFormData({ ...formData, health: e.target.value })}
                            >
                                {healthOptions.map(health => (
                                    <option key={health} value={health}>{health}</option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Progress (%)</label>
                            <input
                                type="number"
                                className="input"
                                min="0"
                                max="100"
                                placeholder="0-100"
                                value={formData.progress}
                                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Icon</label>
                            <select
                                className="input"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            >
                                {cropIcons.map(icon => (
                                    <option key={icon} value={icon}>{icon} {icon}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Save Crop
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCropForm;
