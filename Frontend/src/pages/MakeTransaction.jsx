import { useContext } from "react";
import { TransactionContext } from "../context/TransactionContext";
import Navbar from "../components/navbar";

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

  const handleTransfer = () => {
    if (transactionType === "Bank Transfer") {
      alert(`Transferred $${amount} to ${recipient} via ${bankBranch}, ${city}, ${state}`);
    } else if (transactionType === "Merchant Payment") {
      alert(`Paid $${amount} to Merchant ID: ${merchantID}`);
    }
    setAmount("");
    setRecipient("");
    setMerchantID("");
    setBankBranch("");
    setState("");
    setCity("");
    setTransactionType("");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto bg-white rounded-2xl shadow-lg mt-6">
        <h2 className="text-3xl font-bold text-gray-700 mb-6 text-center">Make a Transaction</h2>

        <div className="space-y-4">
          {/* Dropdown for Transaction Type */}
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

          {/* Conditional Inputs */}
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

          {/* Common Inputs */}
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

          {/* Submit Button */}
          <button
            onClick={handleTransfer}
            className="w-full p-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
            disabled={!transactionType}
          >
            {transactionType === "Bank Transfer" ? "Transfer Money" : "Pay Merchant"}
          </button>
        </div>
      </div>
    </div>
  );
}
