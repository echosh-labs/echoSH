import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, style, width, height, ...props }: SkeletonProps) {
  const customStyle: React.CSSProperties = {
    ...style,
    width: width ?? style?.width,
    height: height ?? style?.height,
  };

  return (
    <div
      className={cn("skeleton-shimmer", className)}
      style={customStyle}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2.5", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-3.5",
            i === 0 ? "w-full" : i === lines - 1 ? "w-3/4" : "w-5/6"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonBadge({ className }: { className?: string }) {
  return <Skeleton className={cn("h-6 w-20 rounded-full", className)} aria-hidden="true" />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "p-6 rounded-2xl glass-panel border border-slate-800 space-y-4",
        className
      )}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-1/3 rounded-lg" />
        <SkeletonBadge />
      </div>
      <SkeletonText lines={3} />
      <div className="pt-2 flex gap-2">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  cols = 4,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3 w-full", className)} aria-hidden="true">
      <div className="flex gap-4 pb-2 border-b border-slate-800">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 rounded" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-3.5 flex-1 rounded opacity-75" />
          ))}
        </div>
      ))}
    </div>
  );
}
