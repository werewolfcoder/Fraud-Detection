import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Send, PlusCircle, User } from "lucide-react";
import Navbar from "../components/navbar";
import axios from "axios";

export function Dashboard() {
  const [balance, setBalance] = useState(0); // Initialize balance as a number
  const [transactions, setTransactions] = useState([]); // Initialize transactions
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(""); // Error state

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        console.log("Fetching dashboard data with token:", token); // Add debug log

        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/dashboard`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        );

        console.log("Dashboard response:", response.data); // Add debug log

        if (!response.data || typeof response.data.account_balance === 'undefined') {
          throw new Error("Invalid response format from server");
        }

        const accountBalance = parseFloat(response.data.account_balance) || 0;
        setBalance(accountBalance);
        setTransactions(response.data.transactions || []);
        setError("");
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err.response?.data?.error || 
          err.message || 
          "Failed to load dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto bg-white rounded-2xl shadow-lg mt-6">
        <h2 className="text-3xl font-bold text-gray-700 mb-6">Dashboard</h2>

        {/* Account Balance Section */}
        <div className="p-6 bg-blue-500 text-white rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-xl">Current Balance</h3>
            <p className="text-3xl font-bold">₹{balance.toFixed(2)}</p>
          </div>
          <Link
            to="/transactions"
            className="p-2 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-200"
          >
            View Transactions
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          <Link
            to="/accounts"
            className="p-6 bg-green-500 text-white rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-green-600 transition"
          >
            <CreditCard size={32} />
            <span>Accounts</span>
          </Link>
          <Link
            to="/transfer"
            className="p-6 bg-yellow-500 text-white rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-yellow-600 transition"
          >
            <Send size={32} />
            <span>Send Money</span>
          </Link>
          <Link
            to="/deposit"
            className="p-6 bg-blue-700 text-white rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-blue-800 transition"
          >
            <PlusCircle size={32} />
            <span>Deposit Money</span>
          </Link>
          <Link
            to="/profile"
            className="p-6 bg-purple-500 text-white rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-purple-600 transition"
          >
            <User size={32} />
            <span>Profile</span>
          </Link>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-700 mb-4">Recent Transactions</h3>
          <div className="bg-gray-50 rounded-lg shadow divide-y">
            {transactions.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No recent transactions</p>
            ) : (
              transactions.map((txn) => (
                <div key={txn.id} className="p-4 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-medium">{txn.merchant}</span>
                    <span className="text-sm text-gray-500">{txn.transaction_type}</span>
                    <span className="text-xs text-gray-400">{txn.transaction_location}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold ${
                      parseFloat(txn.transaction_amount) < 0 ? "text-red-500" : "text-green-500"
                    }`}>
                      ₹{Math.abs(parseFloat(txn.transaction_amount))}
                    </span>
                    <div className="text-xs text-gray-400">
                      {new Date(txn.transaction_time).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;