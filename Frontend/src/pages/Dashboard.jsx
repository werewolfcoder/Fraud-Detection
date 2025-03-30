import { useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Send, PlusCircle, FileText, Settings } from "lucide-react";
import Navbar from "../components/navbar";

export function Dashboard() {
  const [balance, setBalance] = useState(25000); // Example balance
  const recentTransactions = [
    { id: 1, type: "Sent", amount: -500, date: "March 28, 2025" },
    { id: 2, type: "Received", amount: 1200, date: "March 27, 2025" },
    { id: 3, type: "Bill Payment", amount: -300, date: "March 26, 2025" },
  ];

  return (
    
    <div className="min-h-screen bg-gray-100">
      <Navbar></Navbar>
      <div className="p-6 max-w-6xl mx-auto bg-white rounded-2xl shadow-lg mt-6">
        <h2 className="text-3xl font-bold text-gray-700 mb-6">Dashboard</h2>

        {/* Account Balance Section */}
        <div className="p-6 bg-blue-500 text-white rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-xl">Current Balance</h3>
            <p className="text-3xl font-bold">${balance}</p>
          </div>
          <Link to="/transactions" className="p-2 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-200">
            View Transactions
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          <Link to="/accounts" className="p-6 bg-green-500 text-white rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-green-600 transition">
            <CreditCard size={32} />
            <span>Accounts</span>
          </Link>
          <Link to="/transfer" className="p-6 bg-yellow-500 text-white rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-yellow-600 transition">
            <Send size={32} />
            <span>Send Money</span>
          </Link>
          <Link to="/deposit" className="p-6 bg-blue-700 text-white rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-blue-800 transition">
            <PlusCircle size={32} />
            <span>Deposit Money</span>
          </Link>
          <Link to="/bill-payment" className="p-6 bg-red-500 text-white rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-red-600 transition">
            <FileText size={32} />
            <span>Bill Payments</span>
          </Link>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-700 mb-4">Recent Transactions</h3>
          <ul className="bg-gray-50 p-4 rounded-lg shadow">
            {recentTransactions.map((txn) => (
              <li key={txn.id} className="flex justify-between py-2 border-b last:border-none">
                <span>{txn.type}</span>
                <span className={txn.amount < 0 ? "text-red-500" : "text-green-500"}>${txn.amount}</span>
                <span className="text-gray-500">{txn.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
export default Dashboard;