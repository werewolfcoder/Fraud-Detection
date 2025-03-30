import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Import AuthContext
import { Mail, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false); // Toggle between login and register
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user"); // Default role is "user"
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // For success or error messages
  const navigate = useNavigate();

  const {user,setUser} = useContext(AuthContext); // Get user data from context

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); // Clear previous messages

    if (!isRegister) {
        // Login logic
        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/login`, {
                email,
                password,
            });

            if (response.status === 200) {
                const { user: userData, token } = response.data;
                setUser(userData);
                localStorage.setItem("token", token);
                navigate("/"); // Redirect to dashboard
            }
        } catch (error) {
            console.error("Login failed:", error);
            setMessage("Invalid email or password. Please try again.");
        } finally {
            setLoading(false);
        }
    } else {
        // Registration logic
        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            setLoading(false);
            return;
        }

        const newUser = {
            username,
            email,
            password,
            role,
        };
        console.log(newUser)
        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/register`, newUser);
            if (response.status === 201) {
                setMessage("Registration successful! You can now log in.");
                setIsRegister(false); // Switch to login form
            }
        } catch (error) {
            console.error("Registration failed:", error);
            setMessage(error.response?.data?.error|| "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
          {isRegister ? "Create an Account" : "Welcome Back"}
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {isRegister && (
            <div className="flex items-center border rounded-lg p-2">
              <User className="text-gray-500 mr-2" size={20} />
              <input
                type="text"
                name="username"
                placeholder="Full Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full outline-none"
                required
              />
            </div>
          )}
          <div className="flex items-center border rounded-lg p-2">
            <Mail className="text-gray-500 mr-2" size={20} />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full outline-none"
              required
            />
          </div>
          <div className="flex items-center border rounded-lg p-2">
            <Lock className="text-gray-500 mr-2" size={20} />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full outline-none"
              required
            />
          </div>
          {isRegister && (
            <div className="flex items-center border rounded-lg p-2">
              <Lock className="text-gray-500 mr-2" size={20} />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full outline-none"
                required
              />
            </div>
          )}
          {isRegister && (
            <div className="flex items-center border rounded-lg p-2">
              <select
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full outline-none"
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? (isRegister ? "Signing Up..." : "Logging In...") : isRegister ? "Sign Up" : "Login"}
          </button>
        </form>
        {message && <p className="text-center mt-4 text-red-600">{message}</p>}
        <p className="text-center mt-4 text-gray-600">
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 font-medium hover:underline ml-1"
          >
            {isRegister ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}