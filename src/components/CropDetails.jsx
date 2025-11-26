import { useState, useContext } from 'react';
import './CropDetails.css';
import { LanguageContext } from '../App';
import { useCrops } from '../context/CropsContext';

const CropDetails = ({
    crop,
    onClose,
}) => {
    const { t } = useContext(LanguageContext);
    const {
        addSchedule,
        updateSchedule,
        deleteSchedule,
        addFertilizer,
        deleteFertilizer,
        addPesticide,
        deletePesticide,
        addSpray,
        deleteSpray
    } = useCrops();

    // ---------- Schedule ----------
    const [newSchedule, setNewSchedule] = useState({ date: '', task: '' });

    const handleAddSchedule = async (e) => {
        e.preventDefault();
        if (!newSchedule.date || !newSchedule.task) return;
        await addSchedule(crop.id, newSchedule);
        setNewSchedule({ date: '', task: '' });
    };

    const handleToggleSchedule = async (id, currentDone) => {
        await updateSchedule(id, !currentDone);
    };

    const handleDeleteSchedule = async (id) => {
        if (window.confirm('Delete this schedule?')) {
            await deleteSchedule(id);
        }
    };

    // ---------- Fertilizer ----------
    const [newFert, setNewFert] = useState({ date: '', type: '', quantity: '' });

    const handleAddFertilizer = async (e) => {
        e.preventDefault();
        if (!newFert.date || !newFert.type || !newFert.quantity) return;
        await addFertilizer(crop.id, newFert);
        setNewFert({ date: '', type: '', quantity: '' });
    };

    const handleDeleteFertilizer = async (id) => {
        if (window.confirm('Delete this fertilizer record?')) {
            await deleteFertilizer(id);
        }
    };

    // ---------- Pesticide ----------
    const [newPest, setNewPest] = useState({ date: '', type: '', quantity: '' });

    const handleAddPesticide = async (e) => {
        e.preventDefault();
        if (!newPest.date || !newPest.type || !newPest.quantity) return;
        await addPesticide(crop.id, newPest);
        setNewPest({ date: '', type: '', quantity: '' });
    };

    const handleDeletePesticide = async (id) => {
        if (window.confirm('Delete this pesticide record?')) {
            await deletePesticide(id);
        }
    };

    // ---------- Spray ----------
    const [newSpray, setNewSpray] = useState({ date: '', time: '', name: '', quantity: '' });

    const handleAddSpray = async (e) => {
        e.preventDefault();
        if (!newSpray.date || !newSpray.name || !newSpray.quantity) return;
        await addSpray(crop.id, newSpray);
        setNewSpray({ date: '', time: '', name: '', quantity: '' });
    };

    const handleDeleteSpray = async (id) => {
        if (window.confirm('Delete this spray record?')) {
            await deleteSpray(id);
        }
    };

    return (
        <div className="crop-details-overlay" onClick={onClose}>
            <div className="crop-details-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="details-header">
                    <h2 className="details-title">
                        {crop.name} – {t('details')}
                    </h2>
                    <button className="close-btn" onClick={onClose}>✖</button>
                </div>

                {/* Basic Info */}
                <section className="details-section">
                    <h3>{t('basicInfo')}</h3>
                    <ul className="info-list">
                        <li><strong>{t('field')}:</strong> {crop.field_name || crop.field}</li>
                        <li><strong>{t('variety')}:</strong> {crop.variety}</li>
                        <li><strong>{t('area')}:</strong> {crop.area}</li>
                        <li><strong>{t('plantedDate')}:</strong> {crop.planted_date || crop.planted}</li>
                        <li><strong>{t('expectedHarvest')}:</strong> {crop.expected_harvest_date || crop.expectedHarvest}</li>
                        <li><strong>{t('status')}:</strong> {crop.status}</li>
                        <li><strong>{t('progress')}:</strong> {crop.progress}%</li>
                        <li><strong>{t('health')}:</strong> {crop.health}</li>
                    </ul>
                </section>

                {/* Schedule */}
                <section className="details-section">
                    <h3>{t('schedule')}</h3>
                    <form className="add-form" onSubmit={handleAddSchedule}>
                        <input
                            type="date"
                            value={newSchedule.date}
                            onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            value={newSchedule.task}
                            onChange={(e) => setNewSchedule({ ...newSchedule, task: e.target.value })}
                            placeholder={t('task')}
                            required
                        />
                        <button type="submit" className="btn btn-primary">{t('add')}</button>
                    </form>
                    <ul className="list">
                        {(crop.schedule || []).map((s) => (
                            <li key={s.id} className="list-item">
                                <label className="schedule-item">
                                    <input
                                        type="checkbox"
                                        checked={s.done}
                                        onChange={() => handleToggleSchedule(s.id, s.done)}
                                    />
                                    <span className={s.done ? 'done' : ''}>{s.date} – {s.task}</span>
                                </label>
                                <button className="delete-mini" onClick={() => handleDeleteSchedule(s.id)}>🗑️</button>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Fertilizer */}
                <section className="details-section">
                    <h3>{t('fertilizer')}</h3>
                    <form className="add-form" onSubmit={handleAddFertilizer}>
                        <input
                            type="date"
                            value={newFert.date}
                            onChange={(e) => setNewFert({ ...newFert, date: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            value={newFert.type}
                            onChange={(e) => setNewFert({ ...newFert, type: e.target.value })}
                            placeholder={t('type')}
                            required
                        />
                        <input
                            type="text"
                            value={newFert.quantity}
                            onChange={(e) => setNewFert({ ...newFert, quantity: e.target.value })}
                            placeholder={t('quantity')}
                            required
                        />
                        <button type="submit" className="btn btn-primary">{t('add')}</button>
                    </form>
                    <ul className="list">
                        {(crop.fertilizers || []).map((f) => (
                            <li key={f.id} className="list-item">
                                {f.date} – {f.type} – {f.quantity}
                                <button className="delete-mini" onClick={() => handleDeleteFertilizer(f.id)}>🗑️</button>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Pesticide */}
                <section className="details-section">
                    <h3>{t('pesticide')}</h3>
                    <form className="add-form" onSubmit={handleAddPesticide}>
                        <input
                            type="date"
                            value={newPest.date}
                            onChange={(e) => setNewPest({ ...newPest, date: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            value={newPest.type}
                            onChange={(e) => setNewPest({ ...newPest, type: e.target.value })}
                            placeholder={t('type')}
                            required
                        />
                        <input
                            type="text"
                            value={newPest.quantity}
                            onChange={(e) => setNewPest({ ...newPest, quantity: e.target.value })}
                            placeholder={t('quantity')}
                            required
                        />
                        <button type="submit" className="btn btn-primary">{t('add')}</button>
                    </form>
                    <ul className="list">
                        {(crop.pesticides || []).map((p) => (
                            <li key={p.id} className="list-item">
                                {p.date} – {p.type} – {p.quantity}
                                <button className="delete-mini" onClick={() => handleDeletePesticide(p.id)}>🗑️</button>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Spray */}
                <section className="details-section">
                    <h3>{t('spray')}</h3>
                    <form className="add-form" onSubmit={handleAddSpray}>
                        <input
                            type="date"
                            value={newSpray.date}
                            onChange={(e) => setNewSpray({ ...newSpray, date: e.target.value })}
                            required
                        />
                        <input
                            type="time"
                            value={newSpray.time}
                            onChange={(e) => setNewSpray({ ...newSpray, time: e.target.value })}
                        />
                        <input
                            type="text"
                            value={newSpray.name}
                            onChange={(e) => setNewSpray({ ...newSpray, name: e.target.value })}
                            placeholder={t('name')}
                            required
                        />
                        <input
                            type="text"
                            value={newSpray.quantity}
                            onChange={(e) => setNewSpray({ ...newSpray, quantity: e.target.value })}
                            placeholder={t('quantity')}
                            required
                        />
                        <button type="submit" className="btn btn-primary">{t('add')}</button>
                    </form>
                    <ul className="list">
                        {(crop.sprays || []).map((s) => (
                            <li key={s.id} className="list-item">
                                {s.date}{s.time && ` @ ${s.time}`} – {s.name} – {s.quantity}
                                <button className="delete-mini" onClick={() => handleDeleteSpray(s.id)}>🗑️</button>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default CropDetails;
