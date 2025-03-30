import { useState } from "react";
import Navbar from "../components/navbar";

export default function DepositMoney() {
  const [amount, setAmount] = useState("");

  const handleDeposit = () => {
    alert(`Deposited $${amount} successfully!`);
    setAmount("");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto bg-white rounded-2xl shadow-lg mt-6">
        <h2 className="text-3xl font-bold text-gray-700 mb-6 text-center">Deposit Money</h2>

        <div className="space-y-4">
          <input
            type="number"
            placeholder="Amount to Deposit"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
          <button onClick={handleDeposit} className="w-full p-3 bg-green-600 text-white font-bold rounded-lg">
            Deposit Money
          </button>
        </div>
      </div>
    </div>
  );
}
