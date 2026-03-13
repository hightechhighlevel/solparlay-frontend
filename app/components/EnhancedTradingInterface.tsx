'use client'

import React, { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from './ToastProvider';
import { formatWalletAddress, formatPrice, formatPercentage, Token, ChainType } from '../lib/utils';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  Zap, 
  Target, 
  Activity,
  BarChart3,
  Wallet,
  Settings,
  Play,
  Pause,
  Trash2,
  Edit,
  Eye,
  ChevronRight,
  Star
} from 'lucide-react';

interface EnhancedTradingInterfaceProps {
  chains: ChainType[];
  onCreateChain: (tokens: Token[]) => Promise<void>;
  onDeleteChain: (chainId: string) => Promise<void>;
  onStartTrading: (chainId: string) => Promise<void>;
  loading: boolean;
}

const EnhancedTradingInterface: React.FC<EnhancedTradingInterfaceProps> = ({
  chains,
  onCreateChain,
  onDeleteChain,
  onStartTrading,
  loading
}) => {
  const { connected, publicKey } = useWallet();
  const { addToast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTokens, setNewTokens] = useState<Token[]>([
    { token: '', amount: '', threshold: '', currentPrice: 0 }
  ]);
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
        title: 'Chain created successfully',
        message: 'Your trading chain is ready to go!'
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
        return <Badge variant="warning" className="animate-pulse">⏳ Pending</Badge>;
      case 'trading':
        return <Badge variant="info" className="animate-pulse">🔄 Active</Badge>;
      case 'completed':
        return <Badge variant="success">✅ Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">❌ Failed</Badge>;
      default:
        return <Badge variant="outline">❓ Unknown</Badge>;
    }
  };

  const calculatePotentialProfit = (chain: ChainType) => {
    let amount = parseFloat(chain.chain[0]?.amount || '0');
    chain.chain.forEach(token => {
      amount *= (1 + parseFloat(token.threshold || '0') / 100);
    });
    return amount;
  };

  const calculateROI = (chain: ChainType) => {
    const initial = parseFloat(chain.chain[0]?.amount || '0');
    const potential = calculatePotentialProfit(chain);
    return initial > 0 ? ((potential - initial) / initial) * 100 : 0;
  };

  if (!connected) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 border-0 shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-8 shadow-lg">
              <Wallet className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              Connect Your Wallet
            </h3>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-md">
              Connect your Solana wallet to access powerful automated trading features
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              {['Phantom', 'Solflare', 'Ledger', 'Torus'].map((wallet) => (
                <div key={wallet} className="px-4 py-2 bg-white/50 dark:bg-slate-700/50 rounded-full text-sm font-medium">
                  {wallet}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            Trading Dashboard
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Manage your automated trading chains and monitor performance
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3"
            >
              List
            </Button>
          </div>
          
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Chain
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Chains',
            value: chains.length.toString(),
            icon: BarChart3,
            color: 'from-blue-500 to-cyan-500',
            change: '+12%'
          },
          {
            title: 'Active Trading',
            value: chains.filter(c => c.status === 'trading').length.toString(),
            icon: Activity,
            color: 'from-green-500 to-emerald-500',
            change: '+8%'
          },
          {
            title: 'Completed',
            value: chains.filter(c => c.status === 'completed').length.toString(),
            icon: Target,
            color: 'from-purple-500 to-pink-500',
            change: '+23%'
          },
          {
            title: 'Total Volume',
            value: '$12.5K',
            icon: DollarSign,
            color: 'from-orange-500 to-red-500',
            change: '+15%'
          }
        ].map((stat, index) => (
          <Card key={index} className="card-hover bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                    {stat.value}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    {stat.change} from last week
                  </p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Chain Form */}
      {showCreateForm && (
        <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900 border-0 shadow-2xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold flex items-center">
              <Zap className="w-6 h-6 mr-3 text-blue-600" />
              Create New Trading Chain
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {newTokens.map((token, index) => (
              <div key={index} className="bg-white/70 dark:bg-slate-700/70 rounded-xl p-6 border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold flex items-center">
                    <div className={`w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3`}>
                      {index + 1}
                    </div>
                    Token {index + 1}
                  </h4>
                  {newTokens.length > 1 && (
                    <Button
                      onClick={() => removeToken(index)}
                      variant="destructive"
                      size="sm"
                      className="w-8 h-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                      Token Symbol
                    </label>
                    <input
                      type="text"
                      placeholder="SOL, USDC, BONK..."
                      value={token.token}
                      onChange={(e) => updateToken(index, 'token', e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                      Amount
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={token.amount}
                      onChange={(e) => updateToken(index, 'amount', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      step="0.000001"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                      Threshold (%)
                    </label>
                    <input
                      type="number"
                      placeholder="10"
                      value={token.threshold}
                      onChange={(e) => updateToken(index, 'threshold', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      step="0.1"
                    />
                  </div>
                </div>
                
                {index < newTokens.length - 1 && (
                  <div className="flex items-center justify-center mt-4">
                    <ChevronRight className="w-6 h-6 text-slate-400" />
                  </div>
                )}
              </div>
            ))}
            
            <div className="flex justify-between items-center pt-4">
              <Button 
                onClick={addToken} 
                variant="outline"
                className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Token
              </Button>
              
              <div className="space-x-4">
                <Button 
                  onClick={() => setShowCreateForm(false)} 
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateChain}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Creating...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Create Chain
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trading Chains */}
      {chains.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
          {chains.map((chain) => (
            <Card 
              key={chain._id} 
              className={`card-hover bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 ${
                selectedChain === chain._id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedChain(selectedChain === chain._id ? null : chain._id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    Chain #{chain._id.slice(-6)}
                  </CardTitle>
                  {getStatusBadge(chain.status)}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Created: {new Date(chain.createdAt).toLocaleDateString()}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Token Chain Visualization */}
                <div className="space-y-2">
                  {chain.chain.map((token, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-slate-700/70 rounded-lg border border-white/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {index + 1}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {token.token}
                            </span>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {token.amount}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={parseFloat(token.threshold) > 0 ? 'success' : 'destructive'}
                            className="text-xs"
                          >
                            {formatPercentage(parseFloat(token.threshold))}
                          </Badge>
                          {token.currentPrice > 0 && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {formatPrice(token.currentPrice)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {index < chain.chain.length - 1 && (
                        <div className="flex justify-center my-2">
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Chain Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">ROI</span>
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      +{calculateROI(chain).toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="w-4 h-4 mr-1 text-blue-500" />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Progress</span>
                    </div>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                      {chain.currentStep}/{chain.chain.length}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Activity className="w-4 h-4 mr-1 text-purple-500" />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Status</span>
                    </div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {chain.status.charAt(0).toUpperCase() + chain.status.slice(1)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4">
                  {chain.status === 'pending' && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartTrading(chain._id);
                      }}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                      size="sm"
                      disabled={loading}
                    >
                      {loading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </>
                      )}
                    </Button>
                  )}
                  
                  {chain.status === 'trading' && (
                    <Button
                      onClick={(e) => e.stopPropagation()}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </Button>
                  )}
                  
                  <Button
                    onClick={(e) => e.stopPropagation()}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChain(chain._id);
                    }}
                    variant="destructive"
                    size="sm"
                    disabled={loading || chain.status === 'trading'}
                    className="px-3"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 border-0 shadow-lg">
          <CardContent className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-8 mx-auto shadow-lg">
              <TrendingUp className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              No Trading Chains Yet
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Create your first automated trading chain to start maximizing your profits
            </p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Chain
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedTradingInterface;