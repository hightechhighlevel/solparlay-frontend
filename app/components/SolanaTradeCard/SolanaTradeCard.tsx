'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { X, TrendingUp, DollarSign, Percent } from 'lucide-react'
import PercentageSelector from '../PercentageSelector/PercentageSelector'
import { DexTokenType, Token, validateTokenAmount, validateThreshold, sanitizeTokenName, formatPrice } from '@/app/lib/utils'
import { debounce } from 'lodash'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import LoadingSpinner from '../LoadingSpinner'

interface SolanaTradeCardProps {
  token: Token
  index: number
  onRemove: (index: number) => void
  onUpdate: (index: number, field: keyof Token, value: string) => void
  isLast: boolean
  canRemove: boolean
  isDisabled?: boolean
  onTokenChange?: (newToken: string, newTokenAddress?: string) => void
  onAmountChange?: (newAmount: string) => void
  onThresholdChange?: (newThreshold: string) => void
  onChangeAutoSell?: () => void
}

const SolanaTradeCard: React.FC<SolanaTradeCardProps> = ({
  token,
  index,
  onRemove,
  onUpdate,
  isLast,
  canRemove,
  isDisabled = false,
  onTokenChange,
  onAmountChange,
  onThresholdChange,
  onChangeAutoSell
}) => {
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)
  const [tokenSuggestions, setTokenSuggestions] = useState<DexTokenType[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [tokenError, setTokenError] = useState('')
  const [amountError, setAmountError] = useState('')
  const [thresholdError, setThresholdError] = useState('')

  // Debounced function to fetch token price
  const fetchTokenPrice = useCallback(
    debounce(async (tokenName: string) => {
      if (!tokenName.trim()) return

      setIsLoadingPrice(true)
      setTokenError('')

      try {
        const response = await axios.get(
          `https://api.dexscreener.com/latest/dex/search?q=${tokenName}`
        )

        if (response.data.pairs && response.data.pairs.length > 0) {
          const price = parseFloat(response.data.pairs[0].priceUsd) || 0
          onUpdate(index, 'currentPrice', price.toString())
          setTokenError('')
        } else {
          setTokenError('Token not found')
          onUpdate(index, 'currentPrice', '0')
        }
      } catch (error) {
        console.error('Error fetching token price:', error)
        setTokenError('Failed to fetch price')
        onUpdate(index, 'currentPrice', '0')
      } finally {
        setIsLoadingPrice(false)
      }
    }, 500),
    [index, onUpdate]
  )

  // Fetch token suggestions
  const fetchTokenSuggestions = useCallback(
    debounce(async (query: string) => {
      if (!query.trim() || query.length < 2) {
        setTokenSuggestions([])
        return
      }

      try {
        const response = await axios.get(
          `https://api.dexscreener.com/latest/dex/search?q=${query}`
        )

        if (response.data.pairs) {
          const suggestions: DexTokenType[] = response.data.pairs
            .slice(0, 5)
            .map((pair: any) => ({
              chainId: 'solana',
              address: pair.baseToken?.address || '',
              name: pair.baseToken?.name || '',
              symbol: pair.baseToken?.symbol || '',
              decimals: 9,
              logoURI: pair.info?.imageUrl || ''
            }))
          setTokenSuggestions(suggestions)
        }
      } catch (error) {
        console.error('Error fetching token suggestions:', error)
        setTokenSuggestions([])
      }
    }, 300),
    []
  )

  // Handle token input change
  const handleTokenChange = (value: string) => {
    const sanitizedValue = sanitizeTokenName(value)
    onUpdate(index, 'token', sanitizedValue)
    
    if (sanitizedValue) {
      fetchTokenPrice(sanitizedValue)
      fetchTokenSuggestions(sanitizedValue)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
      setTokenSuggestions([])
    }
  }

  // Handle amount change with validation
  const handleAmountChange = (value: string) => {
    onUpdate(index, 'amount', value)
    
    if (value && !validateTokenAmount(value)) {
      setAmountError('Please enter a valid positive number')
    } else {
      setAmountError('')
    }
  }

  // Handle threshold change with validation
  const handleThresholdChange = (value: string) => {
    onUpdate(index, 'threshold', value)
    
    if (value && !validateThreshold(value)) {
      setThresholdError('Threshold must be between -100% and 1000%')
    } else {
      setThresholdError('')
    }
  }

  // Handle token selection from suggestions
  const handleTokenSelect = (selectedToken: DexTokenType) => {
    onUpdate(index, 'token', selectedToken.symbol)
    onUpdate(index, 'address', selectedToken.address)
    setShowSuggestions(false)
    fetchTokenPrice(selectedToken.symbol)
  }

  // Handle percentage selector
  const handlePercentageSelect = (percentage: number) => {
    onUpdate(index, 'threshold', percentage.toString())
    setThresholdError('')
  }

  return (
    <Card className="relative transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
              {index + 1}
            </div>
            Token {index + 1}
          </CardTitle>
          {canRemove && (
            <Button
              onClick={() => onRemove(index)}
              variant="destructive"
              size="sm"
              className="w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Token Input */}
        <div className="relative">
          <label className="block text-sm font-medium mb-2">
            Token Symbol
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g., SOL, USDC, BONK"
              value={token.token}
              onChange={(e) => handleTokenChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              disabled={isDisabled}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                tokenError ? 'border-red-500' : 'border-gray-300'
              } ${isDisabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
            />
            {isLoadingPrice && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <LoadingSpinner size="sm" />
      </div>
            )}
        </div>
          
          {/* Token Suggestions */}
          {showSuggestions && tokenSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {tokenSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTokenSelect(suggestion)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  {suggestion.logoURI && (
                    <img
                      src={suggestion.logoURI}
                      alt={suggestion.symbol}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <div>
                    <div className="font-medium">{suggestion.symbol}</div>
                    <div className="text-sm text-gray-500">{suggestion.name}</div>
                </div>
                </button>
              ))}
            </div>
          )}
          
          {tokenError && (
            <p className="text-red-500 text-sm mt-1">{tokenError}</p>
          )}
        </div>

        {/* Current Price Display */}
        {token.currentPrice > 0 && (
          <div className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">
              Current Price: {formatPrice(token.currentPrice)}
            </span>
        </div>
      )}

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Amount
          </label>
        <input
          type="number"
            placeholder="0.00"
            value={token.amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            disabled={isDisabled}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              amountError ? 'border-red-500' : 'border-gray-300'
            } ${isDisabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
            step="0.000001"
            min="0"
          />
          {amountError && (
            <p className="text-red-500 text-sm mt-1">{amountError}</p>
          )}
        </div>

        {/* Threshold Input with Percentage Selector */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Price Change Threshold (%)
          </label>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="10"
              value={token.threshold}
              onChange={(e) => handleThresholdChange(e.target.value)}
              disabled={isDisabled}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                thresholdError ? 'border-red-500' : 'border-gray-300'
              } ${isDisabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
              step="0.1"
              min="-100"
              max="1000"
            />
            
            {/* Percentage Selector Component */}
            <PercentageSelector onSelect={handlePercentageSelect} />
          </div>
          
          {thresholdError && (
            <p className="text-red-500 text-sm mt-1">{thresholdError}</p>
          )}
          
          {token.threshold && !thresholdError && (
            <div className="flex items-center space-x-2 mt-2">
              <Percent className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-600">
                {parseFloat(token.threshold) >= 0 ? 'Profit target' : 'Stop loss'}:
                <Badge variant={parseFloat(token.threshold) >= 0 ? 'success' : 'destructive'} className="ml-1">
                  {parseFloat(token.threshold) >= 0 ? '+' : ''}{token.threshold}%
                </Badge>
              </span>
            </div>
          )}
        </div>

        {/* Chain Connection Indicator */}
        {!isLast && (
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <TrendingUp className="w-4 h-4" />
              <div className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SolanaTradeCard