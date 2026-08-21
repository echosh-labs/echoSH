import {
  FoundationalStatement,
  ContextNode,
  DashaOverview,
  Nakshatra,
  AlchemicalPrinciple,
  AuthorOpus,
  OracleContemplation,
  DashaTransition,
  HealthStatus
} from "@/types";

const API_BASE = typeof window !== "undefined" 
  ? "/api" 
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api");

export async function fetchHealth(): Promise<HealthStatus | null> {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchFoundationalStatement(): Promise<FoundationalStatement | null> {
  try {
    const res = await fetch(`${API_BASE}/statement`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchRawStatement(): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/statement/raw`, { cache: "no-store" });
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  }
}

export async function fetchContextNodes(category?: string): Promise<ContextNode[]> {
  try {
    const url = category ? `${API_BASE}/context?category=${category}` : `${API_BASE}/context`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchContextNodeDetail(key: string): Promise<ContextNode | null> {
  try {
    const res = await fetch(`${API_BASE}/context/${encodeURIComponent(key)}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchDashaOverview(): Promise<DashaOverview | null> {
  try {
    const res = await fetch(`${API_BASE}/dasha`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchNakshatras(): Promise<Nakshatra[]> {
  try {
    const res = await fetch(`${API_BASE}/nakshatras`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchAlchemicalPrinciples(): Promise<AlchemicalPrinciple[]> {
  try {
    const res = await fetch(`${API_BASE}/alchemical`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchAuthorOpus(): Promise<AuthorOpus | null> {
  try {
    const res = await fetch(`${API_BASE}/author`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchDailyOracle(): Promise<OracleContemplation | null> {
  try {
    const res = await fetch(`${API_BASE}/oracle/daily`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchTransitionPortal(): Promise<DashaTransition | null> {
  try {
    const res = await fetch(`${API_BASE}/transition/threshold`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchAudioPresets(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/audio/presets`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

