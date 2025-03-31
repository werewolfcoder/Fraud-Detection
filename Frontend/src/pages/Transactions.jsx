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
            <p className="text-center text-gray-500 py-4">
              No transactions found
            </p>
          ) : (
            transactions.map((txn) => (
              <div
                key={txn.id}
                className="flex justify-between items-center py-3 px-4 border-b last:border-none hover:bg-gray-100"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{txn.merchant}</span>
                  <span className="text-sm text-gray-500">{txn.location}</span>
                </div>
                <span
                  className={`font-semibold ${
                    txn.amount < 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  ₹{Math.abs(parseFloat(txn.amount)).toFixed(2)}
                </span>
                <span className="text-gray-500">
                  {new Date(txn.transaction_date).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
