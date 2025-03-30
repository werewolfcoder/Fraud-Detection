import { createContext, useState } from "react";

export const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactionType, setTransactionType] = useState("");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [merchantID, setMerchantID] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  return (
    <TransactionContext.Provider
      value={{
        transactionType,
        setTransactionType,
        amount,
        setAmount,
        recipient,
        setRecipient,
        merchantID,
        setMerchantID,
        bankBranch,
        setBankBranch,
        state,
        setState,
        city,
        setCity,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};