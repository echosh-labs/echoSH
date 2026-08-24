'use client';

import React, { useState } from "react";
import { Terminal } from "lucide-react";

interface KeystrokePadProps {
  onKeystroke: (char: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
}

export function KeystrokePad({ onKeystroke, onBackspace, onEnter }: KeystrokePadProps) {
  const [typedChars, setTypedChars] = useState<string>("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      onBackspace();
      setTypedChars((prev) => prev.slice(0, -1));
    } else if (e.key === "Enter") {
      onEnter();
      setTypedChars("");
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      onKeystroke(e.key);
      setTypedChars((prev) => (prev + e.key).slice(-30));
    }
  };

  return (
    <div className="rounded-2xl bg-mercury-900/40 border border-slate-800 p-5 flex flex-col justify-between backdrop-blur-md">
      <div>
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <span className="flex items-center gap-1.5 font-medium">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            Live Synesthetic Keystroke Tester
          </span>
          <span className="text-[11px] text-slate-500">250Hz - 1200Hz Dynamic Range</span>
        </div>
        <input
          type="text"
          placeholder="Type anything here to test real-time keystroke pitch synthesis..."
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-3 rounded-xl bg-mercury-950/90 border border-slate-700/80 text-sm font-mono text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 shadow-inner"
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <div>
          Buffer: <span className="text-emerald-400 font-semibold">{typedChars || "Ready..."}</span>
        </div>
        <div className="text-slate-500">
          [Backspace] = Swoosh • [Enter] = Orbital Bell
        </div>
      </div>
    </div>
  );
}