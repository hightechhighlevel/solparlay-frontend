import React from 'react';

const TempWalletPopup: React.FC<{
  walletAddress: string;
  amount: string;
  token: string;
  onConfirm: () => void;
}> = ({ walletAddress, amount, token, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Temp Wallet Details</h2>
        <p className="mb-2">
          <strong>Wallet Address:</strong> {walletAddress}
        </p>
        <p className="mb-2">
          <strong>Amount:</strong> {amount}
        </p>
        <p className="mb-4">
          <strong>Token:</strong> {token}
        </p>
        <button
          onClick={onConfirm}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default TempWalletPopup;
