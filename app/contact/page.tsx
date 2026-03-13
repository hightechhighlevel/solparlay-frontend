'use client'

import React, { useState } from 'react'
import { 
  Mail, 
  MessageSquare, 
  Send, 
  User, 
  Wallet,
  CheckCircle,
  AlertCircle,
  Loader,
  MessageCircle,
  Bug,
  Lightbulb,
  Settings,
  Users,
  ExternalLink,
  Twitter,
  Github,
  Globe,
  Phone,
  MapPin,
  Clock
} from 'lucide-react'
import { DiscIcon as Discord } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import axios from 'axios'
import Header from '../components/Header/Header'
import PopupDialog from "../components/PopupDialog"
import InstallPhantomPopup from '../components/InstallPhantomPopup/InstallPhantomPopup'

type FormData = {
  name: string
  email: string
  walletAddress: string
  subject: string
  message: string
  category: string
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

const categories = [
  { value: 'general', label: 'General Inquiry', icon: MessageCircle, description: 'General questions and support' },
  { value: 'technical', label: 'Technical Support', icon: Settings, description: 'Technical issues and troubleshooting' },
  { value: 'trading', label: 'Trading Help', icon: Users, description: 'Trading chains and strategies' },
  { value: 'bug_report', label: 'Bug Report', icon: Bug, description: 'Report bugs and issues' },
  { value: 'feature_request', label: 'Feature Request', icon: Lightbulb, description: 'Suggest new features' },
  { value: 'partnership', label: 'Partnership', icon: Users, description: 'Business partnerships and collaboration' }
]

const socialLinks = [
  {
    name: 'Discord',
    url: 'https://discord.gg/solparlay',
    icon: Discord,
    color: 'text-indigo-600 hover:text-indigo-700',
    bgColor: 'bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/40',
    description: 'Join our community for real-time support and discussions'
  },
  {
    name: 'Twitter',
    url: 'https://twitter.com/solparlay',
    icon: Twitter,
    color: 'text-blue-600 hover:text-blue-700',
    bgColor: 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40',
    description: 'Follow us for updates and announcements'
  },
  {
    name: 'Website',
    url: 'https://solparlay.com',
    icon: Globe,
    color: 'text-green-600 hover:text-green-700',
    bgColor: 'bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/40',
    description: 'Visit our main website for more information'
  }
]

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    walletAddress: '',
    subject: '',
    message: '',
    category: 'general'
  })
  const [formStatus, setFormStatus] = useState<FormStatus>('idle')
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [msgContent, setMsgContent] = useState(['', ''])
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(true)
  
  const { publicKey, connected } = useWallet()

  // Auto-populate wallet address when connected
  React.useEffect(() => {
    if (connected && publicKey) {
      setFormData(prev => ({
        ...prev,
        walletAddress: publicKey.toString()
      }))
    }
  }, [connected, publicKey])

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be 100 characters or less'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.walletAddress && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(formData.walletAddress)) {
      newErrors.walletAddress = 'Please enter a valid Solana wallet address'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    } else if (formData.subject.length > 200) {
      newErrors.subject = 'Subject must be 200 characters or less'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.length > 2000) {
      newErrors.message = 'Message must be 2000 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setFormStatus('loading')

    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:5000'
      
      const response = await axios.post(`${backendURL}/api/contact`, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        walletAddress: formData.walletAddress.trim() || undefined,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        category: formData.category
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      })

      if (response.data.success) {
        setFormStatus('success')
        setFormData({
          name: '',
          email: '',
          walletAddress: connected && publicKey ? publicKey.toString() : '',
          subject: '',
          message: '',
          category: 'general'
        })
        
        // Show success message
        setTimeout(() => {
          setFormStatus('idle')
        }, 3000)
      }
    } catch (error: any) {
      console.error('Error submitting contact form:', error)
      setFormStatus('error')
      
      if (error.response?.data?.details) {
        setMsgContent(['Error', error.response.data.details])
      } else {
        setMsgContent(['Error', 'Failed to send message. Please try again later.'])
      }
      
      setTimeout(() => {
        setFormStatus('idle')
      }, 3000)
    }
  }

  const selectedCategory = categories.find(cat => cat.value === formData.category)

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
            <MessageSquare className="w-12 h-12 text-blue-500" />
            <h1 className="text-5xl font-black bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Contact Us
            </h1>
            <Mail className="w-12 h-12 text-purple-500" />
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Get in touch with our team. We're here to help with your trading automation needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/50 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <MessageSquare className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Send us a message</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-700/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-700/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                      }`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Wallet Address */}
                <div>
                  <label htmlFor="walletAddress" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Wallet className="w-4 h-4 inline mr-2" />
                    Wallet Address (Optional)
                    {connected && (
                      <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                        ✓ Auto-filled from connected wallet
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    id="walletAddress"
                    value={formData.walletAddress}
                    onChange={(e) => handleInputChange('walletAddress', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-700/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono text-sm ${
                      errors.walletAddress ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                    }`}
                    placeholder="Enter your Solana wallet address (optional)"
                  />
                  {errors.walletAddress && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.walletAddress}
                    </p>
                  )}
                </div>

                {/* Category Selection */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categories.map((category) => {
                      const Icon = category.icon
                      return (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => handleInputChange('category', category.value)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            formData.category === category.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                              : 'border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 hover:border-blue-300 dark:hover:border-blue-400'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <Icon className={`w-5 h-5 mt-0.5 ${
                              formData.category === category.value ? 'text-blue-600' : 'text-slate-500'
                            }`} />
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {category.label}
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                {category.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-700/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.subject ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                    }`}
                    placeholder={`Brief description of your ${selectedCategory?.label.toLowerCase()}`}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-700/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                      errors.message ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                    }`}
                    placeholder="Please provide as much detail as possible..."
                  />
                  <div className="flex justify-between items-center mt-2">
                    {errors.message ? (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.message}
                      </p>
                    ) : (
                      <div></div>
                    )}
                    <span className={`text-sm ${
                      formData.message.length > 1800 ? 'text-red-600' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {formData.message.length}/2000
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={formStatus === 'loading'}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                    formStatus === 'loading'
                      ? 'bg-slate-400 cursor-not-allowed'
                      : formStatus === 'success'
                      ? 'bg-green-500 hover:bg-green-600'
                      : formStatus === 'error'
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:scale-105'
                  } text-white shadow-lg`}
                >
                  {formStatus === 'loading' && <Loader className="w-5 h-5 animate-spin" />}
                  {formStatus === 'success' && <CheckCircle className="w-5 h-5" />}
                  {formStatus === 'error' && <AlertCircle className="w-5 h-5" />}
                  {formStatus === 'idle' && <Send className="w-5 h-5" />}
                  <span>
                    {formStatus === 'loading' && 'Sending Message...'}
                    {formStatus === 'success' && 'Message Sent Successfully!'}
                    {formStatus === 'error' && 'Failed to Send'}
                    {formStatus === 'idle' && 'Send Message'}
                  </span>
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Get in Touch</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">Response Time</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Usually within 24 hours</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MessageCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">Live Support</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Join our Discord for real-time help</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Globe className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">Available 24/7</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Our platform runs around the clock</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Connect With Us</h3>
              
              <div className="space-y-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 ${social.bgColor} group`}
                    >
                      <Icon className={`w-6 h-6 ${social.color}`} />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-white group-hover:underline">
                          {social.name}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {social.description}
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                    </a>
                  )
                })}
              </div>
            </div>

            {/* FAQ Link */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Quick Questions?</h3>
              <p className="text-blue-100 mb-4 text-sm">
                Check our documentation and FAQ section for instant answers to common questions.
              </p>
              <button className="w-full py-2 px-4 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors">
                View Documentation
              </button>
            </div>
          </div>
        </div>
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