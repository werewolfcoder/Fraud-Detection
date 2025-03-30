import { useState } from "react";
import Navbar from "../components/navbar";

export default  function Accounts() {
  const [accounts] = useState([
    { id: 1, type: "Savings Account", balance: 15000, accountNumber: "1234567890" },
    { id: 2, type: "Checking Account", balance: 5000, accountNumber: "0987654321" },
  ]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto bg-white rounded-2xl shadow-lg mt-6">
        <h2 className="text-3xl font-bold text-gray-700 mb-6 text-center">My Accounts</h2>

        <div className="space-y-4">
          {accounts.map((account) => (
            <div key={account.id} className="p-6 bg-gray-200 rounded-lg shadow-md flex justify-between">
              <div>
                <h3 className="text-xl font-semibold">{account.type}</h3>
                <p className="text-gray-600">Account No: {account.accountNumber}</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">${account.balance}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
