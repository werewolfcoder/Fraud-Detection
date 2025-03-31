import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { TransactionProvider } from './context/TransactionContext'; 
import { AuthProvider } from "./context/AuthContext";
import './index.css'; // Ensure this file exists and contains your global styles

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <TransactionProvider>
                    <App />
                </TransactionProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);