"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "./components/Header/Header";
import { useWallet } from "@solana/wallet-adapter-react";
import EnhancedTradingInterface from './components/EnhancedTradingInterface';
import LoadingSpinner from './components/LoadingSpinner';
import { useToast } from './components/ToastProvider';
import { Token, ChainType } from './lib/utils';

export default function Home() {
  const [chains, setChains] = useState<ChainType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const { publicKey, connected } = useWallet();
  const { addToast } = useToast();
  const { message, isConnected } = {message: null, isConnected: false};

  useEffect(() => {
    // Configure axios with backend URL
    const backendURL = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:5000';
    axios.defaults.baseURL = backendURL;
    console.log('Backend URL configured:', backendURL);
  }, []);

  useEffect(() => {
    if (publicKey && connected) {
      fetchChains(publicKey.toString());
    } else {
      setChains([]);
    }
  }, [publicKey, connected]);

  const fetchChains = async (walletAddress: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/chains/enhanced/${walletAddress}`);
      if (response.data?.success) {
        setChains(response.data.chains || []);
      }
    } catch (error) {
      console.error('Error fetching chains:', error);
      addToast({
        type: 'error',
        title: 'Failed to fetch chains',
        message: 'Please try refreshing the page'
      });
    }
    setLoading(false);
  };

  const handleCreateChain = async (tokens: Token[]) => {
    if (!publicKey) return;
    
    setLoadingAdd(true);
    try {
      const response = await axios.post('/api/chains/enhanced', {
        walletAddress: publicKey.toString(),
        tokens
      });
      
      if (response.data?.success) {
        await fetchChains(publicKey.toString());
        addToast({
          type: 'success',
          title: 'Chain created successfully!',
          message: `Your trading chain with ${tokens.length} tokens is ready`
        });
      }
    } catch (error: any) {
      console.error('Error creating chain:', error);
      addToast({
        type: 'error',
        title: 'Failed to create chain',
        message: error.response?.data?.error || 'Please try again'
      });
      throw error;
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleDeleteChain = async (chainId: string) => {
    try {
      const response = await axios.delete(`/api/chains/${chainId}`);
      if (response.status === 200) {
        setChains(chains.filter(chain => chain._id !== chainId));
        addToast({
          type: 'success',
          title: 'Chain deleted',
          message: 'Trading chain has been removed successfully'
        });
      }
    } catch (error) {
      console.error('Error deleting chain:', error);
      addToast({
        type: 'error',
        title: 'Delete failed',
        message: 'Failed to delete the trading chain'
      });
    }
  };

  const handleStartTrading = async (chainId: string) => {
    try {
      const response = await axios.post(`/api/chains/${chainId}/start-enhanced`);
      if (response.data?.success) {
        if (publicKey) {
          await fetchChains(publicKey.toString());
        }
        addToast({
          type: 'success',
          title: 'Trading started!',
          message: 'Your trading chain is now active and monitoring the market'
        });
      }
    } catch (error: any) {
      console.error('Error starting trading:', error);
      addToast({
        type: 'error',
        title: 'Failed to start trading',
        message: error.response?.data?.error || 'Please try again'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-2xl animate-float delay-2000"></div>
      </div>

      <Header />
      
      {/* Hero Section */}
      <section className="relative py-32 px-4">
        <div className="container mx-auto text-center relative z-10">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent mb-6 animate-gradient-x tracking-tight">
              SolParlay
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6"></div>
          </div>
          
          <p className="text-2xl md:text-3xl text-slate-600 dark:text-slate-300 mb-12 max-w-4xl mx-auto font-light leading-relaxed">
            The Future of <span className="font-semibold text-blue-600 dark:text-blue-400">Automated Solana Trading</span>
            <br />
            Chain Your Success with Smart Strategies
          </p>
          
          {/* Enhanced Connection Status: Optimized for mobile and desktop */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <div className={`
              flex items-center space-x-3 px-6 py-4 rounded-2xl backdrop-blur-xl border shadow-lg transition-all duration-300 hover:scale-105
              ${connected 
                ? 'bg-emerald-100/80 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200' 
                : 'bg-amber-100/80 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200'
              }
            `}>
              <div className={`
                w-3 h-3 rounded-full flex-shrink-0
                ${connected ? 'bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50' : 'bg-amber-500 animate-pulse shadow-lg shadow-amber-500/50'}
              `}></div>
              <div className="text-sm font-medium">
                <div className="font-semibold">
                  {connected ? '🔗 Wallet Connected' : '⚠️ Wallet Disconnected'}
                </div>
                {connected && publicKey && (
                  <div className="text-xs opacity-80 font-mono">
                    {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-6)}
                  </div>
                )}
              </div>
            </div>
            
            <div className={`
              flex items-center space-x-3 px-6 py-4 rounded-2xl backdrop-blur-xl border shadow-lg transition-all duration-300 hover:scale-105
              ${isConnected 
                ? 'bg-sky-100/80 dark:bg-sky-900/30 border-sky-200 dark:border-sky-700 text-sky-800 dark:text-sky-200' 
                : 'bg-slate-100/80 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }
            `}>
              <div className={`
                w-3 h-3 rounded-full flex-shrink-0
                ${isConnected ? 'bg-sky-500 animate-pulse shadow-lg shadow-sky-500/50' : 'bg-slate-400'}
              `}></div>
              <div className="text-sm font-medium">
                <div className="font-semibold">
                  {isConnected ? '⚡ Live Updates Active' : '🔌 Connecting...'}
                </div>
                <div className="text-xs opacity-80">
                  {isConnected ? 'Real-time data streaming' : 'Establishing connection'}
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          {!connected && (
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-8 max-w-2xl mx-auto border border-white/20 shadow-2xl">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                Ready to Start Trading?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Connect your wallet to access advanced trading features and create automated trading chains.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Supported wallets: Phantom, Solflare, Ledger & more
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-20 relative z-10">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-96 space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Loading Your Trading Dashboard
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Fetching your trading chains and portfolio data...
              </p>
            </div>
          </div>
        ) : (
          <EnhancedTradingInterface
            chains={chains}
            onCreateChain={handleCreateChain}
            onDeleteChain={handleDeleteChain}
            onStartTrading={handleStartTrading}
            loading={loadingAdd}
          />
        )}
      </main>

      {/* Features Section */}
      {!connected && (
        <section className="py-20 px-4 relative z-10">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: "⚡",
                  title: "Lightning Fast",
                  description: "Execute trades in milliseconds with our optimized infrastructure"
                },
                {
                  icon: "🔗",
                  title: "Chain Trading",
                  description: "Create complex trading sequences with multiple tokens and conditions"
                },
                {
                  icon: "🛡️",
                  title: "Secure & Safe",
                  description: "Bank-level security with comprehensive risk management"
                }
              ].map((feature, index) => (
                <div key={index} className="group">
                  <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}