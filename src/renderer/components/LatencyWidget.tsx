// src/renderer/src/components/LatencyWidget.tsx

import React, { useState, useEffect } from 'react'
import { audioEngine } from '../lib/audio/audioEngine'

/**
 * @file LatencyWidget.tsx
 * @description A minimal widget to display Web Audio API latency info.
 */

interface LatencyWidgetProps {
  isVisible: boolean
}

export const LatencyWidget: React.FC<LatencyWidgetProps> = ({ isVisible }) => {

  const [latency, setLatency] = useState<{ base: number, output: number } | null>(null);

  useEffect(() => {
    let interval;
    if (isVisible) {
      setInterval(() => {
        const info = audioEngine.getLatencyInfo()

        setLatency({
          base: (info?.baseLatency ?? 0) * 1000,
          output: (info?.outputLatency ?? 0) * 1000
        });

      }, 100);
    }

    return () => {
      clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible || !latency) {
    return null
  }

  return (
    <div className="latency-widget flex flex-col text-xs">
      <div>Latency (audio)</div>
      <div><b>Base:</b> {(latency.base).toFixed(2)} ms</div>
      <div><b>Output:</b> {(latency.output).toFixed(2)} ms</div>
    </div>
  )
}
