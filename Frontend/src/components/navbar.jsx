import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { logout, user } = useContext(AuthContext);

  if (user?.role === 'admin') {
    return (
      <nav className="bg-gray-800 p-4 flex justify-between items-center text-white shadow-md">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <div className="flex gap-6">
          <Link to="/admin_dashboard" className="hover:underline">Dashboard</Link>
          <button
            onClick={logout}
            className="hover:underline text-red-400 font-medium"
          >
            Logout
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-blue-600 p-4 flex justify-between items-center text-white shadow-md">
      <h1 className="text-xl font-bold">Banking System</h1>
      <div className="hidden md:flex gap-6">
        <Link to="/" className="hover:underline">Dashboard</Link>
        <Link to="/accounts" className="hover:underline">Accounts</Link>
        <Link to="/transactions" className="hover:underline">Transactions</Link>
        <Link to="/settings" className="hover:underline">Settings</Link>
        <button
          onClick={logout}
          className="hover:underline text-red-400"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
