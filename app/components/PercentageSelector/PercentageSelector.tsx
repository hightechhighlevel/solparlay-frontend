'use client'

import React from 'react'
import { Button } from '../ui/button'

interface PercentageSelectorProps {
  onSelect: (percentage: number) => void
}

const PercentageSelector: React.FC<PercentageSelectorProps> = ({ onSelect }) => {
  const presetPercentages = [
    { label: '-50%', value: -50, color: 'destructive' },
    { label: '-25%', value: -25, color: 'destructive' },
    { label: '-10%', value: -10, color: 'destructive' },
    { label: '+5%', value: 5, color: 'secondary' },
    { label: '+10%', value: 10, color: 'secondary' },
    { label: '+25%', value: 25, color: 'success' },
    { label: '+50%', value: 50, color: 'success' },
    { label: '+100%', value: 100, color: 'success' },
  ]

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">Quick select:</p>
      <div className="grid grid-cols-4 gap-2">
        {presetPercentages.map((preset) => (
          <Button
            key={preset.value}
            onClick={() => onSelect(preset.value)}
            variant={preset.color as any}
            size="sm"
            className="text-xs h-7"
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

export default PercentageSelector