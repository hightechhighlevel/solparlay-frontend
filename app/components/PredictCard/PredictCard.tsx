import React, { useEffect, useState } from 'react'

type typePair = {
  priceUsd: number,
  priceChange: number,
  targetTokenSymbol: string,
  targetTokenName: string
}

const PredictCard: React.FC<{ 
  token: string; 
  onTokenSelect: (token: string) => void;
}> = ({ token, onTokenSelect}) => {
  const [tokens, setTokens] = useState<Array<string>>([]);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${token}`,{
          method: 'GET',
          headers: {},
        }); // Replace with your API endpoint
        const data = await response.json();
        const sorted: Array<typePair> = data.pairs.map((
          pair: {
            priceUsd: number | null,
            priceChange: {
              h6: number | null
            },
            quoteToken: {
              symbol: string,
              name: string,
            }
          }
        ) => ({
          priceUsd: Number(pair.priceUsd) || 0,
          priceChange: Number(pair.priceChange.h6) || 0,
          targetTokenSymbol: pair.quoteToken.symbol || '',
          targetTokenName: pair.quoteToken.name || ''
        }))
        .sort((a: typePair, b: typePair) => b.priceChange - a.priceChange)
        console.log(sorted);

        const tempTokens = [... new Set(sorted.map((pair: typePair) => 
          `${pair.targetTokenSymbol}:${(pair.priceChange).toFixed(2)}%` as string
        ))].slice(0, 5);

        setTokens(tempTokens);
      } catch (error) {
        console.error('Error fetching tokens:', error);
      }
    };

    fetchTokens();
  }, []);

  const handleTokenSelect = (value: string) => {
    onTokenSelect(value.split(":")[0]);
  }

  return (
    <div className="bg-white dark:bg-purple-800 border-4 border-yellow dark:border-yellow-300 rounded-none p-4 w-40 relative">
      {tokens.map((token, index) => (
        <input
          key={index}
          type="button"
          value={token}
          onClick={() => handleTokenSelect(token)}
          className="w-full border-2 border-yellow dark:border-yellow-300 rounded-none px-2 py-1 text-sm bg-white dark:bg-purple-800 text-black dark:text-yellow-300 mb-2 text-center"
        />
      ))}
      
    </div>
  )
}

export default PredictCard
