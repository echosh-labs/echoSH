'use client';

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: "glass" | "tui";
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  variant = "glass",
  size = "md",
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-6xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Window */}
      <div
        ref={dialogRef}
        className={cn(
          "relative w-full rounded-2xl p-6 sm:p-8 z-10 animate-scaleIn transition-all max-h-[90vh] flex flex-col",
          variant === "glass" && "glass-panel-elevated border border-slate-700/80 shadow-2xl",
          variant === "tui" && "tui-window border border-emerald-500/50 shadow-tui-glow",
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4 mb-4">
          <div>
            {title && (
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs sm:text-sm text-slate-400 font-light mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Close [Escape]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
