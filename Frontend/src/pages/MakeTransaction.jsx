import { useState } from "react";
import Navbar from "../components/navbar";

export default function MakeTransaction() {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const handleTransfer = () => {
    alert(`Transferred $${amount} to ${recipient}`);
    setAmount("");
    setRecipient("");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto bg-white rounded-2xl shadow-lg mt-6">
        <h2 className="text-3xl font-bold text-gray-700 mb-6 text-center">Make a Transaction</h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Recipient Account Number"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
          <button onClick={handleTransfer} className="w-full p-3 bg-blue-600 text-white font-bold rounded-lg">
            Transfer Money
          </button>
        </div>
      </div>
    </div>
  );
}
