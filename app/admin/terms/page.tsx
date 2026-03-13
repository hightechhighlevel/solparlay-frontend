'use client'

import React, { useState, useEffect } from 'react'
import Header from '../../components/Header/Header'

interface TermsVersion {
  _id: string;
  version: string;
  title: string;
  effectiveDate: string;
  isActive: boolean;
  changesSummary: string;
  createdBy: string;
  metadata: {
    wordCount: number;
    sectionCount: number;
    lastUpdated: string;
  };
}

interface TermsStatistics {
  totalVersions: number;
  activeVersions: number;
  totalAcceptances: number;
  uniqueUsers: number;
  recentAcceptances: number;
  acceptanceByMethod: Record<string, number>;
}

export default function TermsAdminDashboard() {
  const [versions, setVersions] = useState<TermsVersion[]>([]);
  const [statistics, setStatistics] = useState<TermsStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Fetch terms versions
  const fetchVersions = async (page = 1) => {
    try {
      const response = await fetch(`${API_URL}/api/terms/versions?page=${page}&limit=10&includeInactive=true`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setVersions(result.data);
          setTotalPages(result.pagination.totalPages);
          setCurrentPage(result.pagination.currentPage);
        }
      }
    } catch (err) {
      console.error('Error fetching versions:', err);
      setError('Failed to fetch terms versions');
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/terms/statistics`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStatistics(result.data);
        }
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchVersions(), fetchStatistics()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-purple-100 dark:from-gray-900 dark:to-purple-900 font-sans">
        <Header />
        <main className="container mx-auto p-4">
          <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white rounded-none p-8 shadow-[8px_8px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <span className="ml-4 text-lg dark:text-white">Loading admin dashboard...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-purple-100 dark:from-gray-900 dark:to-purple-900 font-sans">
      <Header />
      <main className="container mx-auto p-4">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white rounded-none p-8 shadow-[8px_8px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-purple-600 dark:text-white">
                🛠️ Terms Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage terms and conditions versions and track user acceptances
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.href = '/admin/terms/create'}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 border-4 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] transition-all"
              >
                + Create New Version
              </button>
              <div className="bg-red-100 dark:bg-red-900 px-4 py-2 rounded-full">
                <span className="text-red-800 dark:text-red-200 font-bold">⚠️ ADMIN ONLY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 max-w-7xl mx-auto">
            <div className="bg-blue-100 dark:bg-blue-900 border-4 border-black dark:border-white rounded-none p-6 shadow-[4px_4px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
              <div className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-2">
                {statistics.totalVersions}
              </div>
              <div className="text-blue-600 dark:text-blue-400 font-semibold">Total Versions</div>
            </div>
            
            <div className="bg-green-100 dark:bg-green-900 border-4 border-black dark:border-white rounded-none p-6 shadow-[4px_4px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
              <div className="text-3xl font-bold text-green-800 dark:text-green-200 mb-2">
                {statistics.totalAcceptances}
              </div>
              <div className="text-green-600 dark:text-green-400 font-semibold">Total Acceptances</div>
            </div>
            
            <div className="bg-purple-100 dark:bg-purple-900 border-4 border-black dark:border-white rounded-none p-6 shadow-[4px_4px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
              <div className="text-3xl font-bold text-purple-800 dark:text-purple-200 mb-2">
                {statistics.uniqueUsers}
              </div>
              <div className="text-purple-600 dark:text-purple-400 font-semibold">Unique Users</div>
            </div>
            
            <div className="bg-yellow-100 dark:bg-yellow-900 border-4 border-black dark:border-white rounded-none p-6 shadow-[4px_4px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
              <div className="text-3xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                {statistics.recentAcceptances}
              </div>
              <div className="text-yellow-600 dark:text-yellow-400 font-semibold">Last 30 Days</div>
            </div>
          </div>
        )}

        {/* Terms Versions Table */}
        <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white rounded-none shadow-[8px_8px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] max-w-7xl mx-auto">
          <div className="p-6 border-b-4 border-black dark:border-white">
            <h2 className="text-2xl font-bold text-purple-600 dark:text-white mb-2">
              📋 Terms Versions
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              All versions of terms and conditions with their status and metadata
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white border-r-2 border-gray-300 dark:border-gray-600">
                    Version
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white border-r-2 border-gray-300 dark:border-gray-600">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white border-r-2 border-gray-300 dark:border-gray-600">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white border-r-2 border-gray-300 dark:border-gray-600">
                    Effective Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white border-r-2 border-gray-300 dark:border-gray-600">
                    Metadata
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">
                    Created By
                  </th>
                </tr>
              </thead>
              <tbody>
                {versions.map((version, index) => (
                  <tr key={version._id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}>
                    <td className="px-6 py-4 border-r-2 border-gray-200 dark:border-gray-600">
                      <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {version.version}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-r-2 border-gray-200 dark:border-gray-600">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {version.title}
                      </div>
                      {version.changesSummary && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {version.changesSummary}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 border-r-2 border-gray-200 dark:border-gray-600">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        version.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {version.isActive ? '✅ Active' : '⏸️ Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-r-2 border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white">
                      {formatDate(version.effectiveDate)}
                    </td>
                    <td className="px-6 py-4 border-r-2 border-gray-200 dark:border-gray-600">
                      <div className="text-xs space-y-1">
                        <div className="text-gray-600 dark:text-gray-400">
                          📄 {version.metadata?.sectionCount} sections
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          📝 ~{version.metadata?.wordCount} words
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          🕒 {formatDate(version.metadata?.lastUpdated)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {version.createdBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t-4 border-black dark:border-white">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchVersions(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 border-2 border-black shadow-[2px_2px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] transition-all disabled:shadow-none"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchVersions(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 border-2 border-black shadow-[2px_2px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] transition-all disabled:shadow-none"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Acceptance Methods Chart */}
        {statistics && (
          <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white rounded-none p-6 shadow-[8px_8px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] max-w-7xl mx-auto mt-8">
            <h3 className="text-xl font-bold text-purple-600 dark:text-white mb-4">
              📊 Acceptance Methods
            </h3>
            <div className="space-y-3">
              {Object.entries(statistics.acceptanceByMethod).map(([method, count]) => (
                <div key={method} className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300 capitalize">
                    {method.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-4 w-32 overflow-hidden">
                      <div 
                        className="bg-purple-600 h-full transition-all duration-500"
                        style={{ width: `${(count / statistics.totalAcceptances) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-purple-600 dark:text-purple-400 min-w-[3rem] text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t-4 border-black dark:border-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p className="font-bold dark:text-white">© 2025 solparlay | Admin Dashboard</p>
        </div>
      </footer>
    </div>
  )
}