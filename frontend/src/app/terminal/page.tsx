'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Terminal as TerminalIcon, Radio, Play, CheckCircle2, AlertCircle, RefreshCw, Send, Sparkles, Database, Layers } from "lucide-react";
import { BuckyballCanvas } from "./BuckyballCanvas";
import { useSSE } from "@/hooks/useSSE";
import { useAudioEngine } from "@/hooks/useAudioEngine";

interface AxisDirective {
  id: string;
  source: string;
  title: string;
  raw_note: string;
  triaged_instruction: string;
  type: string;
  is_execute: boolean;
  status: string;
  execution_log?: string;
  created_at: string;
  updated_at: string;
}

interface TelemetryLog {
  id: string;
  timestamp: string;
  source: string;
  level: "INFO" | "EXECUTE" | "SUCCESS" | "WARN";
  message: string;
}

export default function TerminalPage() {
  const [mode, setMode] = useState<"AUTO" | "MANUAL">("AUTO");
  const [directives, setDirectives] = useState<AxisDirective[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [commandInput, setCommandInput] = useState<string>("");
  const [selectedDirective, setSelectedDirective] = useState<AxisDirective | null>(null);
  const [logs, setLogs] = useState<TelemetryLog[]>([
    {
      id: "init-1",
      timestamp: new Date().toLocaleTimeString(),
      source: "SYSTEM",
      level: "INFO",
      message: "Amra Core Axis Mundi Daemon active. Mode: AUTO (0 AI Tokens Consumed).",
    },
    {
      id: "init-2",
      timestamp: new Date().toLocaleTimeString(),
      source: "GATEKEEPER",
      level: "INFO",
      message: "Deterministic string and tag filters initialized for [EXECUTE] directives.",
    },
  ]);

  const { isConnected: isSSEConnected, lastEvent } = useSSE("/api/stream/events");
  const { playKeystroke, playUIClick, playUIChime } = useAudioEngine();
  const logEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch initial directives from backend
  const fetchDirectives = useCallback(async () => {
    try {
      const res = await fetch("/api/axismundi/directives");
      if (res.ok) {
        const data = await res.json();
        setDirectives(data.directives || []);
      }
    } catch (err) {
      console.warn("Failed to fetch directives:", err);
    }
  }, []);

  useEffect(() => {
    fetchDirectives();
  }, [fetchDirectives]);

  // Reactive SSE event listener
  useEffect(() => {
    if (!lastEvent) return;

    const timeStr = new Date().toLocaleTimeString();
    if (lastEvent.type === "axismundi_ingested" && lastEvent.payload) {
      const d = lastEvent.payload as AxisDirective;
      setDirectives((prev) => [d, ...prev.filter((item) => item.id !== d.id)]);
      setLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          source: "INGESTION",
          level: "INFO",
          message: `Ingested note: "${d.title}" (Status: ${d.status})`,
        },
      ]);
    } else if (lastEvent.type === "axismundi_execute_alert" && lastEvent.payload) {
      const d = lastEvent.payload as AxisDirective;
      setDirectives((prev) => [d, ...prev.filter((item) => item.id !== d.id)]);
      playUIChime(880);
      setLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          source: "GATEKEEPER",
          level: "EXECUTE",
          message: `[ALERT] EXECUTE Directive Queued for Agent: "${d.title}"`,
        },
      ]);
    } else if (lastEvent.type === "axismundi_status_changed" && lastEvent.payload) {
      const d = lastEvent.payload as AxisDirective;
      setDirectives((prev) => prev.map((item) => (item.id === d.id ? d : item)));
      setLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          source: "ORCHESTRATOR",
          level: "INFO",
          message: `Directive ${d.id.slice(0, 12)} status -> ${d.status}`,
        },
      ]);
    } else if (lastEvent.type === "axismundi_execution_completed" && lastEvent.payload) {
      const d = lastEvent.payload as AxisDirective;
      setDirectives((prev) => prev.map((item) => (item.id === d.id ? d : item)));
      playUIChime(528);
      setLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          source: "AGENT",
          level: "SUCCESS",
          message: `[COMPLETED] Directive "${d.title}" verified and closed.`,
        },
      ]);
    }
  }, [lastEvent, playUIChime]);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const input = commandInput.trim();
    setCommandInput("");

    try {
      const res = await fetch("/api/axismundi/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: input.length > 40 ? input.slice(0, 37) + "..." : input,
          content: input,
          source: "tui_terminal",
        }),
      });

      if (res.ok) {
        const d = await res.json();
        setDirectives((prev) => [d, ...prev.filter((item) => item.id !== d.id)]);
      }
    } catch (err) {
      console.warn("Failed to ingest command:", err);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string, logMsg?: string) => {
    playUIClick();
    try {
      const res = await fetch(`/api/axismundi/directives/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          execution_log: logMsg || `Manual status update from TUI to ${newStatus}`,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDirectives((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
        if (selectedDirective?.id === updated.id) {
          setSelectedDirective(updated);
        }
      }
    } catch (err) {
      console.warn("Failed to update status:", err);
    }
  };

  const filteredDirectives = directives.filter((d) => {
    if (filter === "ALL") return true;
    if (filter === "QUEUED") return d.status === "QUEUED_FOR_AGENT";
    if (filter === "EXECUTING") return d.status === "EXECUTING";
    if (filter === "COMPLETED") return d.status === "COMPLETED";
    if (filter === "PASSIVE") return d.status === "PASSIVE_CONTEXT";
    return true;
  });

  return (
    <div className="min-h-screen bg-charcoal-900 text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 font-mono relative overflow-hidden">
      {/* 3D C60 Buckyball Background Canvas */}
      <BuckyballCanvas />

      {/* Top TUI Navigation Header */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            onClick={playUIClick}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Portal</span>
          </Link>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            <h1 className="text-sm font-bold tracking-widest text-slate-200 uppercase">
              AXIS MUNDI // AMRA CORE
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Lincoln_ON
            </span>
          </div>
        </div>

        {/* Status Indicators & Mode Switcher */}
        <div className="flex items-center gap-3 text-xs">
          {/* Mode Toggle Button */}
          <button
            onClick={() => {
              playUIClick();
              setMode(mode === "AUTO" ? "MANUAL" : "AUTO");
            }}
            className={`px-3 py-1 rounded-lg border text-xs font-mono transition-all ${
              mode === "AUTO"
                ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-300"
                : "bg-amber-950/70 border-amber-500/50 text-amber-300 shadow-sm"
            }`}
            title="Toggle between AUTO (Zero-Token Background Daemon) and MANUAL (Operator Control)"
          >
            MODE: [{mode}]
          </button>

          {/* SSE Live Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
            <Radio className={`w-3 h-3 ${isSSEConnected ? "text-emerald-400 animate-pulse" : "text-slate-500"}`} />
            <span className={isSSEConnected ? "text-emerald-300" : "text-slate-500"}>
              {isSSEConnected ? "SSE ONLINE" : "OFFLINE"}
            </span>
          </div>

          <button
            onClick={fetchDirectives}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition-all"
            title="Refresh Directives"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Terminal Grid Stage */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10">
        {/* Left Column: Live Streaming Telemetry Terminal */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>LIVE TELEMETRY STREAM</span>
            </div>
            <span className="text-[10px] text-slate-500">0 AI TOKENS / PASSIVE GO DAEMON</span>
          </div>

          {/* Terminal Output Window */}
          <div className="flex-1 min-h-[340px] max-h-[480px] bg-slate-950/90 border border-slate-800 rounded-xl p-4 overflow-y-auto font-mono text-xs space-y-2 shadow-inner">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-500 text-[10px] select-none">[{log.timestamp}]</span>
                <span
                  className={`text-[10px] px-1 rounded uppercase font-bold select-none ${
                    log.level === "EXECUTE"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : log.level === "SUCCESS"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {log.source}
                </span>
                <span
                  className={`flex-1 ${
                    log.level === "EXECUTE"
                      ? "text-amber-200 font-semibold"
                      : log.level === "SUCCESS"
                      ? "text-emerald-200 font-semibold"
                      : "text-slate-300"
                  }`}
                >
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>

          {/* Interactive Command Line Input */}
          <form onSubmit={handleCommandSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400 text-xs font-bold">
              amra@axis:~$
            </div>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => {
                const char = e.target.value.slice(-1);
                if (char) playKeystroke(char);
                setCommandInput(e.target.value);
              }}
              placeholder="[EXECUTE] Type directive or note (e.g. #amra-exec)..."
              className="w-full bg-slate-950/90 border border-slate-800 focus:border-emerald-500/60 rounded-xl pl-28 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-emerald-400 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right Column: Directive Matrix & Status Inspector */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2 text-xs gap-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>DIRECTIVE QUEUE & REGISTRY</span>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1">
              {["ALL", "QUEUED", "EXECUTING", "COMPLETED", "PASSIVE"].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    playUIClick();
                    setFilter(f);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] transition-all ${
                    filter === f
                      ? "bg-slate-800 text-emerald-300 border border-emerald-500/30 font-bold"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Directives List Grid */}
          <div className="flex-1 min-h-[340px] max-h-[480px] overflow-y-auto space-y-2.5 pr-1">
            {filteredDirectives.length === 0 ? (
              <div className="text-center py-16 text-slate-600 text-xs">
                No directives found in registry. Send one using the terminal prompt or Google Keep.
              </div>
            ) : (
              filteredDirectives.map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    playUIClick();
                    setSelectedDirective(d);
                  }}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedDirective?.id === d.id
                      ? "bg-slate-900 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                      : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-slate-500">{d.id.slice(0, 16)}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        d.status === "QUEUED_FOR_AGENT"
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse"
                          : d.status === "EXECUTING"
                          ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                          : d.status === "COMPLETED"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-200 line-clamp-1">{d.title}</h3>
                  <p className="text-slate-400 text-[11px] font-light mt-1 line-clamp-2">
                    {d.triaged_instruction || d.raw_note}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-900 text-[10px] text-slate-500">
                    <span>Source: {d.source}</span>
                    <div className="flex items-center gap-2">
                      {d.status === "QUEUED_FOR_AGENT" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(d.id, "EXECUTING", "Agent acknowledged from TUI.");
                          }}
                          className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 hover:bg-sky-900 transition-all"
                        >
                          Execute [E]
                        </button>
                      )}
                      {d.status === "EXECUTING" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(d.id, "COMPLETED", "Execution marked completed via TUI.");
                          }}
                          className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition-all"
                        >
                          Complete [C]
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Selected Directive Detail Drawer / Modal */}
      {selectedDirective && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase">
                  Directive Inspector // {selectedDirective.id}
                </span>
                <h3 className="text-base font-bold text-slate-100 font-mono mt-0.5">
                  {selectedDirective.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDirective(null)}
                className="text-slate-500 hover:text-slate-300 font-mono text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 uppercase text-[10px]">Triaged Instruction:</span>
                <pre className="mt-1 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-emerald-300 whitespace-pre-wrap">
                  {selectedDirective.triaged_instruction}
                </pre>
              </div>

              <div>
                <span className="text-slate-500 uppercase text-[10px]">Raw Source Note:</span>
                <p className="mt-1 text-slate-400 p-2.5 rounded bg-slate-900/40 border border-slate-800/80">
                  {selectedDirective.raw_note}
                </p>
              </div>

              {selectedDirective.execution_log && (
                <div>
                  <span className="text-slate-500 uppercase text-[10px]">Execution Telemetry:</span>
                  <pre className="mt-1 p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] max-h-36 overflow-y-auto whitespace-pre-wrap">
                    {selectedDirective.execution_log}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[10px] text-slate-500">
                Created: {new Date(selectedDirective.created_at).toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDirective(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtle Terminal Footer */}
      <footer className="w-full border-t border-slate-900/80 px-6 py-3 text-center text-slate-600 text-[10px] font-mono z-10">
        Axis Mundi v2.0 • Amra Core Architecture • Google Workspace Bridge
      </footer>
    </div>
  );
}