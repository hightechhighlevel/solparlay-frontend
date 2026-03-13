'use client'

import React, { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from './ToastProvider';
import { formatWalletAddress, formatPrice, formatPercentage } from '../lib/utils';
import { Plus, TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';

interface Token {
  token: string;
  amount: string;
  threshold: string;
  currentPrice: number;
}

interface Chain {
  _id: string;
  walletAddress: string;
  status: 'pending' | 'trading' | 'completed' | 'failed';
  message: string;
  currentStep: number;
  createdAt: string;
  chain: Token[];
}

interface TradingInterfaceProps {
  chains: Chain[];
  onCreateChain: (tokens: Token[]) => Promise<void>;
  onDeleteChain: (chainId: string) => Promise<void>;
  onStartTrading: (chainId: string) => Promise<void>;
  loading: boolean;
}

const TradingInterface: React.FC<TradingInterfaceProps> = ({
  chains,
  onCreateChain,
  onDeleteChain,
  onStartTrading,
  loading
}) => {
  const { connected } = useWallet();
  const { addToast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTokens, setNewTokens] = useState<Token[]>([
    { token: '', amount: '', threshold: '', currentPrice: 0 }
  ]);

  const addToken = useCallback(() => {
    setNewTokens(prev => [...prev, { token: '', amount: '', threshold: '', currentPrice: 0 }]);
  }, []);

  const removeToken = useCallback((index: number) => {
    setNewTokens(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateToken = useCallback((index: number, field: keyof Token, value: string) => {
    setNewTokens(prev => prev.map((token, i) => 
      i === index ? { ...token, [field]: value } : token
    ));
  }, []);

  const handleCreateChain = useCallback(async () => {
    if (!connected) {
      addToast({
        type: 'error',
        title: 'Wallet not connected',
        message: 'Please connect your wallet first'
      });
      return;
    }

    const validTokens = newTokens.filter(token => 
      token.token && token.amount && token.threshold
    );

    if (validTokens.length < 2) {
      addToast({
        type: 'error',
        title: 'Invalid chain',
        message: 'Please add at least 2 tokens to create a chain'
      });
      return;
    }

    try {
      await onCreateChain(validTokens);
      setNewTokens([{ token: '', amount: '', threshold: '', currentPrice: 0 }]);
      setShowCreateForm(false);
      addToast({
        type: 'success',
        title: 'Chain created',
        message: 'Your trading chain has been created successfully'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to create chain',
        message: 'Please try again'
      });
    }
  }, [connected, newTokens, onCreateChain, addToast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" className="animate-pulse">Pending</Badge>;
      case 'trading':
        return <Badge variant="info" className="animate-pulse">Trading</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const calculatePotentialProfit = (chain: Chain) => {
    let amount = parseFloat(chain.chain[0]?.amount || '0');
    chain.chain.forEach(token => {
      amount *= (1 + parseFloat(token.threshold || '0') / 100);
    });
    return amount;
  };

  if (!connected) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground">Please connect your wallet to start trading</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Create Chain Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Create Trading Chain
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              variant="gradient"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chain
            </Button>
          </CardTitle>
        </CardHeader>
        
        {showCreateForm && (
          <CardContent className="space-y-4">
            {newTokens.map((token, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-1">Token</label>
                  <input
                    type="text"
                    placeholder="e.g., SOL, USDC"
                    value={token.token}
                    onChange={(e) => updateToken(index, 'token', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={token.amount}
                    onChange={(e) => updateToken(index, 'amount', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Threshold (%)</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={token.threshold}
                    onChange={(e) => updateToken(index, 'threshold', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  {newTokens.length > 1 && (
                    <Button
                      onClick={() => removeToken(index)}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <div className="flex justify-between">
              <Button onClick={addToken} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Token
              </Button>
              <div className="space-x-2">
                <Button 
                  onClick={() => setShowCreateForm(false)} 
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateChain}
                  variant="gradient"
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Create Chain'}
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Active Chains */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chains.map((chain) => (
          <Card key={chain._id} className="card hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Chain #{chain._id.slice(-6)}
                </CardTitle>
                {getStatusBadge(chain.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                Created: {new Date(chain.createdAt).toLocaleDateString()}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Token Chain */}
              <div className="space-y-2">
                {chain.chain.map((token, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{token.token}</span>
                      <span className="text-sm text-muted-foreground">
                        {token.amount}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={parseFloat(token.threshold) > 0 ? 'success' : 'destructive'}>
                        {formatPercentage(parseFloat(token.threshold))}
                      </Badge>
                      <span className="text-sm">
                        {formatPrice(token.currentPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                    <span className="text-sm font-medium">Potential</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {formatPrice(calculatePotentialProfit(chain))}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="w-4 h-4 mr-1 text-blue-500" />
                    <span className="text-sm font-medium">Step</span>
                  </div>
                  <p className="text-lg font-bold">
                    {chain.currentStep}/{chain.chain.length}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                {chain.status === 'pending' && (
                  <Button
                    onClick={() => onStartTrading(chain._id)}
                    variant="gradient"
                    size="sm"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Start Trading'}
                  </Button>
                )}
                <Button
                  onClick={() => onDeleteChain(chain._id)}
                  variant="destructive"
                  size="sm"
                  disabled={loading || chain.status === 'trading'}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {chains.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Trading Chains Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first trading chain to get started with automated trading
            </p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              variant="gradient"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Chain
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TradingInterface;