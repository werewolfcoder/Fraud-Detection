import { useContext, useState } from "react";
import { TransactionContext } from "../context/TransactionContext";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function MakeTransaction() {
  const {
    transactionType,
    setTransactionType,
    amount,
    setAmount,
    recipient,
    setRecipient,
    merchantID,
    setMerchantID,
    bankBranch,
    setBankBranch,
    state,
    setState,
    city,
    setCity,
  } = useContext(TransactionContext);

  const { user, setUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    if (!transactionType) {
      setError("Please select a transaction type");
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return false;
    }
    if (parseFloat(amount) > parseFloat(user?.account_balance || 0)) {
      setError("Insufficient balance");
      return false;
    }
    if (!city) {
      setError("City is required");
      return false;
    }
    if (!state) {
      setError("State is required");
      return false;
    }
    if (transactionType === "Bank Transfer") {
      if (!recipient) {
        setError("Recipient account number is required");
        return false;
      }
    }
    if (transactionType === "Merchant Payment") {
      if (!merchantID) {
        setError("Merchant ID is required");
        return false;
      }
    }
    return true;
  };

  const handleTransfer = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const transactionData = {
        amount: parseFloat(amount),
        transactionType,
        state: state.trim(),
        city: city.trim(),
        bankBranch: bankBranch.trim() || "Unknown Branch",
        ...(transactionType === "Bank Transfer" && { recipient: recipient.trim() }),
        ...(transactionType === "Merchant Payment" && { merchantID: merchantID.trim() }),
      };

      console.log("Sending transaction data:", transactionData);

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/transaction`,
        transactionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        setUser((prev) => ({
          ...prev,
          account_balance: response.data.newBalance,
        }));

        alert("Transaction successful!");
        setAmount("");
        setRecipient("");
        setMerchantID("");
        setBankBranch("");
        setState("");
        setCity("");
        setTransactionType("");
        navigate("/transactions");
      }
    } catch (error) {
      console.error("Transaction error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      setError(
        error.response?.data?.error ||
        error.response?.data?.details?.join(", ") ||
        error.message ||
        "Transaction failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto bg-white rounded-2xl shadow-lg mt-6">
        <h2 className="text-3xl font-bold text-gray-700 mb-6 text-center">
          Make a Transaction
        </h2>
        
        <div className="mb-6 text-center">
          <p className="text-xl font-semibold text-gray-600">
            Current Balance: ₹{parseFloat(user?.account_balance || 0).toFixed(2)}
          </p>
        </div>

        <div className="space-y-4">
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          >
            <option value="" disabled>
              Select Transaction Type
            </option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Merchant Payment">Merchant Payment</option>
          </select>

          {transactionType === "Bank Transfer" && (
            <input
              type="text"
              placeholder="Recipient Account Number"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            />
          )}
          {transactionType === "Merchant Payment" && (
            <input
              type="text"
              placeholder="Merchant ID"
              value={merchantID}
              onChange={(e) => setMerchantID(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            />
          )}

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Bank Branch"
            value={bankBranch}
            onChange={(e) => setBankBranch(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />

          {error && <p className="text-red-600 text-center">{error}</p>}

          <button
            onClick={handleTransfer}
            className="w-full p-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
            disabled={loading || !transactionType}
          >
            {loading
              ? "Processing..."
              : transactionType === "Bank Transfer"
              ? "Transfer Money"
              : "Pay Merchant"}
          </button>
        </div>
      </div>
    </div>
  );
}