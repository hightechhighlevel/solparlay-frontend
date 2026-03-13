import React from 'react'

const InstallPhantomPopup: React.FC<{ onClose: () => void; }> = ({ onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    < div className="bg-white dark:bg-purple-800 border-4 border-black dark:border-yellow-300 rounded-none p-8 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#EAB308] max-w-2xl w-full" >
      <h2 className="text-3xl font-bold mb-4 text-purple-600 dark:text-yellow-300">Alert!</h2>
      <p className="text-xl mb-6 dark:text-white">Seems like you have not installed Phantom Wallet in your browser. To install, click <a href='https://phantom.app/download' className='underline'>here</a></p>
      <div className="flex justify-center">
        <button
          onClick={onClose}
          className="bg-purple-300 dark:bg-yellow-300 text-black dark:text-purple-900 font-bold py-2 px-4 rounded-none border-2 border-black dark:border-yellow-300 hover:bg-purple-400 dark:hover:bg-yellow-400 transition-colors"
        >
          Close
        </button>
      </div>
    </div >
  </div >
);
export default InstallPhantomPopup;  