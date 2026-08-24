'use client';

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Terminal, 
  Sparkles, 
  Music2, 
  ExternalLink, 
  Play, 
  Layers, 
  Volume2, 
  Code2, 
  Cpu, 
  ArrowLeft,
  Command,
  Disc3,
  ShieldCheck,
  Flame
} from "lucide-react";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { 
  fmCyberRhodes, 
  fmMetallicSpaceBell, 
  fmLaserSweep, 
  errorTritone,
  physicalCyberHarp,
  mercuryFundamentalBell
} from "@/lib/audio/presets";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success' | 'info';
  text: string;
}

export default function EchoSHProgenitorPage() {
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>([
    { type: 'info', text: 'echoSH v0.5.0 [Synesthetic Terminal Environment]' },
    { type: 'info', text: 'Type "help" to view custom commands or start typing to trigger real-time DSP synthesis.' },
  ]);
  const [inputVal, setInputVal] = useState<string>('');
  const [commandCount, setCommandCount] = useState<number>(0);
  const terminalBottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { playBlueprint, playUIClick, isMuted } = useAudioEngine();

  // Auto-scroll terminal
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCmd = inputVal.trim();
    if (!rawCmd) return;

    const newHistory: TerminalLine[] = [
      ...terminalHistory,
      { type: 'input', text: `justin@echosh:~$ ${rawCmd}` }
    ];

    const cmd = rawCmd.toLowerCase();
    setCommandCount(prev => prev + 1);

    if (cmd === 'help') {
      playBlueprint(fmCyberRhodes, 'Command: Help');
      newHistory.push(
        { type: 'output', text: 'AVAILABLE COMMANDS:' },
        { type: 'output', text: '  ls            - List project tree & trigger spatial chimes' },
        { type: 'output', text: '  npm install   - Simulate dependency build & trigger FM chord' },
        { type: 'output', text: '  test:error    - Simulate process crash & trigger dissonant tritone' },
        { type: 'output', text: '  resonate      - Trigger multi-oscillator planetary harmonic' },
        { type: 'output', text: '  about         - Display echoSH philosophy & genesis haiku' },
        { type: 'output', text: '  clear         - Clear terminal viewport' }
      );
    } else if (cmd === 'ls') {
      playBlueprint(physicalCyberHarp, 'Command: ls');
      newHistory.push(
        { type: 'success', text: 'drwxr-xr-x  src/renderer/audio/   [AudioEngine.ts, blueprints.ts]' },
        { type: 'success', text: 'drwxr-xr-x  src/main/             [electron.ts, window.ts]' },
        { type: 'output',  text: '-rw-r--r--  package.json          (v0.5.0-electron)' },
        { type: 'output',  text: '-rw-r--r--  README.md             (The Synesthetic Terminal)' }
      );
    } else if (cmd === 'npm install' || cmd === 'pnpm install' || cmd === 'pnpm i') {
      playBlueprint(fmMetallicSpaceBell, 'Command: npm install');
      newHistory.push(
        { type: 'info', text: 'Resolving packages with synesthetic soundscapes...' },
        { type: 'success', text: '✔ Transmuted 42 sound blueprints in 0.48s [Zero Warnings]' }
      );
    } else if (cmd === 'test:error' || cmd === 'error') {
      playBlueprint(errorTritone, 'Command: Error');
      newHistory.push(
        { type: 'error', text: 'ERR_PROCESS_EXIT [1]: Dissonant tritone feedback triggered.' }
      );
    } else if (cmd === 'resonate') {
      playBlueprint(mercuryFundamentalBell, 'Command: Resonate');
      newHistory.push(
        { type: 'success', text: 'Harmonic resonance dispatched across Web Audio 2.0 pipeline (141.27 Hz).' }
      );
    } else if (cmd === 'about') {
      playBlueprint(fmCyberRhodes, 'Command: About');
      newHistory.push(
        { type: 'info', text: '"Echoes in the shell — The power of echoSH — Code\'s new symphony."' },
        { type: 'output', text: 'Created in August 2025 by Justin Andrew Wood. Conceived as the progenitor of the Echo SH Labs ecosystem, transmuting silent keystrokes into generative auditory flow-state art.' }
      );
    } else if (cmd === 'clear') {
      setTerminalHistory([]);
      setInputVal('');
      return;
    } else {
      playBlueprint(fmLaserSweep, 'Command: Exec');
      newHistory.push(
        { type: 'output', text: `executed: ${rawCmd} (synthesized frequency generated)` }
      );
    }

    setTerminalHistory(newHistory);
    setInputVal('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    playUIClick();
  };

  return (
    <div className="min-h-screen bg-mercury-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 font-sans relative overflow-x-hidden">
      {/* Unified Top Navigation Header */}
      <Header />

      {/* Main Archival Showcase */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 z-10 space-y-12 animate-fadeIn">
        
        {/* Hero Section */}
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
            <Disc3 className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>ORIGIN ARCHIVE // THE ACOUSTIC PROGENITOR (EST. AUG 2025)</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-100 tracking-tight leading-tight">
            echoSH: The Synesthetic Terminal
          </h1>
          <p className="text-slate-400 text-sm sm:text-base font-light leading-relaxed">
            In standard computing, the terminal is a silent, visual affair. Engineered in August 2025 as a standalone Electron desktop environment, <strong className="text-slate-200 font-medium">echoSH</strong> pioneered the auditory feedback loop for software engineering—transmuting every keystroke, command, and compilation process into a unique generative sonic event.
          </p>

          {/* Haiku Callout Panel */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 max-w-lg font-serif italic text-slate-300 text-sm border-l-4 border-l-emerald-500/80">
            &ldquo;Echoes in the shell —<br />
            The power of echoSH —<br />
            Code&apos;s new symphony.&rdquo;
          </div>
        </div>

        {/* Interactive In-Browser Terminal Simulator */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>LIVE IN-BROWSER SYNESTHETIC TERMINAL SIMULATOR</span>
            </div>
            <Badge variant="emerald" size="xs">
              COMMANDS: {commandCount}
            </Badge>
          </div>

          <Panel variant="default" className="p-0 border-slate-800 bg-[#06080d] font-mono text-xs overflow-hidden shadow-2xl">
            {/* Terminal Window Header Bar */}
            <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="text-slate-400 text-[11px] ml-2">echoSH — bash — 80x24 [Web Audio DSP]</span>
              </div>
              <div className="text-[10px] text-slate-500 hidden sm:block">
                AUDIO DSP: ACTIVE
              </div>
            </div>

            {/* Terminal Viewport */}
            <div 
              className="p-5 space-y-2 min-h-[260px] max-h-[360px] overflow-y-auto cursor-text selection:bg-emerald-500/30"
              onClick={() => inputRef.current?.focus()}
            >
              {terminalHistory.map((item, idx) => (
                <div key={idx} className="leading-relaxed">
                  {item.type === 'input' && (
                    <span className="text-slate-100 font-bold">{item.text}</span>
                  )}
                  {item.type === 'output' && (
                    <span className="text-slate-400">{item.text}</span>
                  )}
                  {item.type === 'error' && (
                    <span className="text-rose-400 font-semibold">{item.text}</span>
                  )}
                  {item.type === 'success' && (
                    <span className="text-emerald-400">{item.text}</span>
                  )}
                  {item.type === 'info' && (
                    <span className="text-cyan-400">{item.text}</span>
                  )}
                </div>
              ))}

              {/* Active Prompt Form */}
              <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 pt-1">
                <span className="text-emerald-400 font-bold flex-shrink-0">justin@echosh:~$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={handleInputChange}
                  placeholder="type a command (e.g. ls, npm install, test:error, resonate, about)..."
                  className="flex-1 bg-transparent border-none outline-none text-slate-100 font-mono text-xs placeholder:text-slate-600 caret-emerald-400"
                  autoFocus
                />
              </form>
              <div ref={terminalBottomRef} />
            </div>

            {/* Terminal Command Quick Bar */}
            <div className="px-4 py-2.5 bg-black/50 border-t border-slate-900 flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span className="text-slate-500">QUICK CMDS:</span>
              <button
                type="button"
                onClick={() => { setInputVal('help'); inputRef.current?.focus(); }}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-300 transition-colors"
              >
                help
              </button>
              <button
                type="button"
                onClick={() => { setInputVal('ls'); inputRef.current?.focus(); }}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-300 transition-colors"
              >
                ls
              </button>
              <button
                type="button"
                onClick={() => { setInputVal('npm install'); inputRef.current?.focus(); }}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-300 transition-colors"
              >
                npm install
              </button>
              <button
                type="button"
                onClick={() => { setInputVal('test:error'); inputRef.current?.focus(); }}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-300 transition-colors"
              >
                test:error
              </button>
              <button
                type="button"
                onClick={() => { setInputVal('resonate'); inputRef.current?.focus(); }}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
              >
                resonate
              </button>
            </div>
          </Panel>
        </div>

        {/* Command Synthesis Blueprint Matrix */}
        <div className="space-y-4 pt-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-violet-400 font-semibold">{"//"} THE SOUND BLUEPRINT ARCHITECTURE</span>
            <h2 className="text-2xl font-serif font-bold text-slate-100">
              How Digital Actions Are Mapped to Sound
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed">
              In echoSH, sounds are never pre-recorded audio files. Every transient is synthesized mathematically at runtime using oscillator arrays, noise filters, and physical string modeling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Spec 1 */}
            <Panel variant="default" className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-slate-200 text-sm">Keystroke Resonance</span>
                <Badge variant="emerald" size="xs">ALGORITHMIC</Badge>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Karplus-Strong physical modeling algorithm generates subtle string plucks and tactile clicks mapped across harmonic intervals to reinforce typing cadence.
              </p>
              <Button
                onClick={() => playBlueprint(physicalCyberHarp, 'Keystroke Pluck')}
                variant="secondary"
                size="xs"
                className="font-mono text-[11px] w-full"
                iconLeft={<Play className="w-3 h-3 fill-current text-emerald-400" />}
              >
                Audition Pluck (Karplus)
              </Button>
            </Panel>

            {/* Spec 2 */}
            <Panel variant="default" className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-slate-200 text-sm">Command Synthesis</span>
                <Badge variant="cyan" size="xs">FM SYNTH</Badge>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                2-Operator frequency modulation generates complex metallic chimes and harmonic sweeps for navigation, build passes, and package management.
              </p>
              <Button
                onClick={() => playBlueprint(fmMetallicSpaceBell, 'FM Space Bell')}
                variant="secondary"
                size="xs"
                className="font-mono text-[11px] w-full"
                iconLeft={<Play className="w-3 h-3 fill-current text-cyan-400" />}
              >
                Audition FM Space Bell
              </Button>
            </Panel>

            {/* Spec 3 */}
            <Panel variant="default" className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-slate-200 text-sm">Dissonant Errors</span>
                <Badge variant="violet" size="xs">TRITONE</Badge>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Square-wave tritone intervals (\(\sqrt{2}\) frequency ratio) create unambiguous, immediate auditory dissonance when processes exit with non-zero error codes.
              </p>
              <Button
                onClick={() => playBlueprint(errorTritone, 'Dissonant Tritone')}
                variant="secondary"
                size="xs"
                className="font-mono text-[11px] w-full"
                iconLeft={<Play className="w-3 h-3 fill-current text-rose-400" />}
              >
                Audition Error Tritone
              </Button>
            </Panel>
          </div>
        </div>

        {/* The Evolution Story: Electron Desktop to Static Next.js Web */}
        <Panel variant="default" className="p-6 border-slate-800">
          <div className="space-y-3 max-w-3xl">
            <span className="text-xs font-mono text-emerald-400 font-semibold">{"//"} THE PROVENANCE & LINEAGE</span>
            <h3 className="text-xl font-serif font-bold text-slate-100">
              The Genesis of the Mercury Dash Web Audio Engine
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed">
              echoSH began as an experiment to make coding musical. That same procedural DSP sound engine has now been decoupled from the heavy Electron desktop wrapper and ported into modern Web Audio 2.0 running statically in the user&apos;s browser with zero latency.
            </p>
          </div>
        </Panel>

        {/* GitHub Repository Link */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-slate-900/60 border border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="text-sm font-serif font-bold text-slate-200">
                The Original Electron.js Repository
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Preserved as the foundational origin archive of the synesthetic audio engine.
              </p>
            </div>
          </div>
          <a
            href="https://github.com/avstudio1/echosh"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-all border border-slate-700"
          >
            <span>avstudio1/echosh</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </main>

      {/* Clean Minimal Footer */}
      <Footer />
    </div>
  );
}

