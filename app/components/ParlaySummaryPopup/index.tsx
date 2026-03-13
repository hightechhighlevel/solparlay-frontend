import React from 'react';
import { Button } from '../ui/button';
import { ArrowRight, X } from 'lucide-react';

type Leg = {
    token: string,
    startAmount: number,
    currentAmount: number,
    targetAmount: number,
    status: string,
    gain: string,
}

interface ParlaySummaryPopupProps {
    title: string;
    legs: Leg[];
    onClose: () => void;
}

export const ParlaySummaryPopup: React.FC<ParlaySummaryPopupProps> = ({ title, legs, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white rounded-none p-8 shadow-[8px_8px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] max-w-2xl w-full">
                <div className='flex justify-between items-center'>
                <h2 className="text-3xl font-bold mb-4 text-purple-600 dark:text-white">Chain {title}</h2>
                <Button
                    variant="ghost"
                    onClick={onClose}
                    className="h-auto pb-8 hover:bg-transparent"
                >
                    <X className="h-5 w-5 text-purple-800 dark:text-white" />
                </Button>
                </div>
                
                <div className="space-y-4">
            {legs.map((leg: Leg, index: number) => (
              <div 
                key={index} 
                className="bg-white dark:bg-purple-800 border-2 border-black dark:border-yellow-300 rounded-none p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-600 dark:bg-yellow-300 rounded-sm flex items-center justify-center text-white dark:text-purple-800 text-xs font-bold">
                      {leg.token.substring(0, 1)}
                    </div>
                    <span className="font-bold text-purple-800 dark:text-white">{leg.token}</span>
                  </div>
                  <span className="text-sm text-purple-600 dark:text-white font-medium">
                    {leg.status}
                  </span>
                </div>
                
                {leg.status === 'In Progress' ? (
                  <div className="space-y-2">
                    <div className="text-sm text-purple-700 dark:text-white">
                      Incoming {leg.startAmount} SOL
                    </div>
                    <div className="flex items-center gap-2 text-sm text-purple-800 dark:text-yellow-100">
                      <span>{leg.currentAmount.toFixed(4)} SOL</span>
                      <span>/</span>
                      <span>{leg.targetAmount.toFixed(4)} SOL</span>
                    </div>
                    <div className="text-xs text-purple-600 dark:text-white">
                      (Current value / Target value in SOL)
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-purple-800 dark:text-white">
                    <span>{leg.startAmount} SOL</span>
                    <ArrowRight className="h-4 w-4" />
                    <span>{leg.currentAmount} SOL</span>
                    <span>/</span>
                    <span>{leg.targetAmount} SOL</span>
                  </div>
                )}
                
                {leg.status !== 'Not Started' && (
                  <div className="mt-2 text-sm font-medium text-purple-700 dark:text-white">
                    Target Gain: {leg.gain}%
                  </div>
                )}
              </div>
            ))}
          </div>
            </div>
        </div>
    );
};

export default ParlaySummaryPopup;