'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Terminal as TerminalIcon,
  Radio,
  RefreshCw,
  Send,
  Layers,
  Cloud,
  CloudOff,
  ArrowDownCircle,
  Cpu,
  Zap,
  HelpCircle,
  Clock,
  Trash2,
  AlertCircle,
  FileCode,
  FileText,
  Bell
} from "lucide-react";
import { BuckyballCanvas } from "./BuckyballCanvas";
import { useSSE } from "@/hooks/useSSE";
import { useAudioEngine } from "@/hooks/useAudioEngine";

interface NotificationRecord {
  id: string;
  event: string;
  recipient: string;
  channel: string;
  title: string;
  summary: string;
  delivered: boolean;
  error?: string;
  created_at: string;
}

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

interface WorkspaceStatus {
  connected: boolean;
  mode: string;
  service_account?: string;
  user_email?: string;
  scopes: string[];
  last_sync: string;
  items_indexed: number;
}

interface ControlState {
  mode: "AUTO" | "MANUAL";
  ingest_policy: "EXECUTE" | "PENDING";
  poll_interval_sec: number;
  updated_at: string;
}

interface TelemetryLog {
  id: string;
  timestamp: string;
  source: string;
  level: "INFO" | "EXECUTE" | "SUCCESS" | "WARN" | "ERROR" | string;
  message: string;
}

