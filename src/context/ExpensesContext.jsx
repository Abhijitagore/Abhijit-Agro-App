import { createContext, useState, useContext, useEffect } from 'react';

const ExpensesContext = createContext();

export const useExpenses = () => useContext(ExpensesContext);

export const ExpensesProvider = ({ children }) => {
    const [expenses, setExpenses] = useState([]);

    // Base API URL (relative to frontend dev server)
    const API_BASE = '/api/expenses';

    // Helper function to get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
    };

    // Fetch all expenses on mount
    useEffect(() => {
        const fetchExpenses = async () => {
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

                if (!res.ok) throw new Error('Failed to fetch expenses');
                const data = await res.json();
                setExpenses(data.expenses || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchExpenses();
    }, []);

    const addExpense = async (expense) => {
        try {
            // Map UI fields to backend payload
            const payload = {
                category: expense.category,
                description: expense.description,
                amount: Number(expense.amount),
                date: expense.date,
                // UI uses `field`; backend expects `crop_id`
                crop_id: expense.field,
                // UI uses `paymentMethod`; backend expects `payment_method`
                payment_method: expense.paymentMethod,
            };

            const res = await fetch(API_BASE, {
                method: 'POST',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to add expense');
            const data = await res.json();
            setExpenses(prev => [data.expense, ...prev]);
        } catch (err) {
            console.error(err);
        }
    };

    const updateExpense = async (id, updatedFields) => {
        try {
            // Map UI fields to backend payload
            const payload = {
                category: updatedFields.category,
                description: updatedFields.description,
                amount: Number(updatedFields.amount),
                date: updatedFields.date,
                // UI provides a field name, but backend expects a crop_id (FK). Set to null if not an ID.
                crop_id: updatedFields.field, // Assuming updatedFields.field is the crop_id
                // UI uses `paymentMethod`; backend expects `payment_method`
                payment_method: updatedFields.paymentMethod,
            };
            const res = await fetch(`${API_BASE}/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to update expense');
            const data = await res.json();
            setExpenses(prev => prev.map(exp => (exp.id === id ? data.expense : exp)));
        } catch (err) {
            console.error(err);
        }
    };

    const deleteExpense = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to delete expense');
            await res.json();
            setExpenses(prev => prev.filter(exp => exp.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <ExpensesContext.Provider value={{ expenses, addExpense, updateExpense, deleteExpense }}>
            {children}
        </ExpensesContext.Provider>
    );
};
