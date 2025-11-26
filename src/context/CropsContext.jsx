import { createContext, useState, useContext, useEffect } from 'react';

const CropsContext = createContext();

export const useCrops = () => useContext(CropsContext);

export const CropsProvider = ({ children }) => {
    const [crops, setCrops] = useState([]);
    const [selectedCrop, setSelectedCrop] = useState(null);

    const API_BASE = '/api/crops';

    // Helper function to get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
    };

    // Fetch all crops
    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return; // Don't fetch if no token

                const res = await fetch(API_BASE, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    credentials: 'include',
                });
                if (!res.ok) throw new Error('Failed to fetch crops');
                const data = await res.json();
                setCrops(data.crops || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCrops();
    }, []);

    // Fetch single crop with all details
    const fetchCropDetails = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to fetch crop details');
            const data = await res.json();
            setSelectedCrop(data.crop);
            return data.crop;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    // Add new crop
    const addCrop = async (cropData) => {
        try {
            const res = await fetch(API_BASE, {
                method: 'POST',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(cropData),
            });
            if (!res.ok) throw new Error('Failed to add crop');
            const data = await res.json();
            setCrops(prev => [data.crop, ...prev]);
            return data.crop;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    // Update crop
    const updateCrop = async (id, updates) => {
        try {
            const res = await fetch(`${API_BASE}/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(updates),
            });
            if (!res.ok) throw new Error('Failed to update crop');
            const data = await res.json();
            setCrops(prev => prev.map(crop => crop.id === id ? data.crop : crop));
            if (selectedCrop?.id === id) {
                setSelectedCrop(data.crop);
            }
            return data.crop;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    // Delete crop
    const deleteCrop = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to delete crop');
            setCrops(prev => prev.filter(crop => crop.id !== id));
            if (selectedCrop?.id === id) {
                setSelectedCrop(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // ========== SCHEDULE OPERATIONS ==========

    const addSchedule = async (cropId, scheduleData) => {
        try {
            const res = await fetch(`${API_BASE}/${cropId}/schedules`, {
                method: 'POST',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(scheduleData),
            });
            if (!res.ok) throw new Error('Failed to add schedule');
            const data = await res.json();
            // Refresh crop details
            await fetchCropDetails(cropId);
            return data.schedule;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    const updateSchedule = async (scheduleId, done) => {
        try {
            const res = await fetch(`${API_BASE}/schedules/${scheduleId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify({ done }),
            });
            if (!res.ok) throw new Error('Failed to update schedule');
            const data = await res.json();
            // Refresh selected crop if it's loaded
            if (selectedCrop) {
                await fetchCropDetails(selectedCrop.id);
            }
            return data.schedule;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    const deleteSchedule = async (scheduleId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/schedules/${scheduleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to delete schedule');
            // Refresh selected crop if it's loaded
            if (selectedCrop) {
                await fetchCropDetails(selectedCrop.id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // ========== FERTILIZER OPERATIONS ==========

    const addFertilizer = async (cropId, fertilizerData) => {
        try {
            const res = await fetch(`${API_BASE}/${cropId}/fertilizers`, {
                method: 'POST',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(fertilizerData),
            });
            if (!res.ok) throw new Error('Failed to add fertilizer');
            const data = await res.json();
            await fetchCropDetails(cropId);
            return data.fertilizer;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    const deleteFertilizer = async (fertilizerId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/fertilizers/${fertilizerId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to delete fertilizer');
            if (selectedCrop) {
                await fetchCropDetails(selectedCrop.id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // ========== PESTICIDE OPERATIONS ==========

    const addPesticide = async (cropId, pesticideData) => {
        try {
            const res = await fetch(`${API_BASE}/${cropId}/pesticides`, {
                method: 'POST',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(pesticideData),
            });
            if (!res.ok) throw new Error('Failed to add pesticide');
            const data = await res.json();
            await fetchCropDetails(cropId);
            return data.pesticide;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    const deletePesticide = async (pesticideId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/pesticides/${pesticideId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to delete pesticide');
            if (selectedCrop) {
                await fetchCropDetails(selectedCrop.id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // ========== SPRAY OPERATIONS ==========

    const addSpray = async (cropId, sprayData) => {
        try {
            const res = await fetch(`${API_BASE}/${cropId}/sprays`, {
                method: 'POST',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(sprayData),
            });
            if (!res.ok) throw new Error('Failed to add spray');
            const data = await res.json();
            await fetchCropDetails(cropId);
            return data.spray;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    const deleteSpray = async (sprayId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/sprays/${sprayId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to delete spray');
            if (selectedCrop) {
                await fetchCropDetails(selectedCrop.id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <CropsContext.Provider value={{
            crops,
            selectedCrop,
            fetchCropDetails,
            addCrop,
            updateCrop,
            deleteCrop,
            addSchedule,
            updateSchedule,
            deleteSchedule,
            addFertilizer,
            deleteFertilizer,
            addPesticide,
            deletePesticide,
            addSpray,
            deleteSpray,
        }}>
            {children}
        </CropsContext.Provider>
    );
};
