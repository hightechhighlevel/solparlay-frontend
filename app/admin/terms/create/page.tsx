'use client'

import React, { useState } from 'react'
import Header from '../../../components/Header/Header'
import { useRouter } from 'next/navigation'

interface TermsSection {
  id: string;
  title: string;
  type: string;
  content: string;
  subsections: {
    id: string;
    title: string;
    content: string;
  }[];
}

export default function CreateTermsVersion() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    version: '',
    title: 'Solparlay Terms and Conditions',
    changesSummary: '',
    createdBy: 'Admin',
    makeActive: true,
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  const [sections, setSections] = useState<TermsSection[]>([
    {
      id: 'fees',
      title: 'Fee Structure',
      type: 'fees',
      content: 'Solparlay charges the following fees for using our platform:',
      subsections: [
        {
          id: 'platform_fees',
          title: 'Platform Fees',
          content: '• 0.033 SOL flat fee per transaction chain\n• 2% of the initial deposit amount\n• These fees help us maintain and improve our platform to provide you with the best trading experience.'
        }
      ]
    },
    {
      id: 'terms',
      title: 'Terms and Conditions',
      type: 'legal',
      content: 'By using Solparlay, you agree to the following terms and conditions:',
      subsections: [
        {
          id: 'acceptance',
          title: 'Acceptance of Terms',
          content: 'By accessing or using the Solparlay platform, you agree to be bound by these terms and conditions. If you do not agree, you may not use the platform.'
        },
        {
          id: 'user_responsibilities',
          title: 'User Responsibilities',
          content: 'Users are responsible for safeguarding their private keys and wallet credentials. Users must ensure their activities comply with applicable laws in their jurisdiction. Users acknowledge they are solely responsible for their transaction strategies and outcomes.'
        }
      ]
    }
  ]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const addSection = () => {
    const newSection: TermsSection = {
      id: `section_${Date.now()}`,
      title: 'New Section',
      type: 'legal',
      content: '',
      subsections: []
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (index: number, field: keyof TermsSection, value: any) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const addSubsection = (sectionIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex].subsections.push({
      id: `subsection_${Date.now()}`,
      title: 'New Subsection',
      content: ''
    });
    setSections(updated);
  };

  const updateSubsection = (sectionIndex: number, subsectionIndex: number, field: string, value: string) => {
    const updated = [...sections];
    updated[sectionIndex].subsections[subsectionIndex] = {
      ...updated[sectionIndex].subsections[subsectionIndex],
      [field]: value
    };
    setSections(updated);
  };

  const removeSubsection = (sectionIndex: number, subsectionIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex].subsections = updated[sectionIndex].subsections.filter((_, i) => i !== subsectionIndex);
    setSections(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        content: {
          sections: sections
        }
      };

      const response = await fetch(`${API_URL}/api/terms/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/terms');
        }, 2000);
      } else {
        throw new Error(result.details || result.error || 'Failed to create terms version');
      }

    } catch (err) {
      console.error('Error creating terms version:', err);
      setError(err instanceof Error ? err.message : 'Failed to create terms version');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-purple-100 dark:from-gray-900 dark:to-purple-900 font-sans">
        <Header />
        <main className="container mx-auto p-4">
          <div className="bg-green-50 dark:bg-green-900 border-4 border-green-400 dark:border-green-600 rounded-none p-8 shadow-[8px_8px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold mb-4 text-green-800 dark:text-green-200">
                Terms Version Created Successfully!
              </h2>
              <p className="text-green-700 dark:text-green-300 mb-6">
                Version {formData.version} has been created and is now {formData.makeActive ? 'active' : 'inactive'}.
              </p>
              <p className="text-green-600 dark:text-green-400">
                Redirecting to admin dashboard...
              </p>
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
        <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white rounded-none p-8 shadow-[8px_8px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] max-w-6xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-purple-600 dark:text-white">
                ➕ Create New Terms Version
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create a new version of the terms and conditions
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/terms')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 border-4 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] transition-all"
            >
              ← Back to Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900 border-4 border-red-400 dark:border-red-600 rounded-none p-6 shadow-[8px_8px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] max-w-6xl mx-auto mb-8">
            <div className="flex items-center gap-4">
              <span className="text-4xl">❌</span>
              <div>
                <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-1">
                  Error Creating Terms Version
                </h3>
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white rounded-none p-8 shadow-[8px_8px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-purple-600 dark:text-white">
              📋 Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2 dark:text-white">
                  Version *
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({...formData, version: e.target.value})}
                  className="w-full p-3 border-4 border-black dark:border-white rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 1.1.0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 dark:text-white">
                  Created By
                </label>
                <input
                  type="text"
                  value={formData.createdBy}
                  onChange={(e) => setFormData({...formData, createdBy: e.target.value})}
                  className="w-full p-3 border-4 border-black dark:border-white rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 dark:text-white">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 border-4 border-black dark:border-white rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 dark:text-white">
                  Effective Date
                </label>
                <input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({...formData, effectiveDate: e.target.value})}
                  className="w-full p-3 border-4 border-black dark:border-white rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="makeActive"
                  checked={formData.makeActive}
                  onChange={(e) => setFormData({...formData, makeActive: e.target.checked})}
                  className="w-5 h-5 mr-3 border-2 border-black"
                />
                <label htmlFor="makeActive" className="text-sm font-bold dark:text-white">
                  Make this version active immediately
                </label>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 dark:text-white">
                  Changes Summary
                </label>
                <textarea
                  value={formData.changesSummary}
                  onChange={(e) => setFormData({...formData, changesSummary: e.target.value})}
                  className="w-full p-3 border-4 border-black dark:border-white rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Describe what changed in this version..."
                />
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white rounded-none p-8 shadow-[8px_8px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-purple-600 dark:text-white">
                📄 Terms Sections
              </h2>
              <button
                type="button"
                onClick={addSection}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 border-4 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] transition-all"
              >
                + Add Section
              </button>
            </div>

            <div className="space-y-8">
              {sections.map((section, sectionIndex) => (
                <div key={section.id} className="border-4 border-gray-300 dark:border-gray-600 rounded-none p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Section {sectionIndex + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeSection(sectionIndex)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 border-2 border-black shadow-[2px_2px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] transition-all"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-bold mb-2 dark:text-white">
                        Section Title *
                      </label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                        className="w-full p-2 border-2 border-black dark:border-white rounded-none shadow-[2px_2px_0_0_#000] dark:shadow-[1px_1px_0_0_#fff] dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 dark:text-white">
                        Section ID
                      </label>
                      <input
                        type="text"
                        value={section.id}
                        onChange={(e) => updateSection(sectionIndex, 'id', e.target.value)}
                        className="w-full p-2 border-2 border-black dark:border-white rounded-none shadow-[2px_2px_0_0_#000] dark:shadow-[1px_1px_0_0_#fff] dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 dark:text-white">
                        Type
                      </label>
                      <select
                        value={section.type}
                        onChange={(e) => updateSection(sectionIndex, 'type', e.target.value)}
                        className="w-full p-2 border-2 border-black dark:border-white rounded-none shadow-[2px_2px_0_0_#000] dark:shadow-[1px_1px_0_0_#fff] dark:bg-gray-700 dark:text-white"
                      >
                        <option value="legal">Legal</option>
                        <option value="fees">Fees</option>
                        <option value="disclaimer">Disclaimer</option>
                        <option value="policy">Policy</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-bold mb-2 dark:text-white">
                      Section Content *
                    </label>
                    <textarea
                      value={section.content}
                      onChange={(e) => updateSection(sectionIndex, 'content', e.target.value)}
                      className="w-full p-3 border-2 border-black dark:border-white rounded-none shadow-[2px_2px_0_0_#000] dark:shadow-[1px_1px_0_0_#fff] dark:bg-gray-700 dark:text-white"
                      rows={3}
                      required
                    />
                  </div>

                  {/* Subsections */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-gray-700 dark:text-gray-300">
                        Subsections
                      </h4>
                      <button
                        type="button"
                        onClick={() => addSubsection(sectionIndex)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 border-2 border-black shadow-[2px_2px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] transition-all"
                      >
                        + Add Subsection
                      </button>
                    </div>

                    <div className="space-y-4">
                      {section.subsections.map((subsection, subsectionIndex) => (
                        <div key={subsection.id} className="bg-gray-50 dark:bg-gray-700 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-none">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-bold text-gray-600 dark:text-gray-400">
                              Subsection {subsectionIndex + 1}
                            </h5>
                            <button
                              type="button"
                              onClick={() => removeSubsection(sectionIndex, subsectionIndex)}
                              className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 border border-black shadow-[1px_1px_0_0_#000] hover:shadow-none transition-all text-xs"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold mb-1 dark:text-white">
                                Subsection Title *
                              </label>
                              <input
                                type="text"
                                value={subsection.title}
                                onChange={(e) => updateSubsection(sectionIndex, subsectionIndex, 'title', e.target.value)}
                                className="w-full p-2 border border-black dark:border-white rounded-none shadow-[1px_1px_0_0_#000] dark:bg-gray-600 dark:text-white text-sm"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold mb-1 dark:text-white">
                                Subsection ID
                              </label>
                              <input
                                type="text"
                                value={subsection.id}
                                onChange={(e) => updateSubsection(sectionIndex, subsectionIndex, 'id', e.target.value)}
                                className="w-full p-2 border border-black dark:border-white rounded-none shadow-[1px_1px_0_0_#000] dark:bg-gray-600 dark:text-white text-sm"
                              />
                            </div>
                          </div>
                          <div className="mt-3">
                            <label className="block text-xs font-bold mb-1 dark:text-white">
                              Subsection Content *
                            </label>
                            <textarea
                              value={subsection.content}
                              onChange={(e) => updateSubsection(sectionIndex, subsectionIndex, 'content', e.target.value)}
                              className="w-full p-2 border border-black dark:border-white rounded-none shadow-[1px_1px_0_0_#000] dark:bg-gray-600 dark:text-white text-sm"
                              rows={3}
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white rounded-none p-8 shadow-[8px_8px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2 text-purple-600 dark:text-white">
                  Ready to Create?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Review all information carefully before creating the new terms version.
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 border-4 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] transition-all disabled:shadow-none"
              >
                {loading ? 'Creating...' : 'Create Terms Version'}
              </button>
            </div>
          </div>
        </form>
      </main>

      <footer className="border-t-4 border-black dark:border-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p className="font-bold dark:text-white">© 2025 solparlay | Admin Dashboard</p>
        </div>
      </footer>
    </div>
  )
}