import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mercury Dasha | Justin Andrew Wood",
  description: "A Full-Stack Esoteric Compendium & Astrological Engine dedicated to the Qualities, Alchemy, and 17-Year Mahadasha of Mercury.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#05070a] text-slate-100 min-h-screen antialiased">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),rgba(255,255,255,0))] pointer-events-none z-0" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.06),transparent_60%)] pointer-events-none z-0" />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
