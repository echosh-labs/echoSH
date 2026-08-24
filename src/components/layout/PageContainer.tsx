import React from "react";
import { cn } from "@/lib/utils";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  glow?: "emerald" | "cyan" | "violet" | "dual" | "none";
}

export function PageContainer({
  className,
  size = "lg",
  glow = "dual",
  children,
  ...props
}: PageContainerProps) {
  const sizeClasses = {
    sm: "max-w-3xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {/* Optional Ambient Background Glow Orbs */}
      {glow === "dual" && (
        <>
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
        </>
      )}
      {glow === "emerald" && (
        <div className="absolute top-12 left-1/3 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      )}
      {glow === "violet" && (
        <div className="absolute top-12 left-1/3 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      )}
      {glow === "cyan" && (
        <div className="absolute top-12 left-1/3 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      )}

      {children}
    </div>
  );
}
