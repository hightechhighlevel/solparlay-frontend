import React from "react";

const TempWalletPopup: React.FC<{
  tempWalletAddress: string;
  token: string;
  amount: number;
  onConfirm: () => void;
  onRemove: () => void;
// }> = ({ tempWalletAddress, token, amount, onConfirm, onRemove }) => {
}> = ({ onConfirm, onRemove }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white rounded-none p-8 shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Confirm to accept this Chain?
        </h2>
        {/* <p className="text-sm mb-4 dark:text-white">
          Please send the required funds to the address below:
        </p>
        <p className="text-md font-bold mb-6 text-gray-900 dark:text-white">
          Wallet Address: {`${tempWalletAddress.slice(0, 4)}..${tempWalletAddress.slice(-3)}`}
        </p>
        <p className="text-sm mb-2 text-black dark:text-white">
          Token: {token}
        </p>
        <p className="text-sm mb-6 text-black dark:text-white">
          Amount: {amount}
        </p>
        <p className="text-sm mb-4 dark:text-yellow-200">
          After sending funds, please wait a few minutes while we process your
          transaction. Once completed, click the &quot;Confirm&quot; button below.
        </p> */}
        <div className="flex items-center justify-between mx-10">
          <button
            onClick={onConfirm}
            className="bg-green-300 dark:bg-gray-600 text-black dark:text-gray-900 font-bold py-2 px-4 rounded-none border-2 border-black dark:border-white hover:bg-green-400 dark:hover:bg-purple-700 transition-colors"
          >
            Confirm
          </button>
          <button
            onClick={onRemove}
            className="bg-green-300 dark:bg-gray-600 text-black dark:text-gray-900 font-bold py-2 px-4 rounded-none border-2 border-black dark:border-white hover:bg-green-400 dark:hover:bg-purple-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TempWalletPopup;
