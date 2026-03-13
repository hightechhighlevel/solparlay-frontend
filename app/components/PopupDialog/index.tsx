import React from 'react';

interface PopupDialogProps {
  title: string;
  msg: string;
  onClose: () => void;
}

export const PopupDialog: React.FC<PopupDialogProps> = ({ title, msg, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white rounded-none p-8 shadow-[8px_8px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] max-w-2xl w-full">
        <h2 className="text-3xl font-bold mb-4 text-purple-600 dark:text-white">{title}</h2>
        <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-none border-2 border-black dark:border-white mb-6">
          <p className="text-lg font-bold mb-2 dark:text-white">{msg}</p>
        </div>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-gray-300 dark:bg-white text-black dark:text-gray-900 font-bold py-2 px-4 rounded-none border-2 border-black dark:border-white hover:bg-purple-400 dark:hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupDialog;
