import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import AuthPage from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import MakeTransaction from "./pages/MakeTransaction";
import DepositMoney from "./pages/DepositMoney";

const PrivateRoute = ({ children }) => {
    const { user } = useContext(AuthContext);

    // If the user is not logged in, redirect to the login page
    return user ? children : <Navigate to="/auth" />;
};

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected Routes */}
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <PrivateRoute>
                        <Profile />
                    </PrivateRoute>
                }
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/accounts" element={<Accounts />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/transfer" element={<MakeTransaction />} />
        <Route path="/deposit" element={<DepositMoney />} />
        </Routes>
    );
}

export default App;