export default function TerminalPage() {
  const [mode, setMode] = useState<"AUTO" | "MANUAL">("AUTO");
  const [policy, setPolicy] = useState<"EXECUTE" | "PENDING">("EXECUTE");
  const [pollInterval, setPollInterval] = useState<number>(30);
  const [remainingTick, setRemainingTick] = useState<number>(30);
  const [directives, setDirectives] = useState<AxisDirective[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [workspaceStatus, setWorkspaceStatus] = useState<WorkspaceStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("ALL");
  const [commandInput, setCommandInput] = useState<string>("");
  const [selectedDirective, setSelectedDirective] = useState<AxisDirective | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isSendingTestPing, setIsSendingTestPing] = useState<boolean>(false);
  const [isCompletingAll, setIsCompletingAll] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [activeInspectorTab, setActiveInspectorTab] = useState<"instruction" | "raw" | "logs" | "json">("instruction");
  const [logs, setLogs] = useState<TelemetryLog[]>([]);

  const { isConnected: isSSEConnected, lastEvent } = useSSE("/api/stream/events");
  const { playKeystroke, playUIClick, playUIChime } = useAudioEngine();
  const logEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch initial directives
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

  // Fetch telemetry logs
  const fetchTelemetryLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/axismundi/telemetry/logs");
      if (res.ok) {
        const data = await res.json();
        if (data.logs && data.logs.length > 0) {
          setLogs(data.logs);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch telemetry logs:", err);
    }
  }, []);

  // Fetch workspace status
  const fetchWorkspaceStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/axismundi/workspace/status");
      if (res.ok) {
        const data = await res.json();
        setWorkspaceStatus(data);
      }
    } catch (err) {
      console.warn("Failed to fetch workspace status:", err);
    }
  }, []);

  // Fetch control state
  const fetchControlState = useCallback(async () => {
    try {
      const res = await fetch("/api/axismundi/mode");
      if (res.ok) {
        const data: ControlState = await res.json();
        setMode(data.mode);
        setPolicy(data.ingest_policy);
        if (data.poll_interval_sec > 0) {
          setPollInterval(data.poll_interval_sec);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch control state:", err);
    }
  }, []);

  // Mark all directives completed
  const handleCompleteAllDirectives = useCallback(async () => {
    playUIClick();
    setIsCompletingAll(true);
    try {
      const res = await fetch("/api/axismundi/directives/complete-all", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        playUIChime(880);
        fetchDirectives();
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            source: "ORCHESTRATOR",
            level: "SUCCESS",
            message: `Batch marked ${data.completed || 0} directive(s) as COMPLETED.`,
          },
        ]);
      }
    } catch (err) {
      console.warn("Failed to complete all directives:", err);
    } finally {
      setIsCompletingAll(false);
    }
  }, [fetchDirectives, playUIClick, playUIChime]);

  useEffect(() => {
    fetchDirectives();
    fetchWorkspaceStatus();
    fetchControlState();
    fetchTelemetryLogs();
  }, [fetchDirectives, fetchWorkspaceStatus, fetchControlState, fetchTelemetryLogs]);

  // Update control state (Mode, Policy, or Interval)
  const updateControlState = useCallback(async (
    newMode: "AUTO" | "MANUAL",
    newPolicy: "EXECUTE" | "PENDING",
    newInterval?: number
  ) => {
    playUIClick();
    const intervalToSend = newInterval || pollInterval;
    try {
      const res = await fetch("/api/axismundi/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: newMode,
          ingest_policy: newPolicy,
          poll_interval_sec: intervalToSend,
        }),
      });
      if (res.ok) {
        const updated: ControlState = await res.json();
        setMode(updated.mode);
        setPolicy(updated.ingest_policy);
        setPollInterval(updated.poll_interval_sec);
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            source: "CONTROL",
            level: "INFO",
            message: `Engine updated: Mode [${updated.mode}] | Policy [${updated.ingest_policy}] | Poll [${updated.poll_interval_sec}s]`,
          },
        ]);
      }
    } catch (err) {
      console.warn("Failed to update control state:", err);
    }
  }, [playUIClick, pollInterval]);

  // Trigger Google Keep Sync
  const handleTriggerKeepSync = useCallback(async () => {
    playUIClick();
    setIsSyncing(true);
    try {
      const res = await fetch("/api/axismundi/keep/sync", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        playUIChime(660);
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            source: "KEEP_SYNC",
            level: "SUCCESS",
            message: `Google Keep API sync completed. ${data.notes_ingested || 0} notes processed.`,
          },
        ]);
        fetchDirectives();
        fetchWorkspaceStatus();
      }
    } catch (err) {
      console.warn("Failed to sync keep:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [fetchDirectives, fetchWorkspaceStatus, playUIClick, playUIChime]);

  // Update directive status
  const handleUpdateStatus = useCallback(async (id: string, newStatus: string, logMsg?: string) => {
    playUIClick();
    try {
      const res = await fetch(`/api/axismundi/directives/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          execution_log: logMsg || `Status modified from TUI to ${newStatus}`,
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
  }, [playUIClick, selectedDirective]);

  // Delete directive
  const handleDeleteDirective = useCallback(async (id: string) => {
    playUIClick();
    try {
      const res = await fetch(`/api/axismundi/directives/${id}`, { method: "DELETE" });
      if (res.ok) {
        playUIChime(440);
        setDirectives((prev) => prev.filter((d) => d.id !== id));
        if (selectedDirective?.id === id) {
          setSelectedDirective(null);
        }
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            source: "REGISTRY",
            level: "WARN",
            message: `Purged directive ${id.slice(0, 16)}`,
          },
        ]);
      }
    } catch (err) {
      console.warn("Failed to delete directive:", err);
    }
  }, [playUIClick, playUIChime, selectedDirective]);

  // Send Test Return Loop Notification
  const handleSendTestPing = useCallback(async () => {
    playUIClick();
    setIsSendingTestPing(true);
    try {
      const res = await fetch("/api/axismundi/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "On-demand Google Chat return loop operational ping." }),
      });
      if (res.ok) {
        const notif: NotificationRecord = await res.json();
        playUIChime(784);
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            source: "RETURN_LOOP",
            level: "SUCCESS",
            message: `[CHAT PING] Dispatched to ${notif.recipient} via ${notif.channel}`,
          },
        ]);
      }
    } catch (err) {
      console.warn("Failed to dispatch test notification:", err);
    } finally {
      setIsSendingTestPing(false);
    }
  }, [playUIClick, playUIChime]);

  // Reactive SSE event listener
  useEffect(() => {
    if (!lastEvent) return;

    const timeStr = new Date().toLocaleTimeString();

    if (lastEvent.type === "axismundi_tick" && lastEvent.payload) {
      const payload = lastEvent.payload as { remaining_seconds: number; current_interval_sec: number };
      setRemainingTick(payload.remaining_seconds);
      if (payload.current_interval_sec > 0 && payload.current_interval_sec !== pollInterval) {
        setPollInterval(payload.current_interval_sec);
      }
    } else if (lastEvent.type === "axismundi_ingested" && lastEvent.payload) {
      const d = lastEvent.payload as AxisDirective;
      setDirectives((prev) => [d, ...prev.filter((item) => item.id !== d.id)]);
      setLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          source: d.source === "google_keep_api" ? "KEEP_API" : "INGESTION",
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
    } else if (lastEvent.type === "axismundi_control_changed" && lastEvent.payload) {
      const ctrl = lastEvent.payload as ControlState;
      setMode(ctrl.mode);
      setPolicy(ctrl.ingest_policy);
      if (ctrl.poll_interval_sec > 0) setPollInterval(ctrl.poll_interval_sec);
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
          message: `Directive ${d.id.slice(0, 16)} -> ${d.status}`,
        },
      ]);
    } else if (lastEvent.type === "axismundi_directive_deleted" && lastEvent.payload) {
      const payload = lastEvent.payload as { id: string };
      setDirectives((prev) => prev.filter((d) => d.id !== payload.id));
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
    } else if (lastEvent.type === "axismundi_notification" && lastEvent.payload) {
      const notif = lastEvent.payload as NotificationRecord;
      playUIChime(784);
      setLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          source: "RETURN_LOOP",
          level: "SUCCESS",
          message: `[NOTIF SENT] ${notif.title} -> ${notif.recipient} (${notif.channel})`,
        },
      ]);
    } else if (lastEvent.type === "axismundi_telemetry" && lastEvent.payload) {
      const record = lastEvent.payload as TelemetryLog;
      setLogs((prev) => {
        const exists = prev.some((l) => l.id === record.id);
        if (exists) return prev;
        const updated = [...prev, record];
        return updated.length > 150 ? updated.slice(updated.length - 150) : updated;
      });
    } else if (lastEvent.type === "axismundi_completed_all") {
      fetchDirectives();
    }
  }, [lastEvent, playUIChime, pollInterval, fetchDirectives]);

  // Auto-scroll logs
  useEffect(() => {
    if (autoScroll) {
      logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  // Dynamic filter counts
  const counts = {
    all: directives.length,
    pending: directives.filter((d) => d.status === "PENDING" || d.status === "PASSIVE_CONTEXT").length,
    execute: directives.filter((d) => d.status === "QUEUED_FOR_AGENT").length,
    executing: directives.filter((d) => d.status === "EXECUTING").length,
    completed: directives.filter((d) => d.status === "COMPLETED").length,
    archived: directives.filter((d) => d.status === "ARCHIVED").length,
  };

  // Filtered directives
  const filteredDirectives = directives.filter((d) => {
    if (filter === "ALL") return true;
    if (filter === "PENDING") return d.status === "PENDING" || d.status === "PASSIVE_CONTEXT";
    if (filter === "EXECUTE") return d.status === "QUEUED_FOR_AGENT";
    if (filter === "EXECUTING") return d.status === "EXECUTING";
    if (filter === "COMPLETED") return d.status === "COMPLETED";
    if (filter === "ARCHIVED") return d.status === "ARCHIVED";
    return true;
  });

  // Global Keyboard Shortcuts Matrix
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in an input or textarea, ignore single-letter global navigation
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toUpperCase();

      if (e.key === "Escape") {
        if (isHelpOpen) {
          setIsHelpOpen(false);
        } else if (selectedDirective) {
          setSelectedDirective(null);
        }
        return;
      }

      if (key === "H") {
        playUIClick();
        setIsHelpOpen((prev) => !prev);
        return;
      }

      if (key === "A") {
        updateControlState("AUTO", policy, pollInterval);
        return;
      }

      if (key === "M") {
        updateControlState("MANUAL", policy, pollInterval);
        return;
      }

      if (key === "E") {
        updateControlState(mode, "EXECUTE", pollInterval);
        return;
      }

      if (key === "P") {
        updateControlState(mode, "PENDING", pollInterval);
        return;
      }

      if (key === "S") {
        handleTriggerKeepSync();
        return;
      }

      if (key === "T") {
        handleSendTestPing();
        return;
      }

      if (key === "C") {
        handleCompleteAllDirectives();
        return;
      }

      if (key === "R") {
        playUIClick();
        fetchDirectives();
        fetchWorkspaceStatus();
        fetchControlState();
        return;
      }

      // Arrow Key Navigation
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filteredDirectives.length ? prev + 1 : 0));
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredDirectives.length - 1));
        return;
      }

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (filteredDirectives[selectedIndex]) {
          playUIClick();
          setSelectedDirective(filteredDirectives[selectedIndex]);
        }
        return;
      }

      // Quick Numeric Status Shortcuts on Selected Item
      const activeItem = selectedDirective || filteredDirectives[selectedIndex];
      if (activeItem) {
        if (e.key === "1") {
          handleUpdateStatus(activeItem.id, "PENDING");
        } else if (e.key === "2") {
          handleUpdateStatus(activeItem.id, "QUEUED_FOR_AGENT");
        } else if (e.key === "3") {
          handleUpdateStatus(activeItem.id, "EXECUTING");
        } else if (e.key === "4") {
          handleUpdateStatus(activeItem.id, "COMPLETED");
        } else if (e.key === "5") {
          handleUpdateStatus(activeItem.id, "ARCHIVED");
        } else if (e.key === "Delete" || e.key === "Backspace") {
          handleDeleteDirective(activeItem.id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isHelpOpen,
    selectedDirective,
    selectedIndex,
    filteredDirectives,
    mode,
    policy,
    pollInterval,
    updateControlState,
    handleTriggerKeepSync,
    fetchDirectives,
    fetchWorkspaceStatus,
    fetchControlState,
    handleUpdateStatus,
    handleDeleteDirective,
    handleSendTestPing,
    handleCompleteAllDirectives,
    playUIClick,
  ]);

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

  return (
    <div className="min-h-screen bg-charcoal-900 text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 font-mono relative overflow-hidden">
      {/* 3D C60 Buckyball Background Wireframe */}
      <BuckyballCanvas />

      {/* Top TUI Header Bar (Sticky) */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 z-30 sticky top-0">
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

        {/* HUD Controls & Dynamic Polling Interval */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          {/* Google Workspace Connection Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono ${
              workspaceStatus?.connected
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
            title={`Workspace Mode: ${workspaceStatus?.mode || "STANDBY_LOCAL"} (${workspaceStatus?.scopes?.length || 5} Scopes)`}
          >
            {workspaceStatus?.connected ? (
              <Cloud className="w-3 h-3 text-emerald-400" />
            ) : (
              <CloudOff className="w-3 h-3 text-slate-500" />
            )}
            <span>
              {workspaceStatus?.connected
                ? `GCP: ${workspaceStatus.user_email || "CONNECTED"}`
                : "WORKSPACE: LOCAL/STANDBY"}
            </span>
          </div>

          {/* Google Chat Return Loop Notification Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono bg-violet-950/60 border-violet-500/40 text-violet-300"
            title="Google Chat return loop active for user Justin at Echo SH Labs"
          >
            <Bell className="w-3 h-3 text-violet-400" />
            <span>CHAT: {workspaceStatus?.user_email || "justin@echosh-labs.com"}</span>
          </div>

          {/* Test Chat Notification Ping Button */}
          <button
            onClick={handleSendTestPing}
            disabled={isSendingTestPing}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all ${
              isSendingTestPing
                ? "bg-violet-950 border-violet-500 text-violet-300 animate-pulse"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:text-violet-300 hover:border-violet-500/40"
            }`}
            title="Dispatch on-demand Google Chat test ping to Justin [T]"
          >
            <Bell className={`w-3.5 h-3.5 ${isSendingTestPing ? "animate-bounce" : "text-violet-400"}`} />
            <span>{isSendingTestPing ? "PINGING..." : "PING [T]"}</span>
          </button>

          {/* Dynamic Polling Interval Selector Dropdown */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] text-slate-500">POLL:</span>
            <select
              value={pollInterval}
              onChange={(e) => updateControlState(mode, policy, Number(e.target.value))}
              className="bg-transparent text-emerald-300 text-xs font-mono focus:outline-none cursor-pointer"
              title="Set automatic background polling frequency"
            >
              <option value={10} className="bg-slate-950 text-slate-200">10s</option>
              <option value={30} className="bg-slate-950 text-slate-200">30s</option>
              <option value={60} className="bg-slate-950 text-slate-200">60s</option>
              <option value={120} className="bg-slate-950 text-slate-200">120s</option>
              <option value={300} className="bg-slate-950 text-slate-200">300s</option>
            </select>
            {mode === "AUTO" && (
              <span className="text-[10px] text-emerald-400 font-bold ml-1">
                ({remainingTick}s)
              </span>
            )}
          </div>

          {/* Trigger Google Keep Sync */}
          <button
            onClick={handleTriggerKeepSync}
            disabled={isSyncing}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all ${
              isSyncing
                ? "bg-sky-950 border-sky-500 text-sky-300 animate-pulse"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40"
            }`}
            title="Poll Google Keep API on-demand [S]"
          >
            <ArrowDownCircle className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : "text-emerald-400"}`} />
            <span>{isSyncing ? "SYNCING..." : "SYNC [S]"}</span>
          </button>

          {/* Mode Switcher: AUTO vs MANUAL */}
          <button
            onClick={() => updateControlState(mode === "AUTO" ? "MANUAL" : "AUTO", policy, pollInterval)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all ${
              mode === "AUTO"
                ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-sm"
                : "bg-amber-950/70 border-amber-500/50 text-amber-300"
            }`}
            title="Toggle AUTO [A] / MANUAL [M] mode"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>MODE: [{mode}]</span>
          </button>

          {/* Auto-Ingestion Policy Switcher: EXECUTE vs PENDING */}
          <button
            onClick={() => updateControlState(mode, policy === "EXECUTE" ? "PENDING" : "EXECUTE", pollInterval)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all ${
              policy === "EXECUTE"
                ? "bg-amber-950/80 border-amber-500/60 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                : "bg-sky-950/80 border-sky-500/60 text-sky-300"
            }`}
            title="Toggle Ingest Policy: EXECUTE [E] vs PENDING [P]"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>INGEST: [{policy}]</span>
          </button>

          {/* Help Overlay Toggle Button */}
          <button
            onClick={() => {
              playUIClick();
              setIsHelpOpen(true);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 text-xs font-mono transition-all"
            title="Open Keyboard Shortcuts & API Help [H]"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>HELP [H]</span>
          </button>

          {/* SSE Live Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
            <Radio className={`w-3 h-3 ${isSSEConnected ? "text-emerald-400 animate-pulse" : "text-slate-500"}`} />
            <span className={isSSEConnected ? "text-emerald-300" : "text-slate-500"}>
              {isSSEConnected ? "SSE ONLINE" : "OFFLINE"}
            </span>
          </div>

          <button
            onClick={() => {
              playUIClick();
              fetchDirectives();
              fetchWorkspaceStatus();
              fetchControlState();
              fetchTelemetryLogs();
            }}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition-all"
            title="Refresh [R]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Terminal Grid Stage */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 grid grid-cols-1 lg:grid-cols-12 gap-5 z-10">
        {/* Left Column: Live Streaming Telemetry Terminal */}
        <div className="lg:col-span-6 flex flex-col space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold tracking-wide">LIVE TELEMETRY STREAM</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoScroll((prev) => !prev)}
                className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                  autoScroll
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                    : "bg-slate-900 border-slate-800 text-slate-500"
                }`}
                title="Toggle auto-scroll on new logs"
              >
                SCROLL: {autoScroll ? "ON" : "OFF"}
              </button>
              <button
                onClick={() => setLogs([])}
                className="px-2 py-0.5 rounded text-[10px] border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-300 hover:border-rose-500/40 transition-all"
                title="Clear log window"
              >
                CLEAR
              </button>
            </div>
          </div>

          {/* Terminal Output Window */}
          <div className="flex-1 min-h-[360px] max-h-[490px] bg-slate-950/90 border border-slate-800 rounded-xl p-4 overflow-y-auto font-mono text-xs space-y-2 shadow-inner">
            {logs.length === 0 ? (
              <div className="text-slate-600 text-center py-20 text-xs">
                Awaiting telemetry events from Axis Mundi engine...
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-500 text-[10px] select-none shrink-0">[{log.timestamp}]</span>
                  <span
                    className={`text-[10px] px-1 rounded uppercase font-bold select-none shrink-0 ${
                      log.level === "EXECUTE"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : log.level === "SUCCESS"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : log.level === "WARN" || log.level === "ERROR"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : log.source === "WORKSPACE"
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                        : log.source === "RETURN_LOOP"
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/40"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {log.source}
                  </span>
                  <span
                    className={`flex-1 break-words ${
                      log.level === "EXECUTE"
                        ? "text-amber-200 font-semibold"
                        : log.level === "SUCCESS"
                        ? "text-emerald-200 font-semibold"
                        : log.level === "WARN" || log.level === "ERROR"
                        ? "text-rose-200 font-semibold"
                        : "text-slate-300"
                    }`}
                  >
                    {log.message}
                  </span>
                </div>
              ))
            )}
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
        <div className="lg:col-span-6 flex flex-col space-y-3.5">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2 text-xs gap-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold tracking-wide">WORKSPACE DIRECTIVES</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Batch Complete All Button */}
              <button
                onClick={handleCompleteAllDirectives}
                disabled={isCompletingAll}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                  isCompletingAll
                    ? "bg-emerald-950 border-emerald-500 text-emerald-300 animate-pulse"
                    : "bg-emerald-950/40 border-emerald-600/40 text-emerald-400 hover:bg-emerald-900/60 hover:border-emerald-500"
                }`}
                title="Mark all current directives as COMPLETED [C]"
              >
                <span>{isCompletingAll ? "COMPLETING..." : "COMPLETE ALL [C]"}</span>
              </button>

              {/* Filter Chips with Live Dynamic Counts */}
              <div className="flex items-center gap-1 flex-wrap">
                {[
                  { key: "ALL", label: `ALL (${counts.all})` },
                  { key: "PENDING", label: `PENDING (${counts.pending})` },
                  { key: "EXECUTE", label: `EXECUTE (${counts.execute})` },
                  { key: "EXECUTING", label: `RUNNING (${counts.executing})` },
                  { key: "COMPLETED", label: `DONE (${counts.completed})` },
                  { key: "ARCHIVED", label: `ARCHIVED (${counts.archived})` },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => {
                      playUIClick();
                      setFilter(f.key);
                      setSelectedIndex(0);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                      filter === f.key
                        ? "bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm"
                        : "text-slate-500 hover:text-slate-300 border border-transparent"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Directives List Grid with Direct Card Status Actions */}
          <div className="flex-1 min-h-[360px] max-h-[490px] overflow-y-auto space-y-2.5 pr-1">
            {filteredDirectives.length === 0 ? (
              <div className="text-center py-20 text-slate-600 text-xs">
                No workspace items in registry for filter [{filter}]. Speak to Google Keep or enter a directive in the prompt.
              </div>
            ) : (
              filteredDirectives.map((d, index) => {
                const isSelected = selectedIndex === index;
                return (
                  <div
                    key={d.id}
                    onClick={() => {
                      playUIClick();
                      setSelectedIndex(index);
                      setSelectedDirective(d);
                    }}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "bg-slate-900 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.18)]"
                        : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold">
                          #{index + 1} &bull; {d.id.slice(0, 14)}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {d.source}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          d.status === "QUEUED_FOR_AGENT" || d.status === "EXECUTE"
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse"
                            : d.status === "EXECUTING"
                            ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                            : d.status === "COMPLETED"
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : d.status === "ARCHIVED"
                            ? "bg-slate-900 text-slate-500 border border-slate-800"
                            : "bg-amber-950/40 text-amber-400 border border-amber-700/30"
                        }`}
                      >
                        {d.status === "QUEUED_FOR_AGENT" ? "EXECUTE" : d.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-200 line-clamp-1">{d.title}</h3>
                    <p className="text-slate-400 text-[11px] font-light mt-1 line-clamp-2">
                      {d.triaged_instruction || d.raw_note}
                    </p>

                    {/* Dynamic Direct Status Action Strip on Every Card */}
                    <div
                      className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-1.5 flex-wrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[9px] text-slate-500 font-mono mr-0.5">SET:</span>
                      <button
                        onClick={() => handleUpdateStatus(d.id, "PENDING")}
                        className={`px-2 py-0.5 rounded text-[9px] font-mono border transition-all ${
                          d.status === "PENDING" || d.status === "PASSIVE_CONTEXT"
                            ? "bg-slate-800 border-slate-500 text-slate-200 font-bold shadow-sm"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                        }`}
                        title="Mark as PENDING [1]"
                      >
                        PENDING
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(d.id, "QUEUED_FOR_AGENT")}
                        className={`px-2 py-0.5 rounded text-[9px] font-mono border transition-all ${
                          d.status === "QUEUED_FOR_AGENT"
                            ? "bg-amber-950/90 border-amber-400 text-amber-300 font-bold shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                            : "bg-slate-950/60 border-slate-800 text-amber-500/70 hover:text-amber-300 hover:border-amber-500/40"
                        }`}
                        title="Mark as EXECUTE [2]"
                      >
                        EXECUTE
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(d.id, "EXECUTING")}
                        className={`px-2 py-0.5 rounded text-[9px] font-mono border transition-all ${
                          d.status === "EXECUTING"
                            ? "bg-sky-950/90 border-sky-400 text-sky-300 font-bold shadow-[0_0_8px_rgba(56,189,248,0.3)]"
                            : "bg-slate-950/60 border-slate-800 text-sky-500/70 hover:text-sky-300 hover:border-sky-500/40"
                        }`}
                        title="Mark as RUNNING [3]"
                      >
                        RUNNING
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(d.id, "COMPLETED")}
                        className={`px-2 py-0.5 rounded text-[9px] font-mono border transition-all ${
                          d.status === "COMPLETED"
                            ? "bg-emerald-950/90 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                            : "bg-slate-950/60 border-slate-800 text-emerald-500/70 hover:text-emerald-300 hover:border-emerald-500/40"
                        }`}
                        title="Mark as COMPLETE [4]"
                      >
                        COMPLETE
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(d.id, "ARCHIVED")}
                        className={`px-2 py-0.5 rounded text-[9px] font-mono border transition-all ${
                          d.status === "ARCHIVED"
                            ? "bg-purple-950/90 border-purple-400 text-purple-300 font-bold shadow-sm"
                            : "bg-slate-950/60 border-slate-800 text-purple-500/70 hover:text-purple-300 hover:border-purple-500/40"
                        }`}
                        title="Mark as ARCHIVE [5]"
                      >
                        ARCHIVE
                      </button>
                      <button
                        onClick={() => handleDeleteDirective(d.id)}
                        className="ml-auto p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                        title="Delete directive [Del]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Selected Directive Detail Drawer / Modal */}
      {selectedDirective && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase">
                  Workspace Item Inspector // {selectedDirective.id}
                </span>
                <h3 className="text-base font-bold text-slate-100 font-mono mt-0.5">
                  {selectedDirective.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDirective(null)}
                className="text-slate-500 hover:text-slate-300 font-mono text-sm px-2 py-1"
              >
                ✕ [ESC]
              </button>
            </div>

            {/* Status Modification Button Bar */}
            <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Set Status:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => handleUpdateStatus(selectedDirective.id, "PENDING")}
                  className={`px-2 py-1 rounded text-[11px] border ${
                    selectedDirective.status === "PENDING"
                      ? "bg-amber-950 border-amber-500 text-amber-300 font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  [1] Pending
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedDirective.id, "QUEUED_FOR_AGENT")}
                  className={`px-2 py-1 rounded text-[11px] border ${
                    selectedDirective.status === "QUEUED_FOR_AGENT"
                      ? "bg-amber-950 border-amber-500 text-amber-300 font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  [2] Execute
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedDirective.id, "EXECUTING")}
                  className={`px-2 py-1 rounded text-[11px] border ${
                    selectedDirective.status === "EXECUTING"
                      ? "bg-sky-950 border-sky-500 text-sky-300 font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  [3] Executing
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedDirective.id, "COMPLETED")}
                  className={`px-2 py-1 rounded text-[11px] border ${
                    selectedDirective.status === "COMPLETED"
                      ? "bg-emerald-950 border-emerald-500 text-emerald-300 font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  [4] Completed
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedDirective.id, "ARCHIVED")}
                  className={`px-2 py-1 rounded text-[11px] border ${
                    selectedDirective.status === "ARCHIVED"
                      ? "bg-slate-800 border-slate-600 text-slate-200 font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  [5] Archive
                </button>
              </div>
            </div>

            {/* Inspector Tab Switcher */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
              <button
                onClick={() => setActiveInspectorTab("instruction")}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                  activeInspectorTab === "instruction"
                    ? "bg-slate-800 text-emerald-300 font-bold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Triaged Instruction</span>
              </button>
              <button
                onClick={() => setActiveInspectorTab("raw")}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                  activeInspectorTab === "raw"
                    ? "bg-slate-800 text-emerald-300 font-bold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Raw Keep Content</span>
              </button>
              {selectedDirective.execution_log && (
                <button
                  onClick={() => setActiveInspectorTab("logs")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                    activeInspectorTab === "logs"
                      ? "bg-slate-800 text-emerald-300 font-bold"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Execution Logs</span>
                </button>
              )}
              <button
                onClick={() => setActiveInspectorTab("json")}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                  activeInspectorTab === "json"
                    ? "bg-slate-800 text-emerald-300 font-bold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>JSON Payload</span>
              </button>
            </div>

            {/* Inspector Tab Content Area */}
            <div className="space-y-3 text-xs font-mono max-h-[300px] overflow-y-auto">
              {activeInspectorTab === "instruction" && (
                <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300 whitespace-pre-wrap leading-relaxed">
                  {selectedDirective.triaged_instruction}
                </pre>
              )}

              {activeInspectorTab === "raw" && (
                <p className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedDirective.raw_note}
                </p>
              )}

              {activeInspectorTab === "logs" && (
                <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 whitespace-pre-wrap">
                  {selectedDirective.execution_log}
                </pre>
              )}

              {activeInspectorTab === "json" && (
                <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-blue-300 text-[11px] whitespace-pre-wrap">
                  {JSON.stringify(selectedDirective, null, 2)}
                </pre>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[10px] text-slate-500">
                Created: {new Date(selectedDirective.created_at).toLocaleString()} &bull; Source: {selectedDirective.source}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteDirective(selectedDirective.id)}
                  className="px-3 py-1.5 rounded-lg border border-rose-900/60 bg-rose-950/40 text-rose-300 hover:bg-rose-900 text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge [Del]</span>
                </button>
                <button
                  onClick={() => setSelectedDirective(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 text-xs"
                >
                  Close [Esc]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help & API Reference Overlay Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-950 border border-cyan-900/80 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-[0_0_25px_rgba(6,182,212,0.15)] relative font-mono">
            <div className="flex justify-between items-center border-b border-cyan-900/60 pb-3">
              <h2 className="text-cyan-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Axis Mundi // Operations & Keyboard Shortcuts</span>
              </h2>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="text-cyan-500 hover:text-cyan-300 text-xs px-2.5 py-1 border border-cyan-800 rounded-lg"
              >
                ESC to Close
              </button>
            </div>

            <div className="p-1 overflow-y-auto max-h-[65vh] text-xs text-slate-300 flex flex-col gap-6">
              {/* Keyboard Command Grid */}
              <section>
                <h3 className="text-cyan-400 border-b border-cyan-900/50 pb-1 mb-3 uppercase font-semibold text-xs">
                  Keyboard Command Shortcuts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900/70 border border-slate-800">
                    <span className="text-yellow-400 font-bold">[A]</span>
                    <span className="text-slate-300">AUTO mode (periodic polling)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900/70 border border-slate-800">
                    <span className="text-yellow-400 font-bold">[M]</span>
                    <span className="text-slate-300">MANUAL mode (on-demand)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900/70 border border-slate-800">
                    <span className="text-yellow-400 font-bold">[E] / [P]</span>
                    <span className="text-slate-300">Toggle Ingest Policy (EXECUTE / PENDING)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900/70 border border-slate-800">
                    <span className="text-yellow-400 font-bold">[S]</span>
                    <span className="text-slate-300">Trigger on-demand Keep API sync</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900/70 border border-slate-800">
                    <span className="text-violet-400 font-bold">[T]</span>
                    <span className="text-slate-300">Dispatch test return loop chat notification</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900/70 border border-slate-800">
                    <span className="text-yellow-400 font-bold">[R]</span>
                    <span className="text-slate-300">Refresh registry state</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900/70 border border-slate-800">
                    <span className="text-yellow-400 font-bold">[H]</span>
                    <span className="text-slate-300">Toggle this Help overlay</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900/70 border border-slate-800">
                    <span className="text-yellow-400 font-bold">[↑] / [↓]</span>
                    <span className="text-slate-300">Navigate directive list</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900/70 border border-slate-800">
                    <span className="text-yellow-400 font-bold">[Enter / Space]</span>
                    <span className="text-slate-300">Inspect highlighted item</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900/70 border border-slate-800">
                    <span className="text-yellow-400 font-bold">[1] - [5]</span>
                    <span className="text-slate-300">Set status (Pending, Exec, Run, Done, Arch)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900/70 border border-slate-800">
                    <span className="text-yellow-400 font-bold">[Del / Bksp]</span>
                    <span className="text-slate-300">Purge selected directive</span>
                  </div>
                </div>
              </section>

              {/* API Endpoints */}
              <section>
                <h3 className="text-cyan-400 border-b border-cyan-900/50 pb-1 mb-3 uppercase font-semibold text-xs">
                  Axis Mundi REST & MCP API Endpoints
                </h3>
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800">
                      <th className="pb-2">Endpoint</th>
                      <th className="pb-2 w-16">Method</th>
                      <th className="pb-2">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    <tr><td className="py-1.5 text-emerald-400">/api/axismundi/directives</td><td>GET</td><td>List all stored directives</td></tr>
                    <tr><td className="py-1.5 text-emerald-400">/api/axismundi/directives/pending</td><td>GET</td><td>List queued [EXECUTE] directives</td></tr>
                    <tr><td className="py-1.5 text-cyan-400">/api/axismundi/workspace/status</td><td>GET</td><td>Google Workspace auth & DWD status</td></tr>
                    <tr><td className="py-1.5 text-amber-400">/api/axismundi/mode</td><td>GET/POST</td><td>Get/Set AUTO/MANUAL, Policy & Interval</td></tr>
                    <tr><td className="py-1.5 text-purple-400">/api/axismundi/keep/sync</td><td>GET/POST</td><td>Trigger immediate Google Keep sync</td></tr>
                    <tr><td className="py-1.5 text-violet-400">/api/axismundi/notifications</td><td>GET</td><td>List notification return loop history</td></tr>
                    <tr><td className="py-1.5 text-violet-400">/api/axismundi/notifications/test</td><td>POST</td><td>Dispatch on-demand test ping to Justin</td></tr>
                    <tr><td className="py-1.5 text-sky-400">/api/stream/events</td><td>SSE</td><td>Live telemetry & tick stream</td></tr>
                    <tr><td className="py-1.5 text-blue-400">/api/mcp</td><td>POST</td><td>Model Context Protocol JSON-RPC 2.0</td></tr>
                  </tbody>
                </table>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Subtle Terminal Footer */}
      <footer className="w-full border-t border-slate-900/80 px-6 py-2.5 text-center text-slate-600 text-[10px] font-mono z-10">
        Axis Mundi v2.0 • Dual-Mode System Engine (AUTO/MANUAL) • Auto-Ingest Policy (EXECUTE/PENDING) • Press [H] for Help
      </footer>
    </div>
  );
}