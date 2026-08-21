export interface FoundationalStatement {
  id: string;
  title: string;
  author: string;
  statement: string;
  archetypes: string[];
  correspondences: Record<string, string>;
  created_at: string;
  source_file: string;
}

export interface ContextRelation {
  key: string;
  title: string;
  category: string;
  relation_type: string;
}

export interface ContextNode {
  key: string;
  category: "alchemy" | "astrology" | "hermetic" | "author_opus" | "dasha" | string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  relative_keys: string[];
  relative_context?: ContextRelation[];
  metadata?: Record<string, string>;
  updated_at: string;
}

export interface DashaSubPeriod {
  sub_lord: string;
  duration_years: number;
  duration_months: number;
  duration_days: number;
  qualities: string;
  psychological: string;
  material: string;
  esoteric: string;
  talismanic: string;
}

export interface DashaOverview {
  mahadasha_lord: string;
  total_years: number;
  vimshottari_order: number;
  seed_deity: string;
  gemstone: string;
  mantra: string;
  description: string;
  sub_periods: DashaSubPeriod[];
}

export interface Nakshatra {
  name: string;
  sanskrit: string;
  zodiac_span: string;
  symbol: string;
  deity: string;
  shakti: string;
  esoteric_meaning: string;
  qualities: string[];
}

export interface AlchemicalPrinciple {
  principle: string;
  latin_name: string;
  symbol: string;
  element: string;
  role: string;
  description: string;
  properties: string[];
}

export interface OpusEssay {
  slug: string;
  title: string;
  date: string;
  theme: string;
  abstract: string;
  content: string;
  key_insights: string[];
}

export interface LifeEvent {
  period: string;
  title: string;
  cycle: string;
  description: string;
  mercurial_resonance: string;
}

export interface AuthorOpus {
  author: string;
  bio: string;
  opus_title: string;
  essays: OpusEssay[];
  chronology: LifeEvent[];
}

export interface OracleContemplation {
  date: string;
  day_of_week: string;
  theme: string;
  aphorism: string;
  presiding_deity: string;
  hermetic_key: string;
  daily_exercise: string;
  mercurial_tune: string[];
}

export interface DashaTransition {
  id: string;
  native_name: string;
  current_mahadasha: string;
  current_antardasha: string;
  cycle_name: string;
  target_ingress_date: string;
  days_remaining: number;
  months_remaining: number;
  theme: string;
  saturnine_mastery: string[];
  jupiterian_synthesis: string[];
  mercurial_readiness: string[];
}

export interface HealthStatus {
  status: string;
  postgres: string;
  boltdb: string;
  embedded: string;
  project: string;
  author: string;
  version: string;
  service: string;
}
