'use client'

import React, { useState, useEffect } from 'react'
import Header from '../components/Header/Header';
import PopupDialog from "../components/PopupDialog";
import InstallPhantomPopup from '../components/InstallPhantomPopup/InstallPhantomPopup';

// TypeScript declaration for Phantom wallet
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect(): Promise<{ publicKey: { toString(): string } }>;
    };
  }
}

interface TermsSection {
  id: string;
  title: string;
  type: string;
  content: string;
  subsections?: {
    id: string;
    title: string;
    content: string;
  }[];
}

interface TermsData {
  _id: string;
  version: string;
  title: string;
  content: {
    sections: TermsSection[];
  };
  effectiveDate: string;
  metadata: {
    wordCount: number;
    sectionCount: number;
    lastUpdated: string;
  };
}

export default function TermsAndConditions() {
  const [msgContent, setMsgContent] = useState(['', '']);
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(true);
  const [termsData, setTermsData] = useState<TermsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [checkingAcceptance, setCheckingAcceptance] = useState(false);
  const [acceptingTerms, setAcceptingTerms] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['fees']));

  // Fetch current terms from backend
  const fetchTerms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/terms/current`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch terms: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        setTermsData(result.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching terms:', err);
      setError(err instanceof Error ? err.message : 'Failed to load terms');
    } finally {
      setLoading(false);
    }
  };

  // Check if user has accepted current terms
  const checkTermsAcceptance = async (address: string) => {
    if (!address || !termsData) return;
    
    try {
      setCheckingAcceptance(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/terms/check/${address}?version=${termsData.version}`
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setHasAcceptedTerms(result.data.hasAccepted);
        }
      }
    } catch (err) {
      console.error('Error checking terms acceptance:', err);
    } finally {
      setCheckingAcceptance(false);
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (typeof window === "undefined" || !('solana' in window)) {
        setIsPhantomInstalled(false);
        return;
      }

      const provider = window.solana;
      if (!provider || !provider.isPhantom) {
        setIsPhantomInstalled(false);
        return;
      }

      const wallet = await provider.connect();
      const address = wallet.publicKey.toString();
      setWalletAddress(address);
      
      // Check if user has accepted terms
      await checkTermsAcceptance(address);
      
    } catch (error) {
      setMsgContent(["Error", `Failed to connect wallet. Please try again. ${error}`]);
    }
  };

  // Accept terms
  const acceptTerms = async () => {
    if (!walletAddress || !termsData) {
      setMsgContent(["Error", "Please connect your wallet first"]);
      return;
    }

    try {
      setAcceptingTerms(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/terms/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          termsVersion: termsData.version,
          acceptanceMethod: 'explicit_click'
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setHasAcceptedTerms(true);
        setMsgContent(["Success", "Terms and conditions accepted successfully!"]);
      } else {
        throw new Error(result.details || result.error || 'Failed to accept terms');
      }
      
    } catch (error) {
      console.error('Error accepting terms:', error);
      setMsgContent(["Error", `Failed to accept terms: ${error}`]);
    } finally {
      setAcceptingTerms(false);
    }
  };

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Load terms on component mount
  useEffect(() => {
    fetchTerms();
  }, []);

  // Check acceptance when wallet or terms change
  useEffect(() => {
    if (walletAddress && termsData) {
      checkTermsAcceptance(walletAddress);
    }
  }, [walletAddress, termsData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-purple-100 dark:from-gray-900 dark:to-purple-900 font-sans">
        <Header />
        <main className="container mx-auto p-4">
          <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white rounded-none p-8 shadow-[8px_8px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <span className="ml-4 text-lg dark:text-white">Loading terms and conditions...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-purple-100 dark:from-gray-900 dark:to-purple-900 font-sans">
        <Header />
        <main className="container mx-auto p-4">
          <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white rounded-none p-8 shadow-[8px_8px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-4 dark:text-white">Failed to Load Terms</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <button
                onClick={fetchTerms}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 border-4 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-purple-100 dark:from-gray-900 dark:to-purple-900 font-sans">
      <Header />
      {msgContent[0] !== '' && <PopupDialog title={msgContent[0]} msg={msgContent[1]} onClose={() => setMsgContent(['', ''])} />}
      {!isPhantomInstalled && <InstallPhantomPopup onClose={() => setIsPhantomInstalled(true)} />}
      <main className="container mx-auto p-4">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white rounded-none p-8 shadow-[8px_8px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] max-w-6xl mx-auto mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4 text-purple-600 dark:text-white">
                {termsData?.title || 'Terms and Conditions'}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="bg-purple-100 dark:bg-purple-900 px-3 py-1 rounded-full">
                  Version {termsData?.version}
                </span>
                <span className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                  Effective: {termsData?.effectiveDate ? formatDate(termsData.effectiveDate) : 'Loading...'}
                </span>
                <span className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
                  {termsData?.metadata?.sectionCount} sections
                </span>
                <span className="bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded-full">
                  ~{termsData?.metadata?.wordCount} words
                </span>
              </div>
            </div>
            
            {/* Wallet Connection & Acceptance Status */}
            <div className="flex flex-col gap-4">
              {!walletAddress ? (
                <button
                  onClick={connectWallet}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 border-4 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] transition-all"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Connected: {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                  </div>
                  {checkingAcceptance ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">Checking status...</div>
                  ) : hasAcceptedTerms ? (
                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                      <span className="text-xl">✅</span>
                      <span className="font-semibold">Terms Accepted</span>
                    </div>
                  ) : (
                    <button
                      onClick={acceptTerms}
                      disabled={acceptingTerms}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 border-4 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] transition-all disabled:shadow-none"
                    >
                      {acceptingTerms ? 'Accepting...' : 'Accept Terms'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Terms Content */}
        <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white rounded-none shadow-[8px_8px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] max-w-6xl mx-auto">
          {termsData?.content?.sections?.map((section, index) => (
            <div key={section.id} className={index > 0 ? 'border-t-4 border-black dark:border-white' : ''}>
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-purple-600 dark:text-white">
                    {section.title}
                  </h2>
                  <span className="text-3xl text-gray-400 transition-transform duration-200" 
                        style={{ transform: expandedSections.has(section.id) ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {section.type === 'legal' && '⚖️ Legal Terms'}
                  {section.type === 'fees' && '💰 Fee Information'}
                  {section.type === 'disclaimer' && '⚠️ Important Disclaimer'}
                  {section.type === 'policy' && '📋 Platform Policy'}
                </div>
              </button>
              
              {expandedSections.has(section.id) && (
                <div className="px-6 pb-6 border-t-2 border-gray-200 dark:border-gray-600">
                  <div className="mt-4 text-black dark:text-white space-y-4">
                    <p className="text-lg leading-relaxed">{section.content}</p>
                    
                    {section.subsections && section.subsections.length > 0 && (
                      <div className="space-y-6 mt-6">
                        {section.subsections.map((subsection, subIndex) => (
                          <div key={subsection.id} className="pl-4 border-l-4 border-purple-200 dark:border-purple-700">
                            <h3 className="text-xl font-bold mb-3 text-purple-600 dark:text-purple-400">
                              {subIndex + 1}. {subsection.title}
                            </h3>
                            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              {subsection.content.split('\n').map((paragraph, pIndex) => (
                                <p key={pIndex} className="mb-3">{paragraph}</p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Footer */}
        {walletAddress && !hasAcceptedTerms && (
          <div className="bg-yellow-50 dark:bg-yellow-900 border-4 border-yellow-400 dark:border-yellow-600 rounded-none p-6 shadow-[8px_8px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] max-w-6xl mx-auto mt-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                  ⚠️ Action Required
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300">
                  You must accept these terms and conditions before using the Solparlay platform. 
                  Please review all sections carefully and click "Accept Terms" when ready.
                </p>
              </div>
              <button
                onClick={acceptTerms}
                disabled={acceptingTerms}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 border-4 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] transition-all disabled:shadow-none whitespace-nowrap"
              >
                {acceptingTerms ? 'Processing...' : 'Accept Terms & Conditions'}
              </button>
            </div>
          </div>
        )}

        {hasAcceptedTerms && walletAddress && (
          <div className="bg-green-50 dark:bg-green-900 border-4 border-green-400 dark:border-green-600 rounded-none p-6 shadow-[8px_8px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] max-w-6xl mx-auto mt-8">
            <div className="flex items-center gap-4">
              <span className="text-4xl">✅</span>
              <div>
                <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-1">
                  Terms Accepted
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  You have successfully accepted version {termsData?.version} of our terms and conditions. 
                  You can now use all features of the Solparlay platform.
                </p>
              </div>
          </div>
        </div>
        )}
      </main>

      <footer className="border-t-4 border-black dark:border-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p className="font-bold dark:text-white">© 2025 solparlay | Automate your Solana trading strategy</p>
        </div>
      </footer>
    </div>
  )
}