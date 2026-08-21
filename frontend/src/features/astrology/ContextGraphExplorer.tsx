'use client';

import React, { useState, useEffect } from "react";
import { Database, Network, Tag, ArrowRight, BookOpen, Layers, Compass } from "lucide-react";
import { ContextNode } from "@/types";
import { fetchContextNodeDetail } from "@/lib/api";

interface ContextGraphExplorerProps {
  initialNodes: ContextNode[];
}

export function ContextGraphExplorer({ initialNodes }: ContextGraphExplorerProps) {
  const [selectedKey, setSelectedKey] = useState<string>(initialNodes[0]?.key || "node:mercury-core");
  const [activeNode, setActiveNode] = useState<ContextNode | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedKey) {
      setLoading(true);
      fetchContextNodeDetail(selectedKey).then((node) => {
        if (node) {
          setActiveNode(node);
        } else {
          const found = initialNodes.find((n) => n.key === selectedKey);
          if (found) setActiveNode(found);
        }
        setLoading(false);
      });
    }
  }, [selectedKey, initialNodes]);

  const categories = [
    { id: "all", label: "All Nodes" },
    { id: "hermetic", label: "Hermeticism" },
    { id: "astrology", label: "Astrology & Jyotish" },
    { id: "alchemy", label: "Alchemy & Quicksilver" },
    { id: "dasha", label: "Nakshatras & Cycles" },
    { id: "author_opus", label: "Author's Opus" },
  ];

  const filteredNodes = filterCategory === "all"
    ? initialNodes
    : initialNodes.filter((n) => n.category === filterCategory);

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono mb-2">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>BOLTDB CONTEXTUAL CONTENT DATABASE</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-silver-gradient">
          Relative Context & Knowledge Graph
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto mt-2">
          Explore how the foundational qualities of Mercury dynamically interconnect across hermetic philosophy, astrological nakshatras, alchemical principles, and Justin Andrew Wood&apos;s authored works.
        </p>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-8">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilterCategory(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              filterCategory === c.id
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid Layout: Left Node List, Right Node Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Node List */}
        <div className="lg:col-span-4 space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
          {filteredNodes.map((node) => (
            <div
              key={node.key}
              onClick={() => setSelectedKey(node.key)}
              className={`p-3.5 rounded-xl cursor-pointer transition-all border text-left ${
                selectedKey === node.key
                  ? "bg-slate-800/90 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span className="uppercase text-emerald-400 font-semibold">{node.category}</span>
                <span>{node.key.replace("node:", "")}</span>
              </div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-200 line-clamp-1">{node.title}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 font-light leading-snug">{node.summary}</p>
            </div>
          ))}
        </div>

        {/* Right: Active Node Detail & Relative Context */}
        <div className="lg:col-span-8">
          {activeNode ? (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-700/60 shadow-xl space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-widest">{activeNode.category}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{activeNode.key}</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">{activeNode.title}</h3>
                <p className="text-xs sm:text-sm text-emerald-300/90 font-medium mt-1">{activeNode.summary}</p>
              </div>

              {/* Body Content */}
              <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <p className="text-xs sm:text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
                  {activeNode.content}
                </p>
              </div>

              {/* Tags */}
              {activeNode.tags && activeNode.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {activeNode.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Resolved Relative Context Graph */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-3">
                  <Network className="w-3.5 h-3.5 text-emerald-400" />
                  <span>RESOLVED RELATIVE CONTEXT IN BOLTDB</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeNode.relative_context && activeNode.relative_context.length > 0 ? (
                    activeNode.relative_context.map((rel, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedKey(rel.key)}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
                      >
                        <div>
                          <div className="text-[10px] font-mono text-emerald-400 uppercase">{rel.category}</div>
                          <div className="text-xs font-medium text-slate-200 group-hover:text-emerald-300 transition-colors line-clamp-1">
                            {rel.title}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))
                  ) : (
                    activeNode.relative_keys?.map((relKey, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedKey(relKey)}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
                      >
                        <div className="text-xs font-mono text-slate-300 group-hover:text-emerald-300 line-clamp-1">
                          {relKey}
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center text-slate-500">
              Select a node to inspect relative context
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
