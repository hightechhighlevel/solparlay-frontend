import React from 'react'
import { AlertTriangle } from 'lucide-react'
import '../Header/index.css';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface WalletNotConnectedPopupProps {
  onClose: () => void;
}

const WalletNotConnectedPopup: React.FC<WalletNotConnectedPopupProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-purple-800 border-4 border-black dark:border-white rounded-none p-8 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] max-w-md w-full">
        <AlertTriangle size={48} className="mx-auto mb-4 text-red-500 dark:text-white" />
        <h2 className="text-2xl font-bold mb-4 text-purple-600 dark:text-white text-center">Wallet Not Connected</h2>
        <p className="text-lg mb-6 dark:text-white text-center">
          Please connect your wallet to view your transaction history.
        </p>
        <div className="flex justify-center space-x-4">
          {/* <button
            onClick={onConnectWallet}
            className="bg-purple-300 dark:bg-white text-black dark:text-purple-900 font-bold py-2 px-4 rounded-none border-2 border-black dark:border-white hover:bg-purple-400 dark:hover:bg-yellow-400 transition-colors"
          >
            Connect Wallet
          </button> */}
          <div onClick={onClose}>
            <WalletMultiButton className="bg-purple-300 dark:bg-white text-black dark:text-purple-900 font-bold py-2 px-4 rounded-none border-2 border-black dark:border-white hover:bg-purple-400 transition-colors"/>
          </div>
          <button
            onClick={onClose}
            className="bg-gray-300 dark:bg-white text-black dark:text-black font-bold py-1 px-4 rounded-none border-2 border-black dark:border-black hover:bg-gray-400 dark:hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default WalletNotConnectedPopup