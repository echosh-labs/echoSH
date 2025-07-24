// src/renderer/src/components/LatencyWidget.tsx

import { useState, useEffect } from "react";
import { audioEngine } from "../lib/audio/audioEngine";

/**
 * @file LatencyWidget.tsx
 * @description A minimal widget to display Web Audio API latency info.
 */

export const LatencyWidget = () => {
  const [latency, setLatency] = useState<{ base: number; output: number } | null>(null);

  useEffect(() => {
    let interval;
    setInterval(() => {
      const info = audioEngine.getLatencyInfo();

      setLatency({
        base: (info?.baseLatency ?? 0) * 1000,
        output: (info?.outputLatency ?? 0) * 1000
      });
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (!latency) {
    return null;
  }

  return (
    <div className="latency-widget flex flex-col text-xs">
      <div>Latency (audio)</div>
      <div>
        <b>Base:</b> {latency.base.toFixed(2)} ms
      </div>
      <div>
        <b>Output:</b> {latency.output.toFixed(2)} ms
      </div>
    </div>
  );
};
