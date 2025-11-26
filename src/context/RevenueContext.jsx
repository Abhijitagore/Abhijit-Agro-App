import { createContext, useState, useContext, useEffect } from 'react';

const RevenueContext = createContext();

export const useRevenue = () => useContext(RevenueContext);

export const RevenueProvider = ({ children }) => {
    const [revenue, setRevenue] = useState([]);

    // Base API URL (relative to frontend dev server)
    const API_BASE = '/api/revenue';

    // Helper function to get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
    };

    // Fetch all revenue on mount
    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return; // Don't fetch if no token

                const res = await fetch(API_BASE, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    credentials: 'include',
                });

                // Handle token expiration
                if (res.status === 403) {
                    console.error('Token expired or invalid. Please log in again.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    // Don't reload - let the user state update trigger re-render
                    return;
                }

                if (!res.ok) throw new Error('Failed to fetch revenue');
                const data = await res.json();
                setRevenue(data.revenue || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchRevenue();
    }, []);

    const addRevenue = async (revenueItem) => {
        try {
            // Map UI fields to backend payload
            const payload = {
                source: revenueItem.source,
                product: revenueItem.product,
                quantity: revenueItem.quantity,
                amount: Number(revenueItem.amount),
                date: revenueItem.date,
                crop_id: revenueItem.crop || revenueItem.crop_id,
                payment_received: revenueItem.paymentReceived || false,
            };

            const res = await fetch(API_BASE, {
                method: 'POST',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to add revenue');
            const data = await res.json();
            setRevenue(prev => [data.revenue, ...prev]);
        } catch (err) {
            console.error(err);
        }
    };

    const updateRevenue = async (id, updatedFields) => {
        try {
            // Map UI fields to backend payload
            const payload = {
                source: updatedFields.source,
                product: updatedFields.product,
                quantity: updatedFields.quantity,
                amount: Number(updatedFields.amount),
                date: updatedFields.date,
                crop_id: updatedFields.crop || updatedFields.crop_id,
                payment_received: updatedFields.paymentReceived,
            };
            const res = await fetch(`${API_BASE}/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to update revenue');
            const data = await res.json();
            setRevenue(prev => prev.map(rev => (rev.id === id ? data.revenue : rev)));
        } catch (err) {
            console.error(err);
        }
    };

    const deleteRevenue = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to delete revenue');
            await res.json();
            setRevenue(prev => prev.filter(rev => rev.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <RevenueContext.Provider value={{ revenue, addRevenue, updateRevenue, deleteRevenue }}>
            {children}
        </RevenueContext.Provider>
    );
};
