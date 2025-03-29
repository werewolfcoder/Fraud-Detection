import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

export function Navbar() {
  return (
    <nav className="bg-blue-600 p-4 flex justify-between items-center text-white shadow-md">
      <h1 className="text-xl font-bold">Banking System</h1>
      <div className="hidden md:flex gap-6">
        <Link to="/" className="hover:underline">Dashboard</Link>
        <Link to="/accounts" className="hover:underline">Accounts</Link>
        <Link to="/transactions" className="hover:underline">Transactions</Link>
        <Link to="/settings" className="hover:underline">Settings</Link>
        <Link to="/logout" className="hover:underline text-red-400">Logout</Link>
      </div>
    </nav>
  );
}
