'use client'

import React, { useEffect, useState } from 'react'
import { Trophy, Medal, Award, Clock, TrendingUp, DollarSign, Users, RefreshCw, Filter, Search, ChevronDown, Crown, Star, Zap } from 'lucide-react'
import axios from "axios"
import Header from "../components/Header/Header"
import PopupDialog from "../components/PopupDialog"
import InstallPhantomPopup from '../components/InstallPhantomPopup/InstallPhantomPopup'

type LeaderboardEntry = {
  id: number
  wallet: string
  chain: string
  profit: number
  percentGain: number
  timestamp: string
}

type TimeFilter = '5mins' | '1hr' | '6hrs' | '12hrs' | '24hrs' | '3days'
type RankingMetric = 'profit' | 'percentGain'

const timeFilterOptions = [
  { key: '5mins' as TimeFilter, label: '5 Minutes', hours: 0 },
  { key: '1hr' as TimeFilter, label: '1 Hour', hours: 1 },
  { key: '6hrs' as TimeFilter, label: '6 Hours', hours: 6 },
  { key: '12hrs' as TimeFilter, label: '12 Hours', hours: 12 },
  { key: '24hrs' as TimeFilter, label: '24 Hours', hours: 24 },
  { key: '3days' as TimeFilter, label: '3 Days', hours: 72 }
]

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-500" />
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />
    case 3:
      return <Award className="w-6 h-6 text-amber-600" />
    default:
      return <div className="w-6 h-6 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-bold">{rank}</div>
  }
}

const formatWalletAddress = (address: string) => {
  if (!address) return 'Unknown'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
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

export default function Leaderboard() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('24hrs')
  const [rankingMetric, setRankingMetric] = useState<RankingMetric>('profit')
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [msgContent, setMsgContent] = useState(['', ''])
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const timeOption = timeFilterOptions.find(opt => opt.key === timeFilter)
      const timeValue = timeOption?.hours || 24
      const rankMode = rankingMetric === 'profit' ? 1 : 0
      
      const backendURL = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:5000'
      const url = `${backendURL}/api/chains/getLeaderboard?hour=${timeValue}&rankmode=${rankMode}&limit=20`
      
      console.log('Fetching leaderboard from:', url)
      
      const response = await axios.get(url, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      })
      
      if (response.data && Array.isArray(response.data)) {
        setLeaderboardData(response.data)
        setLastUpdated(new Date())
      } else {
        setLeaderboardData([])
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error)
      setError('Failed to load leaderboard data. Please try again.')
      setLeaderboardData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboardData()
  }, [timeFilter, rankingMetric])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchLeaderboardData()
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [timeFilter, rankingMetric, loading])

  const filteredData = leaderboardData.filter(entry =>
    entry.wallet.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.chain.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const currentTimeOption = timeFilterOptions.find(opt => opt.key === timeFilter)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <Header />
      
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
            <Trophy className="w-12 h-12 text-yellow-500" />
            <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Leaderboard
            </h1>
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Top performers in automated trading chains. See who's making the biggest gains with SolParlay.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Traders</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{leaderboardData.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Profit</p>
                <p className="text-2xl font-bold text-green-600">
                  ${leaderboardData.reduce((sum, entry) => sum + entry.profit, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
            <div className="flex items-center space-x-3">
              <Zap className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Best Performer</p>
                <p className="text-2xl font-bold text-purple-600">
                  {leaderboardData[0] ? `+${leaderboardData[0].percentGain.toFixed(1)}%` : '0%'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl space-y-6">
          {/* Top Row - Ranking Metric and Refresh */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 p-1 rounded-xl">
                <button
                  onClick={() => setRankingMetric('profit')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    rankingMetric === 'profit'
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Profit
                </button>
                <button
                  onClick={() => setRankingMetric('percentGain')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    rankingMetric === 'percentGain'
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  % Gain
                </button>
              </div>
              
              {lastUpdated && (
                <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Updated {formatTimeAgo(lastUpdated.toISOString())}</span>
                </div>
              )}
            </div>
            
            <button
              onClick={fetchLeaderboardData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
                placeholder="Search wallet or chain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Time Filter</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Time Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-200 dark:border-slate-600">
              {timeFilterOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => {
                    setTimeFilter(option.key)
                    setShowFilters(false)
                  }}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    timeFilter === option.key
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-2xl p-6 text-center">
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            <button
              onClick={fetchLeaderboardData}
              className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
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
              <p className="text-slate-600 dark:text-slate-400 font-medium">Loading leaderboard...</p>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        {!loading && !error && (
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Top Performers - {currentTimeOption?.label}
                </h2>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {filteredData.length} traders
                </div>
              </div>
            </div>

            {filteredData.length === 0 ? (
              <div className="p-12 text-center">
                <Trophy className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-xl font-medium text-slate-600 dark:text-slate-400 mb-2">
                  No traders found
                </p>
                <p className="text-slate-500 dark:text-slate-500">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Be the first to make some gains!'}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">Rank</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">Trader</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">Chain</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">Profit</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">% Gain</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {filteredData.map((entry, index) => (
                        <tr 
                          key={entry.id} 
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              {getRankIcon(index + 1)}
                              <span className="font-bold text-slate-900 dark:text-white">#{index + 1}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {entry.wallet.slice(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                                  {formatWalletAddress(entry.wallet)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <p className="text-sm text-slate-600 dark:text-slate-400 truncate" title={entry.chain}>
                                {entry.chain}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              <span className="font-bold text-green-600">
                                {entry.profit > 0 ? '+' : ''}{entry.profit.toFixed(2)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <TrendingUp className="w-4 h-4 text-emerald-500" />
                              <span className="font-bold text-emerald-600">
                                {entry.percentGain > 0 ? '+' : ''}{entry.percentGain.toFixed(2)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                {formatTimeAgo(entry.timestamp)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredData.map((entry, index) => (
                    <div key={entry.id} className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getRankIcon(index + 1)}
                          <span className="font-bold text-lg text-slate-900 dark:text-white">#{index + 1}</span>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-green-600 font-bold">
                            <DollarSign className="w-4 h-4" />
                            <span>{entry.profit > 0 ? '+' : ''}{entry.profit.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-emerald-600 font-bold text-sm">
                            <TrendingUp className="w-3 h-3" />
                            <span>{entry.percentGain > 0 ? '+' : ''}{entry.percentGain.toFixed(2)}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs">
                              {entry.wallet.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
                            {formatWalletAddress(entry.wallet)}
                          </span>
                        </div>
                        
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Trading Chain</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 break-all">
                            {entry.chain}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span>{formatTimeAgo(entry.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
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