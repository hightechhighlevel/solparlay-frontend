'use client'; // This makes the component a client component

// context/MyContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the types for your context
interface MyContextType {
  walletAddress: string;
  setWalletAddress: (data: string) => void;
}

// Create the context with a default value
const MyContext = createContext<MyContextType | undefined>(undefined);

// Define the provider props
interface MyContextProviderProps {
  children: ReactNode;
}

export const MyContextProvider: React.FC<MyContextProviderProps> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string>('');

  return (
    <MyContext.Provider value={{ walletAddress, setWalletAddress }}>
      {children}
    </MyContext.Provider>
  );
};

// Custom hook to use the context
export const useMyContext = (): MyContextType => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within a MyContextProvider');
  }
  return context;
};
