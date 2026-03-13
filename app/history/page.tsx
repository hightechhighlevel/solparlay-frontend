'use client'

import React, { useEffect, useState } from 'react'
import { 
  History as HistoryIcon, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Pause, 
  Play, 
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  Calendar,
  Wallet,
  ArrowRight,
  BarChart3,
  Eye,
  AlertCircle,
  Zap
} from 'lucide-react'
import axios from "axios"
import { useWallet } from '@solana/wallet-adapter-react'
import Header from "../components/Header/Header"
import PopupDialog from "../components/PopupDialog"
import WalletNotConnectedPopup from '../components/WalletNotConnectedPopup/WalletNotConnectedPopup'
import InstallPhantomPopup from '../components/InstallPhantomPopup/InstallPhantomPopup'

type ChainHistory = {
  id: number
  firstTokenAmount: string
  chain: string
  status: string
  timestamp: string
}

type StatusFilter = 'all' | 'waiting' | 'trading' | 'trading finished' | 'failed' | 'pending'

const statusConfig = {
  'waiting': { 
    icon: Clock, 
    color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700',
    label: 'Waiting'
  },
  'trading': { 
    icon: Activity, 
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700',
    label: 'Trading'
  },
  'trading finished': { 
    icon: CheckCircle, 
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700',
    label: 'Completed'
  },
  'failed': { 
    icon: XCircle, 
    color: 'text-red-600 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700',
    label: 'Failed'
  },
  'pending': { 
    icon: Pause, 
    color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700',
    label: 'Pending'
  }
}

const formatTimeAgo = (timestamp: string) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now.getTime() - time.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return `${minutes}m ago`
}

