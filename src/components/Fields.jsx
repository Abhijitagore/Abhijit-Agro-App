import { useState, useContext } from 'react';
import '../components/Crops.css'; // Reuse Crops styles
import '../components/Expenses.css'; // Reuse Expenses form styles
import { useFields } from '../context/FieldsContext';
import FieldDetails from './FieldDetails';

const Fields = () => {
    const { fields, addField, updateField, deleteField } = useFields();
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedField, setSelectedField] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        area: '',
        area_unit: 'acres',
        soil_type: '',
        notes: ''
    });

    const soilTypes = ['Loamy', 'Clay', 'Sandy', 'Sandy Loam', 'Silt', 'Peaty', 'Chalky', 'Black Soil', 'Red Soil'];

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('location', formData.location || '');
        formDataToSend.append('area', parseFloat(formData.area));
        formDataToSend.append('area_unit', formData.area_unit);
        formDataToSend.append('soil_type', formData.soil_type || '');
        formDataToSend.append('notes', formData.notes || '');

        if (imageFile) {
            formDataToSend.append('image', imageFile);
        }

        await addField(formDataToSend);

        setFormData({
            name: '',
            location: '',
            area: '',
            area_unit: 'acres',
            soil_type: '',
            notes: ''
        });
        setImageFile(null);
        setShowAddForm(false);
    };

    const handleViewDetails = (field) => {
        setSelectedField(field);
    };

    const handleCloseDetails = () => {
        setSelectedField(null);
    };

    const handleDelete = async (id) => {
        await deleteField(id);
    };

    return (
        <div className="crops-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Fields</h1>
                    <p className="page-subtitle">Manage your farm fields and locations</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    <span>➕</span>
                    Add Field
                </button>
            </div>

            {/* Add Field Form */}
            {showAddForm && (
                <div className="add-form-container animate-fade-in">
                    <div className="card">
                        <h3 className="form-title">Add New Field</h3>
                        <form onSubmit={handleSubmit} className="expense-form">
                            <div className="form-grid">
                                <div className="input-group">
                                    <label className="input-label">Field Name *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g., North Field"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Location</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g., Near River"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Area *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="input"
                                        placeholder="e.g., 5"
                                        value={formData.area}
                                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Unit</label>
                                    <select
                                        className="input"
                                        value={formData.area_unit}
                                        onChange={(e) => setFormData({ ...formData, area_unit: e.target.value })}
                                    >
                                        <option value="acres">Acres</option>
                                        <option value="hectares">Hectares</option>
                                        <option value="sq_meters">Sq Meters</option>
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Soil Type</label>
                                    <select
                                        className="input"
                                        value={formData.soil_type}
                                        onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                                    >
                                        <option value="">Select soil type</option>
                                        {soilTypes.map(soil => (
                                            <option key={soil} value={soil}>{soil}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group full-width">
                                    <label className="input-label">Field Image</label>
                                    <input
                                        type="file"
                                        className="input"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    {imageFile && (
                                        <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                                            Selected: {imageFile.name}
                                        </p>
                                    )}
                                </div>

                                <div className="input-group full-width">
                                    <label className="input-label">Notes</label>
                                    <textarea
                                        className="input"
                                        placeholder="Additional details..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows="2"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save Field
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="crops-grid">
                {fields.map((field) => (
                    <div key={field.id} className="crop-card card">
                        <div className="crop-card-header">
                            <div className="crop-image">
                                {field.image ? (
                                    <img src={field.image} alt={field.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    '🏞️'
                                )}
                            </div>
                            <span className="badge badge-success">Active</span>
                        </div>

                        <h3 className="crop-card-title">{field.name}</h3>
                        <p className="crop-card-variety">{field.area} {field.area_unit}</p>

                        <div className="crop-card-info">
                            <div className="info-item">
                                <span className="info-label">Location</span>
                                <span className="info-value">{field.location || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Soil Type</span>
                                <span className="info-value">{field.soil_type || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="crop-actions">
                            <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleViewDetails(field)}
                                style={{ flex: 1 }}
                            >
                                View Details
                            </button>
                            <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(field.id)}
                                style={{ flex: 1 }}
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedField && (
                <FieldDetails
                    field={selectedField}
                    onClose={handleCloseDetails}
                    onUpdate={updateField}
                    onDelete={deleteField}
                />
            )}
        </div>
    );
};

export default Fields;
