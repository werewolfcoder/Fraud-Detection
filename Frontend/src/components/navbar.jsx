import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";


export default function Navbar() {
  const { logout } = useContext(AuthContext); // Access the logout function from AuthContext

  return (
    <nav className="bg-blue-600 p-4 flex justify-between items-center text-white shadow-md">
      <h1 className="text-xl font-bold">Banking System</h1>
      <div className="hidden md:flex gap-6">
        <Link to="/" className="hover:underline">Dashboard</Link>
        <Link to="/accounts" className="hover:underline">Accounts</Link>
        <Link to="/transactions" className="hover:underline">Transactions</Link>
        <Link to="/settings" className="hover:underline">Settings</Link>
        <button
          onClick={logout} // Call the logout function when clicked
          className="hover:underline text-red-400"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
