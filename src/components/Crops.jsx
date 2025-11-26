import { useState, useContext } from 'react';
import './Crops.css';
import './Expenses.css';
import { LanguageContext } from '../App';
import { useCrops } from '../context/CropsContext';
import CropDetails from './CropDetails';
import AddCropForm from './AddCropForm';
import { formatDate } from '../utils/dateUtils';

const Crops = () => {
    const { t } = useContext(LanguageContext);
    const { crops, deleteCrop, addCrop, updateCrop, fetchCropDetails, selectedCrop } = useCrops();
    const [showAddForm, setShowAddForm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const handleDelete = async (id) => {
        await deleteCrop(id);
    };

    const handleViewDetails = async (crop) => {
        await fetchCropDetails(crop.id);
        setShowDetails(true);
    };

    const handleUpdateCrop = async (updatedCrop) => {
        await updateCrop(updatedCrop.id, updatedCrop);
    };

    const handleCloseDetails = () => {
        setShowDetails(false);
    };

    return (
        <div className="crops-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{t('crops')}</h1>
                    <p className="page-subtitle">{t('manageYourCrops')}</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                    <span>➕</span>
                    {t('addCrop')}
                </button>
            </div>

            {/* Add Crop Form */}
            {showAddForm && (
                <AddCropForm
                    onSave={async (data) => {
                        const newCrop = {
                            name: data.name,
                            variety: data.variety,
                            field_id: null, // Placeholder until Fields API is ready
                            area: data.area,
                            planted_date: data.planted,
                            expected_harvest_date: data.expectedHarvest,
                            status: data.status,
                            progress: data.progress,
                            health: data.health,
                            image: data.image,
                            notes: `Field: ${data.field}` // Store field name in notes
                        };
                        await addCrop(newCrop);
                        setShowAddForm(false);
                    }}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            <div className="crops-grid">
                {crops.map((crop) => (
                    <div key={crop.id} className="crop-card card">
                        <div className="crop-card-header">
                            <div className="crop-image">{crop.image}</div>
                            <span className={`badge ${crop.status === 'Harvest Ready' ? 'badge-success' :
                                crop.status === 'Growing' ? 'badge-info' : 'badge-warning'
                                }`}>
                                {crop.status}
                            </span>
                        </div>

                        <h3 className="crop-card-title">{crop.name}</h3>
                        <p className="crop-card-variety">{crop.variety}</p>

                        <div className="crop-card-info">
                            <div className="info-item">
                                <span className="info-label">Field</span>
                                <span className="info-value">{crop.field_name || (crop.notes && crop.notes.startsWith('Field:') ? crop.notes.replace('Field: ', '') : 'N/A')}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Area</span>
                                <span className="info-value">{crop.area}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Planted</span>
                                <span className="info-value">{formatDate(crop.planted_date || crop.planted)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Expected Harvest</span>
                                <span className="info-value">{formatDate(crop.expected_harvest_date || crop.expectedHarvest)}</span>
                            </div>
                        </div>

                        <div className="crop-progress-section">
                            <div className="progress-header">
                                <span className="progress-label">Growth Progress</span>
                                <span className="progress-percent">{crop.progress}%</span>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${crop.progress}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="crop-health">
                            <span className={`health-indicator ${crop.health.toLowerCase()}`}>
                                {crop.health === 'Excellent' ? '🟢' : crop.health === 'Good' ? '🟡' : '🔴'}
                            </span>
                            <span className="health-text">Health: {crop.health}</span>
                        </div>

                        <div className="crop-actions">
                            <button
                                className="btn btn-sm btn-secondary w-full"
                                onClick={() => handleViewDetails(crop)}
                            >
                                View Details
                            </button>
                            <button
                                className="btn btn-sm btn-danger w-full"
                                onClick={() => handleDelete(crop.id)}
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Crop Details Modal */}
            {showDetails && selectedCrop && (
                <CropDetails
                    crop={selectedCrop}
                    onClose={handleCloseDetails}
                    onUpdateCrop={handleUpdateCrop}
                />
            )}
        </div>
    );
};

export default Crops;
