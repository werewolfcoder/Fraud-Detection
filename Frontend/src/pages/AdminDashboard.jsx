import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function AdminDashboard() {
    const { logout } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/api/admin/stats`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setStats(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading analytics...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!stats) return null;

    // Chart configurations
    const dailyTransactionsConfig = {
        data: {
            labels: stats.dailyStats.map(d => d.date),
            datasets: [{
                label: 'Transaction Count',
                data: stats.dailyStats.map(d => d.count),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: 'Daily Transaction Volume' }
            }
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-700">Admin Dashboard</h1>
                <button
                    onClick={logout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                    Logout
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <SummaryCard
                    title="Total Transactions"
                    value={stats.summary.totalTransactions}
                    color="blue"
                />
                <SummaryCard
                    title="Total Users"
                    value={stats.summary.totalUsers}
                    color="green"
                />
                <SummaryCard
                    title="Fraud Detected"
                    value={stats.summary.totalFraudulent}
                    color="red"
                />
                <SummaryCard
                    title="Total Volume"
                    value={`₹${stats.summary.totalVolume.toFixed(2)}`}
                    color="purple"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Daily Transactions Chart */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <Line {...dailyTransactionsConfig} />
                </div>

                {/* Category Distribution */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <Pie data={{
                        labels: stats.categoryStats.map(c => c.merchant_category),
                        datasets: [{
                            data: stats.categoryStats.map(c => c.count),
                            backgroundColor: [
                                '#FF6384',
                                '#36A2EB',
                                '#FFCE56',
                                '#4BC0C0',
                                '#9966FF'
                            ]
                        }]
                    }} />
                </div>

                {/* Hourly Volume */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <Bar data={{
                        labels: stats.volumeStats.map(v => `${v.hour}:00`),
                        datasets: [{
                            label: 'Transactions per Hour',
                            data: stats.volumeStats.map(v => v.count),
                            backgroundColor: 'rgba(54, 162, 235, 0.5)'
                        }]
                    }} />
                </div>

                {/* Location Analysis */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <Bar data={{
                        labels: stats.locationStats.map(l => l.transaction_location),
                        datasets: [{
                            label: 'Transaction Count',
                            data: stats.locationStats.map(l => l.count),
                            backgroundColor: 'rgba(153, 102, 255, 0.5)'
                        }]
                    }} />
                </div>
            </div>

            {/* User Patterns Table */}
            <div className="mt-6 bg-white rounded-lg shadow p-4">
                <h3 className="text-xl font-bold mb-4">Top Users by Transaction Volume</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Username</th>
                                <th className="px-4 py-2">Transaction Count</th>
                                <th className="px-4 py-2">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.userStats.map(user => (
                                <tr key={user.id}>
                                    <td className="px-4 py-2">{user.username}</td>
                                    <td className="px-4 py-2">{user.transaction_count}</td>
                                    <td className="px-4 py-2">₹{parseFloat(user.total_amount).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const SummaryCard = ({ title, value, color }) => (
    <div className={`bg-${color}-100 p-4 rounded-lg shadow`}>
        <h3 className={`text-${color}-800 text-lg font-semibold`}>{title}</h3>
        <p className={`text-${color}-600 text-2xl font-bold`}>{value}</p>
    </div>
);