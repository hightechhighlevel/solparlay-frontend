import React, { useState, useEffect } from "react";
import { ArrowRight, ArrowDown, Plus, X, Activity } from "lucide-react";
import { Button } from "../ui/button";
import SolanaTradeCard from "../SolanaTradeCard/SolanaTradeCard";
// import PredictCard from "../PredictCard/PredictCard";

export type Token = {
  token: string;
  amount?: string;
  threshold?: string;
  slippage?: string;
  currentPrice?: number;
  livePrice?: number;
  tokenAddress: string;
  _id?: string;
  isAutoSell?: boolean;
};

const TradingChain: React.FC<{
  id: string;
  tokens: Token[];
  timestamp: string; // Pass preformatted timestamp
  chainStatus: string;
  currentStep: number;
  potentialWin: number;
  onRemove: () => void;
  onTrace: () => void;
  onTerminate: () => void;
  onAccept: (cards: Array<Token>) => void;
  loading: boolean | null;
}> = ({ id, tokens, timestamp, chainStatus, currentStep, potentialWin, loading, onRemove, onAccept, onTerminate, onTrace }) => {
  const [cards, setCards] = useState<Token[]>([
    {
      token: 'WSOL',
      tokenAddress: 'So11111111111111111111111111111111111111112',
      amount: "",
      slippage: "30"
    },
    {
      token: '',
      tokenAddress: ''
    }
  ]);

  useEffect(() => {
    if (tokens && tokens.length > 0) {
      setCards(tokens); // Set the tokens from props
      // setCurrentStep(tokens.length); // Set the current step based on the number of tokens
    }
  }, [tokens]);

  // useEffect(() => {
  //     const now = new Date();
  //     setTimestamp(now.toLocaleString());
  // }, []);

  const addCard = () => {
    if (cards.length < 4) {
      // setCards([...cards, { token: 'CHILLGUY', tokenAddress: 'Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump' }]);
      setCards([...cards, { token: '', tokenAddress: '' }]);
    }
  };

  const removeCard = (index: number) => {
    if (cards.length > 2) {
      setCards(cards.filter((_, i) => i !== index));
    }
  };

  const updateToken = (index: number, newToken: string, newTokenAddress: string) => {
    const newCards = [...cards];
    newCards[index].token = newToken;
    newCards[index].tokenAddress = newTokenAddress;
    setCards(newCards);
  };

  const updateAmount = (index: number, newAmount: string) => {
    const newCards = [...cards];
    newCards[index].amount = newAmount;
    setCards(newCards);
  };

  const updateThreshold = (index: number, newThreshold: string) => {
    const updatedCards = [...cards];
    updatedCards[index].threshold = newThreshold;
    setCards(updatedCards);
  };

  const updateSlippage = (index: number, newSlippage: string) => {
    const updatedCards = [...cards];
    updatedCards[index].slippage = newSlippage;
    setCards(updatedCards);
  }

  const Arrow: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex justify-center items-center ${className}`}>
      <ArrowRight className="hidden md:block dark:text-white w-8 h-8" />
      <ArrowDown className="block md:hidden dark:text-white w-8 h-8" />
    </div>
  );

  const updateAutoSell = () => {
    const updatedCards = [...cards];
    console.log("--------");
    console.log(cards[0].isAutoSell);
    updatedCards[0].isAutoSell = !cards[0].isAutoSell;
    console.log(updatedCards[0].isAutoSell);
    setCards(cards);
  }

  // const calculatePotentialWin = () => {
  //   const initialAmount = parseFloat(cards[0].amount || "0");
  //   let currentAmount = initialAmount;
  //   for (let i = 0; i < cards.length - 1; i++) {
  //     // Assume a 10% increase for each step as an example
  //     // console.log(cards[i].threshold)
  //     // currentAmount *= (parseFloat(cards[i].threshold || "0") / 100.0);
  //     currentAmount *= 1.1
  //   }
  //   return currentAmount.toFixed(2);
  // };

  return (
    <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-none border-4 border-black dark:border-white relative">
      {
        id !== "temp" &&
        <div>
          {
            chainStatus !== "trading" &&
            <button
              onClick={onRemove}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-white dark:hover:text-white"
            >
              <X size={20} />
            </button>
          }
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold dark:text-white text-black">
              Chain {id}
            </h2>
            <p className="text-xs text-green-500 dark:text-green-300">
              {timestamp}
            </p>
          </div>
        </div>
      }

      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
        {cards.map((card, index) => (
          <React.Fragment key={index}>
            {index > 0 && <Arrow className="w-8 h-8 flex-shrink-0" />}
            <SolanaTradeCard
              token={{
                token: card.token || '',
                amount: card.amount || '0',
                threshold: card.threshold || '0',
                currentPrice: card.currentPrice || 0,
                address: card.tokenAddress || ''
              }}
              index={index}
              onRemove={() => removeCard(index)}
              onUpdate={() => {}}
              isLast={index === cards.length - 1}
              canRemove={cards.length > 1}
            />
            {/* {index !== cards.length - 1 && (cards[index + 1].token === undefined || cards[index + 1].token === "") &&
              <PredictCard
                token={card.token}
                onTokenSelect={(newToken) => updateToken(index + 1, newToken)}
              />
            } */}
          </React.Fragment>
        ))}
        {cards.length < 4 && chainStatus !== "trading" && (
          <button
            onClick={addCard}
            className="bg-green-300 dark:bg-purple-600 text-black p-2 rounded-none border-2 border-black dark:text-white dark:border-white hover:bg-green-400 dark:hover:bg-purple-700 transition-colors flex-shrink-0"
          >
            <Plus size={24} />
          </button>
        )}
      </div>

      <div className="flex justify-between items-center mt-4">
        <div>
          <p className="text-sm font-bold dark:text-white text-black">
            Potential Win: {potentialWin.toFixed(3)}{" "}
            {cards[cards.length - 1].token}
          </p>
          <div className="flex items-center gap-5 mt-2">
            <p className="text-xs mt-1 dark:text-white  text-black">
              Currently On: {currentStep || 0}/{cards.length}
            </p>
            {
              chainStatus === 'trading' &&
              <Button variant="outline" className="bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-600 dark:text-white dark:hover:text-black dark:hover:bg-purple-700 border-2 border-black rounded-none font-medium text-base px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                onClick={onTrace}
              >
                <Activity className="mr-2 h-4 w-4" /> Trace
              </Button>
            }
          </div>
        </div>
        <div className="flex space-x-2">
          {/* <button
            disabled={initialStatus === "trading"}
            onClick={() => onSave(cards)}
            className="bg-green-300 dark:bg-yellow-300 text-black dark:text-purple-900 font-bold py-2 px-4 rounded-none border-2 border-black dark:border-yellow-300 hover:bg-green-400 dark:hover:bg-yellow-400 transition-colors"
          >
            Save Chain
          </button> */}
          {
            chainStatus !== "trading" ?
              (loading ?
                <button className="bg-blue-300 dark:bg-blue-600 text-black dark:text-white font-bold py-2 px-4 rounded-none border-2 border-black dark:border-white hover:bg-blue-400 dark:hover:bg-blue-700 transition-colors cursor-not-allowed">
                  <div className="flex items-center h-full">
                    <div className="loading-spinner"></div>
                    <div className="pl-8">Confirming</div>
                  </div>
                </button> :
                <button
                  onClick={() => onAccept(cards)}
                  className="bg-blue-300 dark:bg-blue-600 text-black dark:text-white font-bold py-2 px-4 rounded-none border-2 border-black dark:border-white hover:bg-blue-400 dark:hover:bg-blue-700 transition-colors"
                >
                  Accept Chain
                </button>) :
              <button
                onClick={onTerminate}
                className="bg-red-300 dark:bg-red-600 text-black dark:text-white font-bold py-2 px-4 rounded-none border-2 border-black dark:border-white hover:bg-red-400 dark:hover:bg-red-700 transition-colors"
              >
                Terminate Chain
              </button>
          }

        </div>
      </div>
    </div>
  );
};
export default TradingChain;
