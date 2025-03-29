import React from "react";
import AuthPage from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import { Navbar } from "./components/navbar";
import { Routes, Route } from "react-router-dom";
import { Transactions } from "./pages/Transactions";
import { Accounts } from "./pages/Accounts";
import { MakeTransaction } from "./pages/MakeTransaction";
import { DepositMoney } from "./pages/DepositMoney";

function App() {
  return (
    <>
      
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/transfer" element={<MakeTransaction />} />
        <Route path="/deposit" element={<DepositMoney />} />
      </Routes>
    </>
  );
}

export default App;