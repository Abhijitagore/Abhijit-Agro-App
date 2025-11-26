import { createContext, useState, useContext, useEffect } from 'react';

const FieldsContext = createContext();

export const useFields = () => useContext(FieldsContext);

export const FieldsProvider = ({ children }) => {
    const [fields, setFields] = useState([]);
    const [selectedField, setSelectedField] = useState(null);

    const API_BASE = '/api/fields';

    // Helper function to get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
    };

    // Fetch all fields
    useEffect(() => {
        const fetchFields = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await fetch(API_BASE, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    credentials: 'include',
                });
                if (!res.ok) throw new Error('Failed to fetch fields');
                const data = await res.json();
                setFields(data.fields || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchFields();
    }, []);

    // Fetch single field details
    const fetchFieldDetails = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to fetch field details');
            const data = await res.json();
            setSelectedField(data.field);
            return data.field;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    // Add new field
    const addField = async (fieldData) => {
        try {
            const isFormData = fieldData instanceof FormData;
            const headers = getAuthHeaders();
            if (isFormData) {
                delete headers['Content-Type']; // Let browser set boundary
            }

            const res = await fetch(API_BASE, {
                method: 'POST',
                headers: headers,
                credentials: 'include',
                body: isFormData ? fieldData : JSON.stringify(fieldData),
            });
            if (!res.ok) throw new Error('Failed to add field');
            const data = await res.json();
            setFields(prev => [data.field, ...prev]);
            return data.field;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    // Update field
    const updateField = async (id, updates) => {
        try {
            const isFormData = updates instanceof FormData;
            const headers = getAuthHeaders();
            if (isFormData) {
                delete headers['Content-Type']; // Let browser set boundary
            }

            const res = await fetch(`${API_BASE}/${id}`, {
                method: 'PUT',
                headers: headers,
                credentials: 'include',
                body: isFormData ? updates : JSON.stringify(updates),
            });
            if (!res.ok) throw new Error('Failed to update field');
            const data = await res.json();
            setFields(prev => prev.map(field => field.id === id ? data.field : field));
            if (selectedField?.id === id) {
                setSelectedField(data.field);
            }
            return data.field;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    // Delete field
    const deleteField = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to delete field');
            }

            setFields(prev => prev.filter(field => field.id !== id));
            if (selectedField?.id === id) {
                setSelectedField(null);
            }
            return true;
        } catch (err) {
            console.error(err);
            alert(err.message); // Show error to user (e.g., if field has crops)
            return false;
        }
    };

    return (
        <FieldsContext.Provider value={{
            fields,
            selectedField,
            fetchFieldDetails,
            addField,
            updateField,
            deleteField,
        }}>
            {children}
        </FieldsContext.Provider>
    );
};
