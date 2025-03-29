import { useState } from "react";
import { Navbar } from "../components/navbar";

export function Transactions() {
  const [transactions] = useState([
    { id: 1, type: "Deposit", amount: 2000, date: "March 25, 2025" },
    { id: 2, type: "Withdrawal", amount: -500, date: "March 26, 2025" },
    { id: 3, type: "Bill Payment", amount: -120, date: "March 27, 2025" },
  ]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto bg-white rounded-2xl shadow-lg mt-6">
        <h2 className="text-3xl font-bold text-gray-700 mb-6 text-center">Transaction History</h2>

        <div className="bg-gray-50 p-4 rounded-lg shadow">
          {transactions.map((txn) => (
            <div key={txn.id} className="flex justify-between py-2 border-b last:border-none">
              <span>{txn.type}</span>
              <span className={txn.amount < 0 ? "text-red-500" : "text-green-500"}>${txn.amount}</span>
              <span className="text-gray-500">{txn.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
