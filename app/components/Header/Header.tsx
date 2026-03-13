'use client'

// import React, { useEffect, useState, useLayoutEffect } from 'react'
import React, { useState } from 'react'
import Link from 'next/link'
// import { Menu, X, ChevronDown, LogOut, Wallet } from 'lucide-react'
import { Menu, X } from 'lucide-react'
// import { Button } from "../ui/button"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "../ui/dropdown-menu"
// import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import './index.css';
import ThemeToggle from '../ThemeToggle';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { connected, connecting, publicKey } = useWallet()

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  // useLayoutEffect(() => {
  //   const walletConnectBtn = document.getElementsByClassName('wallet-adapter-button')[0];
  //   if (walletConnectBtn) {
  //     const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  //     svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  //     svgElement.setAttribute("width", "24");
  //     svgElement.setAttribute("height", "24");
  //     svgElement.setAttribute("viewBox", "0 0 24 24");
  //     svgElement.setAttribute("fill", "none");
  //     svgElement.setAttribute("stroke", "currentColor");
  //     svgElement.setAttribute("stroke-width", "2");
  //     svgElement.setAttribute("stroke-linecap", "round");
  //     svgElement.setAttribute("stroke-linejoin", "round");
  //     svgElement.classList.add("lucide", "lucide-wallet", "mr-2", "h-4", "w-4");

  //     // Create the paths for the SVG
  //     const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  //     path1.setAttribute("d", "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1");
  //     svgElement.appendChild(path1);

  //     const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  //     path2.setAttribute("d", "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4");
  //     svgElement.appendChild(path2);

  //     // Create the text node
  //     const textNode = document.createTextNode("Connect Wallet");

  //     // Append the SVG and text to the button
  //     walletConnectBtn.appendChild(svgElement);
  //     walletConnectBtn.appendChild(textNode);
  //   }
  // }, []);

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/20 shadow-2xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link 
            href="/" 
            className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent hover:scale-105 transition-all duration-300 animate-gradient-x tracking-tight"
          >
            SolParlay
          </Link>
          
          <nav className="hidden lg:flex flex-grow justify-center">
            <div className="flex space-x-1 bg-white/20 dark:bg-slate-800/30 rounded-2xl p-2 backdrop-blur-sm">
              {[
                { href: '/', label: 'Home', icon: '🏠' },
                { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
                { href: '/history', label: 'History', icon: '📊' },
                { href: '/contact', label: 'Contact', icon: '💬' },
                { href: '/ts-and-cs', label: 'Terms', icon: '📋' }
              ].map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  className="group relative px-4 py-2 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:bg-white/50 dark:hover:bg-slate-700/50"
                >
                  <span className="flex items-center space-x-2">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                </Link>
              ))}
            </div>
          </nav>
          
          <div className="flex items-center space-x-4">
            {/* Enhanced Wallet Status */}
            {connected && publicKey && (
              <div className="hidden sm:flex items-center space-x-3 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 px-4 py-2 rounded-2xl border border-emerald-200 dark:border-emerald-700">
                <div className="relative">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
                </div>
                <div className="text-emerald-800 dark:text-emerald-200">
                  <div className="text-xs font-medium">Connected</div>
                  <div className="text-xs font-mono opacity-80">
                    {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                  </div>
                </div>
              </div>
            )}
            
            <WalletMultiButton className="btn-hover-lift !bg-gradient-to-r !from-blue-600 !to-purple-600 hover:!from-blue-700 hover:!to-purple-700 !text-white !font-semibold !py-3 !px-6 !rounded-2xl !border-0 !transition-all !duration-200 !shadow-lg hover:!shadow-xl" />
            
            <ThemeToggle />
            
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-3 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-2xl transition-all duration-200 hover:scale-105"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Enhanced Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-6 pb-4 animate-fade-in">
            <div className="flex flex-col space-y-3 bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              {[
                { href: '/', label: 'Home', icon: '🏠' },
                { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
                { href: '/history', label: 'History', icon: '📊' },
                { href: '/contact', label: 'Contact', icon: '💬' },
                { href: '/ts-and-cs', label: 'Terms & Conditions', icon: '📋' }
              ].map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 py-3 px-4 rounded-xl hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Mobile Wallet Status */}
              {connected && publicKey && (
                <div className="flex items-center space-x-3 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-700 mt-4">
                  <div className="relative">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
                  </div>
                  <div className="text-emerald-800 dark:text-emerald-200">
                    <div className="text-sm font-semibold">Wallet Connected</div>
                    <div className="text-xs font-mono opacity-80">
                      {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header