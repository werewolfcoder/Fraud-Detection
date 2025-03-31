import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setTransactions(response.data.transactions || []);
        setError("");
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(
          err.response?.data?.error ||
          err.message ||
          "Failed to load transactions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)] text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto bg-white rounded-2xl shadow-lg mt-6">
        <h2 className="text-3xl font-bold text-gray-700 mb-6 text-center">
          Transaction History
        </h2>

        <div className="mb-6 text-center">
          <p className="text-xl font-semibold text-gray-600">
            Current Balance: ₹{parseFloat(user?.account_balance || 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg shadow">
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No transactions found</p>
          ) : (
            transactions.map((txn) => (
              <div key={txn.id} className="flex flex-col p-4 border-b last:border-none">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-medium">{txn.merchant}</span>
                    <span className="text-sm text-gray-500">{txn.transaction_type}</span>
                  </div>
                  <span className={`font-semibold ${
                    parseFloat(txn.transaction_amount) < 0 ? "text-red-500" : "text-green-500"
                  }`}>
                    ₹{Math.abs(parseFloat(txn.transaction_amount))}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-500 flex justify-between">
                  <div>
                    <div>Location: {txn.transaction_location}</div>
                  </div>
                  <div className="text-right">
                    <div>Balance: ₹{txn.account_balance}</div>
                    <div>
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