const formatChainDisplay = (chain: string) => {
  const tokens = chain.split(' → ')
  return tokens.map((token, index) => (
    <span key={index} className="inline-flex items-center">
      <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-lg font-medium">
        {token}
      </span>
      {index < tokens.length - 1 && (
        <ArrowRight className="w-3 h-3 mx-2 text-slate-400" />
      )}
    </span>
  ))
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['pending']
  const Icon = config.icon
  
  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${config.color} text-sm font-medium`}>
      <Icon className="w-4 h-4" />
      <span>{config.label}</span>
    </div>
  )
}

export default function History() {
  const [historyData, setHistoryData] = useState<ChainHistory[]>([])
  const [filteredData, setFilteredData] = useState<ChainHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [msgContent, setMsgContent] = useState(['', ''])
  const [isNotConnectedPopup, setIsNotConnectedPopup] = useState(false)
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [limit, setLimit] = useState(20)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  const { publicKey, connected } = useWallet()

  const fetchHistoryData = async () => {
    if (!publicKey || !connected) {
      setIsNotConnectedPopup(true)
      setHistoryData([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      setIsNotConnectedPopup(false)
      
      const backendURL = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:5000'
      const url = `${backendURL}/api/chains/getContacts?wallet=${publicKey.toString()}&limit=${limit}`
      
      console.log('Fetching history from:', url)
      
      const response = await axios.get(url, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      })
      
      if (response.data && Array.isArray(response.data)) {
        setHistoryData(response.data)
        setLastUpdated(new Date())
          } else {
        setHistoryData([])
          }
        } catch (error) {
      console.error('Error fetching history data:', error)
      setError('Failed to load trading history. Please try again.')
      setHistoryData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistoryData()
  }, [publicKey, connected, limit])

  // Filter data based on search term and status
  useEffect(() => {
    let filtered = historyData

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.chain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.firstTokenAmount.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    setFilteredData(filtered)
  }, [historyData, searchTerm, statusFilter])

  // Auto-refresh every 30 seconds when connected
  useEffect(() => {
    if (!connected || !publicKey) return

    const interval = setInterval(() => {
      if (!loading) {
        fetchHistoryData()
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [connected, publicKey, loading, limit])

  const getStatusCounts = () => {
    const counts = {
      all: historyData.length,
      waiting: 0,
      trading: 0,
      'trading finished': 0,
      failed: 0,
      pending: 0
    }

    historyData.forEach(item => {
      if (counts.hasOwnProperty(item.status)) {
        counts[item.status as keyof typeof counts]++
      }
    })

    return counts
  }

  const statusCounts = getStatusCounts()

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/50 shadow-xl text-center">
            <Wallet className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Connect your wallet to view your trading history and track your performance.
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <Header />
      
      {isNotConnectedPopup && (
        <WalletNotConnectedPopup onClose={() => setIsNotConnectedPopup(false)} />
      )}
      
      {msgContent[0] !== '' && (
        <PopupDialog 
          title={msgContent[0]} 
          msg={msgContent[1]} 
          onClose={() => setMsgContent(['', ''])} 
        />
      )}
      
      {!isPhantomInstalled && (
        <InstallPhantomPopup onClose={() => setIsPhantomInstalled(true)} />
      )}

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <HistoryIcon className="w-12 h-12 text-blue-500" />
            <h1 className="text-5xl font-black bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Trading History
            </h1>
            <BarChart3 className="w-12 h-12 text-purple-500" />
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Track your automated trading chains, monitor performance, and analyze your trading patterns.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl text-center">
            <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{statusCounts.all}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Chains</p>
          </div>
          
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{statusCounts['trading finished']}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
          </div>
          
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl text-center">
            <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{statusCounts.trading}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Active</p>
          </div>
          
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl text-center">
            <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{statusCounts.waiting + statusCounts.pending}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl space-y-6">
          {/* Top Row - Refresh and Last Updated */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                <Wallet className="w-4 h-4" />
                <span>Wallet: {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-4)}</span>
              </div>
              
              {lastUpdated && (
                <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Updated {formatTimeAgo(lastUpdated.toISOString())}</span>
                </div>
              )}
            </div>
            
            <button
              onClick={fetchHistoryData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Updating...' : 'Refresh'}</span>
            </button>
          </div>

          {/* Second Row - Search and Filters */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search chains, status, or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-4 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10 items</option>
                <option value={20}>20 items</option>
                <option value={50}>50 items</option>
                <option value={100}>100 items</option>
              </select>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-200 dark:border-slate-600">
              {Object.entries(statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status as StatusFilter)
                    setShowFilters(false)
                  }}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 text-sm ${
                    statusFilter === status
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span className="capitalize">{status === 'all' ? 'All' : status.replace('trading finished', 'Completed')}</span>
                    <span className="text-xs opacity-75">({count})</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-2xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 font-medium mb-4">{error}</p>
            <button
              onClick={fetchHistoryData}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-12 border border-white/20 dark:border-slate-700/50 shadow-xl">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">Loading your trading history...</p>
            </div>
          </div>
        )}

        {/* History Content */}
        {!loading && !error && (
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Your Trading Chains
                </h2>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {filteredData.length} of {historyData.length} chains
                </div>
              </div>
            </div>

            {filteredData.length === 0 ? (
              <div className="p-12 text-center">
                <HistoryIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-xl font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {historyData.length === 0 ? 'No trading history yet' : 'No chains match your filters'}
                </p>
                <p className="text-slate-500 dark:text-slate-500">
                  {historyData.length === 0 
                    ? 'Start creating trading chains to see your history here.' 
                    : 'Try adjusting your search terms or filters.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredData.map((item, index) => (
                  <div key={item.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      {/* Left Section - Chain Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                              #{index + 1}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <StatusBadge status={item.status} />
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatTimeAgo(item.timestamp)}</span>
                                <span>•</span>
                                <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Trading Chain</p>
                            <div className="flex items-center space-x-1 text-sm text-slate-500 dark:text-slate-400">
                              <DollarSign className="w-4 h-4" />
                              <span>{item.firstTokenAmount}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {formatChainDisplay(item.chain)}
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            // TODO: Implement view details functionality
                            setMsgContent(['Chain Details', `Detailed view for chain ${item.id} coming soon!`])
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Details</span>
                        </button>
                      </div>
                    </div>
                    </div>
                  ))}
                </div>
            )}
        </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl border-t border-white/20 dark:border-slate-700/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              © 2025 SolParlay | Automate your Solana trading strategy
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}