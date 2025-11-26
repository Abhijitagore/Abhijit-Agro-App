import { useMemo } from 'react';
import './Analytics.css';
import { useExpenses } from '../context/ExpensesContext';
import { useRevenue } from '../context/RevenueContext';
import { useCrops } from '../context/CropsContext';

const Analytics = () => {
    const { expenses } = useExpenses();
    const { revenue } = useRevenue();
    const { crops } = useCrops();

    // Calculate monthly data for the last 6 months
    const monthlyData = useMemo(() => {
        const months = [];
        const currentDate = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthName = date.toLocaleString('default', { month: 'short' });
            const year = date.getFullYear();
            const month = date.getMonth();

            const monthRevenue = revenue
                .filter(r => {
                    const rDate = new Date(r.date);
                    return rDate.getMonth() === month && rDate.getFullYear() === year;
                })
                .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

            const monthExpenses = expenses
                .filter(e => {
                    const eDate = new Date(e.date);
                    return eDate.getMonth() === month && eDate.getFullYear() === year;
                })
                .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

            months.push({
                month: monthName,
                revenue: monthRevenue,
                expenses: monthExpenses,
                profit: monthRevenue - monthExpenses
            });
        }

        return months;
    }, [revenue, expenses]);

    const maxValue = Math.max(
        ...monthlyData.map(d => Math.max(d.revenue, d.expenses)),
        1000 // Minimum to prevent division by zero
    );

    // Calculate crop profitability
    const cropProfitability = useMemo(() => {
        const cropData = {};

        // Group revenue by crop
        revenue.forEach(r => {
            if (r.product) {
                if (!cropData[r.product]) {
                    cropData[r.product] = { revenue: 0, expenses: 0 };
                }
                cropData[r.product].revenue += parseFloat(r.amount || 0);
            }
        });

        // Group expenses by crop/field
        crops.forEach(crop => {
            if (!cropData[crop.name]) {
                cropData[crop.name] = { revenue: 0, expenses: 0 };
            }

            // Find expenses related to this crop
            // In Dashboard.jsx, expense.field actually stores the crop name
            const relatedExpenses = expenses.filter(e =>
                // Direct match if expense was added via dropdown (stores crop name)
                e.field === crop.name ||
                // Fallback: check if description contains crop name
                e.description?.toLowerCase().includes(crop.name.toLowerCase()) ||
                // Fallback: check if expense field matches crop's field name
                e.field === crop.field_name
            );

            cropData[crop.name].expenses += relatedExpenses.reduce(
                (sum, e) => sum + parseFloat(e.amount || 0),
                0
            );
        });

        return Object.keys(cropData)
            .map(cropName => ({
                crop: cropName,
                revenue: cropData[cropName].revenue,
                expenses: cropData[cropName].expenses,
                profit: cropData[cropName].revenue - cropData[cropName].expenses
            }))
            .filter(c => c.revenue > 0 || c.expenses > 0)
            .sort((a, b) => b.profit - a.profit);
    }, [revenue, expenses, crops]);

    // Calculate expense breakdown by category
    const expensesByCategory = useMemo(() => {
        const categories = {};
        expenses.forEach(e => {
            const category = e.category || 'Other';
            if (!categories[category]) {
                categories[category] = 0;
            }
            categories[category] += parseFloat(e.amount || 0);
        });

        return Object.keys(categories)
            .map(category => ({
                category,
                amount: categories[category],
                percentage: 0 // Will calculate after
            }))
            .sort((a, b) => b.amount - a.amount);
    }, [expenses]);

    const totalExpenses = expensesByCategory.reduce((sum, c) => sum + c.amount, 0);
    expensesByCategory.forEach(c => {
        c.percentage = totalExpenses > 0 ? ((c.amount / totalExpenses) * 100).toFixed(1) : 0;
    });

    // Generate intelligent insights
    const insights = useMemo(() => {
        const totalRevenue = revenue.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
        const totalExp = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

        const insights = [];

        // Best performing crop
        if (cropProfitability.length > 0 && cropProfitability[0].revenue > 0) {
            const bestCrop = cropProfitability[0];
            const margin = ((bestCrop.profit / bestCrop.revenue) * 100).toFixed(1);
            insights.push({
                icon: '💡',
                title: 'Best Performing Crop',
                text: `${bestCrop.crop} has the highest profit margin at ${margin}% this season`
            });
        }

        // Revenue trend
        if (monthlyData.length >= 2) {
            const firstMonth = monthlyData[0].revenue;
            const lastMonth = monthlyData[monthlyData.length - 1].revenue;
            if (firstMonth > 0) {
                const growth = (((lastMonth - firstMonth) / firstMonth) * 100).toFixed(1);
                insights.push({
                    icon: growth >= 0 ? '📈' : '📉',
                    title: 'Revenue Trend',
                    text: `Revenue has ${growth >= 0 ? 'increased' : 'decreased'} by ${Math.abs(growth)}% over the last 6 months`
                });
            }
        }

        // Expense alert
        if (expensesByCategory.length > 0) {
            const topExpense = expensesByCategory[0];
            insights.push({
                icon: '⚠️',
                title: 'Top Expense Category',
                text: `${topExpense.category} accounts for ${topExpense.percentage}% of total expenses`
            });
        }

        // Recommendation
        if (cropProfitability.length > 0 && cropProfitability[0].profit > 0) {
            insights.push({
                icon: '🎯',
                title: 'Recommendation',
                text: `Consider increasing ${cropProfitability[0].crop} cultivation area for maximum profitability`
            });
        } else {
            insights.push({
                icon: '🎯',
                title: 'Recommendation',
                text: 'Start tracking revenue by crop to optimize profitability'
            });
        }

        return insights;
    }, [cropProfitability, monthlyData, expensesByCategory, revenue, expenses]);

    return (
        <div className="analytics-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Analytics</h1>
                    <p className="page-subtitle">Analyze your farm performance and trends</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="stats-grid grid grid-3" style={{ marginBottom: '2rem' }}>
                <div className="card stat-card">
                    <div className="stat-icon revenue">💰</div>
                    <div className="stat-info">
                        <div className="stat-label">Total Revenue</div>
                        <div className="stat-value">
                            ₹{revenue.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0).toLocaleString()}
                        </div>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon expense">💳</div>
                    <div className="stat-info">
                        <div className="stat-label">Total Expenses</div>
                        <div className="stat-value">
                            ₹{expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0).toLocaleString()}
                        </div>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon profit">📊</div>
                    <div className="stat-info">
                        <div className="stat-label">Net Profit</div>
                        <div className="stat-value">
                            ₹{(
                                revenue.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0) -
                                expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
                            ).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Trend Chart */}
            <div className="card chart-card">
                <h3 className="chart-title">Revenue vs Expenses (Last 6 Months)</h3>
                <div className="chart-container">
                    <div className="chart">
                        {monthlyData.map((data, index) => (
                            <div key={index} className="chart-bar-group">
                                <div className="chart-bars">
                                    <div
                                        className="chart-bar revenue"
                                        style={{ height: `${(data.revenue / maxValue) * 200}px` }}
                                        title={`Revenue: ₹${data.revenue.toLocaleString()}`}
                                    ></div>
                                    <div
                                        className="chart-bar expense"
                                        style={{ height: `${(data.expenses / maxValue) * 200}px` }}
                                        title={`Expenses: ₹${data.expenses.toLocaleString()}`}
                                    ></div>
                                </div>
                                <div className="chart-label">{data.month}</div>
                            </div>
                        ))}
                    </div>
                    <div className="chart-legend">
                        <div className="legend-item">
                            <div className="legend-color revenue"></div>
                            <span>Revenue</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color expense"></div>
                            <span>Expenses</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Crop Profitability */}
            {cropProfitability.length > 0 && (
                <div className="card">
                    <h3 className="chart-title">Crop Profitability Analysis</h3>
                    <div className="profitability-table">
                        <div className="table-header">
                            <div className="table-cell">Crop</div>
                            <div className="table-cell">Revenue</div>
                            <div className="table-cell">Expenses</div>
                            <div className="table-cell">Profit</div>
                            <div className="table-cell">Margin</div>
                        </div>
                        {cropProfitability.map((crop, index) => {
                            const margin = crop.revenue > 0 ? ((crop.profit / crop.revenue) * 100).toFixed(1) : 0;
                            return (
                                <div key={index} className="table-row">
                                    <div className="table-cell crop-name">{crop.crop}</div>
                                    <div className="table-cell revenue">₹{crop.revenue.toLocaleString()}</div>
                                    <div className="table-cell expense">₹{crop.expenses.toLocaleString()}</div>
                                    <div className="table-cell profit">₹{crop.profit.toLocaleString()}</div>
                                    <div className="table-cell">
                                        <span className={`badge ${crop.profit >= 0 ? 'badge-success' : 'badge-danger'}`}>
                                            {margin}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Expense Breakdown */}
            {expensesByCategory.length > 0 && (
                <div className="card">
                    <h3 className="chart-title">Expense Breakdown by Category</h3>
                    <div className="expense-breakdown">
                        {expensesByCategory.slice(0, 8).map((cat, index) => (
                            <div key={index} className="expense-category-item">
                                <div className="expense-category-header">
                                    <span className="expense-category-name">{cat.category}</span>
                                    <span className="expense-category-amount">₹{cat.amount.toLocaleString()}</span>
                                </div>
                                <div className="expense-category-bar">
                                    <div
                                        className="expense-category-fill"
                                        style={{ width: `${cat.percentage}%` }}
                                    ></div>
                                </div>
                                <div className="expense-category-percentage">{cat.percentage}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Key Insights */}
            <div className="insights-grid grid grid-2">
                {insights.map((insight, index) => (
                    <div key={index} className="card insight-card">
                        <div className="insight-icon">{insight.icon}</div>
                        <h4 className="insight-title">{insight.title}</h4>
                        <p className="insight-text">{insight.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Analytics;
