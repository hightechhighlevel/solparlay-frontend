import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Type definitions
export interface DexTokenType {
  chainId: string;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
  extensions?: Record<string, any>;
}

export interface Token {
  token: string;
  amount: string;
  threshold: string;
  currentPrice: number;
  address?: string;
  decimals?: number;
}

export interface ChainType {
  _id: string;
  walletAddress: string;
  status: 'pending' | 'trading' | 'completed' | 'failed';
  message: string;
  currentStep: number;
  createdAt: string;
  updatedAt?: string;
  chain: Token[];
  totalInvestment?: number;
  currentValue?: number;
  profitLoss?: number;
}

export interface WebSocketMessage {
  type: string;
  message?: string;
  data?: any;
  timestamp?: string;
  chainId?: string;
  status?: string;
}

// Utility functions
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatWalletAddress(address: string, startChars = 4, endChars = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export function formatNumber(num: number, decimals = 2): string {
  if (num === 0) return '0';
  if (num < 0.01 && num > 0) return '<0.01';
  if (num >= 1000000) return `${(num / 1000000).toFixed(decimals)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(decimals)}K`;
  return num.toFixed(decimals);
}

export function formatPrice(price: number): string {
  if (price === 0) return '$0.00';
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

export function getTokenDecimal(tokenName: string): number {
  const tokenDecimals: { [key: string]: number } = {
    'SOL': 9,
    'USDC': 6,
    'USDT': 6,
    'BONK': 5,
    'WIF': 6,
    'JUP': 6,
    'RAY': 6,
    'SRM': 6,
    'FIDA': 6,
    'COPE': 6,
    'STEP': 9,
    'MEDIA': 6,
    'ROPE': 9,
    'MER': 6,
    'BONFIDA': 6,
    // Add more tokens as needed
  };
  
  return tokenDecimals[tokenName.toUpperCase()] || 9; // Default to 9 decimals
}

export function calculatePotentialProfit(chain: ChainType): number {
  let amount = parseFloat(chain.chain[0]?.amount || '0') * (chain.chain[0]?.currentPrice || 0);
  chain.chain.forEach(token => {
    amount *= (1 + parseFloat(token.threshold || '0') / 100);
  });
  return amount;
}

export function getChainProgress(chain: ChainType): number {
  return (chain.currentStep / chain.chain.length) * 100;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
    case 'trading':
      return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
    case 'completed':
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
    case 'failed':
      return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
  }
}

export function validateTokenAmount(amount: string): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
}

export function validateThreshold(threshold: string): boolean {
  const num = parseFloat(threshold);
  return !isNaN(num) && num >= -100 && num <= 1000; // Allow -100% to 1000%
}

export function sanitizeTokenName(tokenName: string): string {
  return tokenName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}