'use client';

import React from "react";
import { cn } from "@/lib/utils";

export interface TabItem<T extends string = string> {
  id: T;
  label: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  tag?: string;
  badgeCount?: number;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
  tabClassName?: string;
  variant?: "pill" | "line" | "tui";
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className,
  tabClassName,
  variant = "pill",
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-1 p-1 bg-mercury-900/70 rounded-xl border border-slate-800/80 backdrop-blur-md",
        variant === "tui" && "bg-slate-950 border-emerald-500/30 font-mono",
        variant === "line" && "bg-transparent border-0 border-b border-slate-800 p-0 rounded-none gap-4",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all select-none",
              variant === "pill" &&
                (isActive
                  ? "bg-slate-800 text-emerald-300 border border-emerald-500/30 shadow-glow-emerald font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"),
              variant === "tui" &&
                (isActive
                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"),
              variant === "line" &&
                (isActive
                  ? "text-emerald-300 border-b-2 border-emerald-400 font-semibold rounded-none pb-2 -mb-px"
                  : "text-slate-400 hover:text-slate-200 rounded-none pb-2 -mb-px border-b-2 border-transparent"),
              tabClassName
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  "w-3.5 h-3.5 shrink-0",
                  isActive ? "text-emerald-400" : "text-slate-500"
                )}
              />
            )}
            <span>{tab.label}</span>
            {tab.tag && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60 ml-1 hidden md:inline">
                {tab.tag}
              </span>
            )}
            {typeof tab.badgeCount === "number" && (
              <span
                className={cn(
                  "text-[10px] font-mono px-1.5 py-0.2 rounded ml-1",
                  isActive
                    ? "bg-emerald-500/20 text-emerald-300 font-bold"
                    : "bg-slate-800 text-slate-500"
                )}
              >
                {tab.badgeCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
