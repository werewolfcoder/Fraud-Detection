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
import AdminDashboard from "./pages/AdminDashboard";
import Settings from "./pages/Settings";

const PrivateRoute = ({ children, allowedRoles }) => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/auth" />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" />;
    }

    return children;
};

function App() {
    const { user } = useContext(AuthContext);

    // Redirect admins to admin dashboard if they try to access user routes
    if (user?.role === 'admin' && window.location.pathname !== '/admin_dashboard' && window.location.pathname !== '/auth') {
        return <Navigate to="/admin_dashboard" />;
    }

    return (
        <Routes>
            {/* Public Routes */}
            <Route 
                path="/auth" 
                element={user ? <Navigate to={user.role === 'admin' ? '/admin_dashboard' : '/'} /> : <AuthPage />}
            />

            {/* Admin Routes */}
            <Route
                path="/admin_dashboard"
                element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                    </PrivateRoute>
                }
            />

            {/* User Routes - Not accessible to admins */}
            <Route
                path="/"
                element={
                    <PrivateRoute allowedRoles={['user']}>
                        <Dashboard />
                    </PrivateRoute>
                }
            />
            
            <Route
                path="/profile"
                element={
                    <PrivateRoute allowedRoles={['user', 'admin']}>
                        <Profile />
                    </PrivateRoute>
                }
            />

            {/* Other protected routes - Only for users */}
            <Route
                path="/accounts"
                element={
                    <PrivateRoute allowedRoles={['user']}>
                        <Accounts />
                    </PrivateRoute>
                }
            />
            <Route
                path="/transactions"
                element={
                    <PrivateRoute allowedRoles={['user']}>
                        <Transactions />
                    </PrivateRoute>
                }
            />
            <Route
                path="/transfer"
                element={
                    <PrivateRoute allowedRoles={['user']}>
                        <MakeTransaction />
                    </PrivateRoute>
                }
            />
            <Route
                path="/deposit"
                element={
                    <PrivateRoute allowedRoles={['user']}>
                        <DepositMoney />
                    </PrivateRoute>
                }
            />
            <Route
                path="/settings"
                element={
                    <PrivateRoute allowedRoles={['user', 'admin']}>
                        <Settings />
                    </PrivateRoute>
                }
            />

            {/* Fallback Route - Redirect admins to admin dashboard, users to home */}
            <Route path="*" element={
                <Navigate to={user?.role === 'admin' ? '/admin_dashboard' : '/'} />
            } />
        </Routes>
    );
}

export default App;