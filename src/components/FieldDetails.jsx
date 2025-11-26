import { useState, useContext } from 'react';
import { LanguageContext } from '../App';
import './CropDetails.css'; // Reuse styles

const FieldDetails = ({ field, onClose, onUpdate, onDelete }) => {
    const { t } = useContext(LanguageContext);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...field });
    const [imageFile, setImageFile] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (imageFile) {
            const formData = new FormData();
            Object.keys(editData).forEach(key => {
                if (editData[key] !== null && editData[key] !== undefined && key !== 'image') {
                    formData.append(key, editData[key]);
                }
            });
            formData.append('image', imageFile);
            await onUpdate(field.id, formData);
        } else {
            await onUpdate(field.id, editData);
        }

        setIsEditing(false);
        setImageFile(null);
    };

    const handleDelete = async () => {
        await onDelete(field.id);
        onClose();
    };

    return (
        <div className="crop-details-overlay" onClick={onClose}>
            <div className="crop-details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="details-header">
                    <h2 className="details-title">
                        {isEditing ? 'Edit Field' : field.name}
                    </h2>
                    <button className="close-btn" onClick={onClose}>✖</button>
                </div>

                {isEditing ? (
                    <form onSubmit={handleSave} className="edit-form">
                        <div className="form-grid">
                            <div className="input-group">
                                <label className="input-label">Field Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Location</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={editData.location || ''}
                                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Area</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="input"
                                    value={editData.area}
                                    onChange={(e) => setEditData({ ...editData, area: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Unit</label>
                                <select
                                    className="input"
                                    value={editData.area_unit || 'acres'}
                                    onChange={(e) => setEditData({ ...editData, area_unit: e.target.value })}
                                >
                                    <option value="acres">Acres</option>
                                    <option value="hectares">Hectares</option>
                                    <option value="sq_meters">Sq Meters</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Soil Type</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={editData.soil_type || ''}
                                    onChange={(e) => setEditData({ ...editData, soil_type: e.target.value })}
                                />
                            </div>
                            <div className="input-group full-width">
                                <label className="input-label">Update Field Image</label>
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
                                {field.image && !imageFile && (
                                    <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                                        Current image will remain unchanged
                                    </p>
                                )}
                            </div>
                            <div className="input-group full-width">
                                <label className="input-label">Notes</label>
                                <textarea
                                    className="input"
                                    value={editData.notes || ''}
                                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                    rows="3"
                                ></textarea>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Save Changes
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="details-content">
                        {field.image && (
                            <div className="field-image-container" style={{
                                marginBottom: '20px',
                                textAlign: 'center',
                                background: '#f5f5f5',
                                borderRadius: '8px',
                                padding: '16px'
                            }}>
                                <img
                                    src={field.image}
                                    alt={field.name}
                                    className="field-detail-image"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '300px',
                                        borderRadius: '8px',
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>
                        )}

                        <section className="details-section">
                            <h3>Basic Information</h3>
                            <ul className="info-list">
                                <li><strong>Location:</strong> {field.location || 'N/A'}</li>
                                <li><strong>Area:</strong> {field.area} {field.area_unit}</li>
                                <li><strong>Soil Type:</strong> {field.soil_type || 'N/A'}</li>
                                <li><strong>Notes:</strong> {field.notes || 'No notes'}</li>
                            </ul>
                        </section>

                        <div className="crop-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                            <button className="btn btn-primary" onClick={() => setIsEditing(true)} style={{ flex: 1 }}>
                                ✏️ Edit Field
                            </button>
                            <button className="btn btn-danger" onClick={handleDelete} style={{ flex: 1 }}>
                                🗑️ Delete Field
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FieldDetails;
