// src/renderer/src/components/LatencyWidget.tsx

import React, { useState, useEffect } from 'react'
import { audioEngine, LatencyInfo } from '../lib/audioEngine'

/**
 * @file LatencyWidget.tsx
 * @description A minimal widget to display Web Audio API latency info.
 */

interface LatencyWidgetProps {
  isVisible: boolean
}

export const LatencyWidget: React.FC<LatencyWidgetProps> = ({ isVisible }) => {
  const [latency, setLatency] = useState<LatencyInfo | null>(null)

  useEffect(() => {
    if (!isVisible) {
      return
    }

    // Fetch latency info periodically.
    const intervalId = setInterval(() => {
      const info = audioEngine.getLatencyInfo()
      setLatency(info)
    }, 1000) // Update every second

    // Cleanup on component unmount or when it becomes invisible
    return () => clearInterval(intervalId)
  }, [isVisible])

  if (!isVisible || !latency) {
    return null
  }

  return (
    <div className="latency-widget">
      {`Latency (audio) Base: ${(latency.baseLatency * 1000).toFixed(2)} ms Output: ${(
        latency.outputLatency * 1000
      ).toFixed(2)} ms`}
    </div>
  )
}
