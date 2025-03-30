import React from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
    const { user } = useContext(AuthContext);

    // If the user is not logged in, redirect to the login page
    return user ? children : <Navigate to="/auth" />;
};

export default PrivateRoute;