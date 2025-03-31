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
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // For success or error messages
  const navigate = useNavigate();

  const { user, setUser, login } = useContext(AuthContext); // Add login from context

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); 

    if (!isRegister) {
      // Login logic
      try {
        await login({ email, password });
      } catch (error) {
        console.error("Login failed:", error);
        setMessage("Invalid email or password. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        // Registration validation
        if (password !== confirmPassword) {
          setMessage("Passwords do not match.");
          setLoading(false);
          return;
        }

        if (role === "user" && (!age || age < 18 || age > 120)) {
          setMessage("Please enter a valid age between 18 and 120.");
          setLoading(false);
          return;
        }

        const newUser = {
          username: username.trim(),
          email: email.trim(),
          password,
          role,
          ...(role === "user" && {
            age: parseInt(age),
            gender,
            contact: contact ? contact.trim() : null,
          }),
        };

        console.log("Sending registration data:", { ...newUser, password: '[REDACTED]' });

        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/auth/register`,
          newUser
        );

        if (response.status === 201) {
          setMessage("Registration successful! You can now log in.");
          setIsRegister(false);
          // Clear form
          setUsername("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setAge("");
          setGender("");
          setContact("");
        }
      } catch (error) {
        console.error("Registration error:", error);
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message ||
                           error.message || 
                           "Registration failed. Please try again.";
        setMessage(errorMessage);
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
          {isRegister && role === "user" && (
            <>
              <div className="flex items-center border rounded-lg p-2">
                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full outline-none"
                  required
                />
              </div>
              <div className="flex items-center border rounded-lg p-2">
                <select
                  name="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full outline-none"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex items-center border rounded-lg p-2">
                <input
                  type="text"
                  name="contact"
                  placeholder="Contact Number"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full outline-none"
                  required
                />
              </div>
            </>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading
              ? isRegister
                ? "Signing Up..."
                : "Logging In..."
              : isRegister
              ? "Sign Up"
              : "Login"}
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