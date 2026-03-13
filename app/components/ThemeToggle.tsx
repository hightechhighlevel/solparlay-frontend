'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state while component mounts
  if (!mounted) {
    return (
      <button
        className="p-3 rounded-2xl bg-white/20 dark:bg-slate-800/30 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-slate-700/50 transition-all duration-200 hover:scale-105"
        aria-label="Theme toggle loading"
        disabled
      >
        <div className="w-5 h-5 animate-pulse bg-gray-400 dark:bg-gray-600 rounded-full" />
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative p-3 rounded-2xl bg-white/20 dark:bg-slate-800/30 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 group border border-white/10 dark:border-slate-700/50"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      type="button"
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`absolute inset-0 w-5 h-5 text-amber-500 transition-all duration-300 ${
            isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`} 
        />
        <Moon 
          className={`absolute inset-0 w-5 h-5 text-blue-400 transition-all duration-300 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`} 
        />
      </div>
      
      {/* Enhanced visual feedback */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      
      {/* Active state indicator */}
      <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full transition-all duration-300 ${
        isDark ? 'bg-blue-400' : 'bg-amber-500'
      }`} />
    </button>
  );
}