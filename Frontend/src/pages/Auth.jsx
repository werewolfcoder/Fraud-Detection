import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
          {isRegister ? "Create an Account" : "Welcome Back"}
        </h2>
        <form className="space-y-4">
          {isRegister && (
            <div className="flex items-center border rounded-lg p-2">
              <User className="text-gray-500 mr-2" size={20} />
              <input
                type="text"
                placeholder="Full Name"
                className="w-full outline-none"
              />
            </div>
          )}
          <div className="flex items-center border rounded-lg p-2">
            <Mail className="text-gray-500 mr-2" size={20} />
            <input
              type="email"
              placeholder="Email"
              className="w-full outline-none"
            />
          </div>
          <div className="flex items-center border rounded-lg p-2">
            <Lock className="text-gray-500 mr-2" size={20} />
            <input
              type="password"
              placeholder="Password"
              className="w-full outline-none"
            />
          </div>
          {isRegister && (
            <div className="flex items-center border rounded-lg p-2">
              <Lock className="text-gray-500 mr-2" size={20} />
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full outline-none"
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            {isRegister ? "Sign Up" : "Login"}
          </button>
        </form>
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
