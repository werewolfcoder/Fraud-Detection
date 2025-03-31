import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/navbar";
import axios from "axios";

export default function DepositMoney() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, setUser } = useContext(AuthContext);

  const handleDeposit = async () => {
    try {
      if (!amount || parseFloat(amount) <= 0) {
        setError("Please enter a valid amount");
        return;
      }

      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/deposit`,
        { amount: parseFloat(amount) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        setUser(prev => ({
          ...prev,
          account_balance: response.data.newBalance
        }));
        alert("Money deposited successfully!");
        setAmount("");
      }
    } catch (error) {
      console.error("Deposit error:", error);
      setError(
        error.response?.data?.error ||
        error.message ||
        "Failed to deposit money. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto bg-white rounded-2xl shadow-lg mt-6">
        <h2 className="text-3xl font-bold text-gray-700 mb-6 text-center">Deposit Money</h2>

        <div className="mb-6 text-center">
          <p className="text-xl font-semibold text-gray-600">
            Current Balance: ₹{parseFloat(user?.account_balance || 0).toFixed(2)}
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="number"
            placeholder="Amount to Deposit"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border rounded-lg"
            min="0"
            required
          />
          {error && <p className="text-red-600 text-center">{error}</p>}
          <button 
            onClick={handleDeposit} 
            className="w-full p-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Processing..." : "Deposit Money"}
          </button>
        </div>
      </div>
    </div>
  );
}
