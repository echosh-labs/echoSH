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

export interface FoundationsStage {
  id: string;
  stage_number: number;
  title: string;
  subtitle: string;
  narrative: string;
  aesthetic_theme: string;
  chakra_color: string;
  frequency_hz: number;
  harmonic_blueprint_id: string;
  created_at?: string;
}

export interface ManifestoSection {
  id: string;
  section_number: number;
  section_title: string;
  latin_maxim: string;
  body_content: string;
  created_at?: string;
}

export interface AxisDirective {
  id: string;
  keep_note_id?: string;
  content_hash?: string;
  source: string;
  title: string;
  raw_note: string;
  triaged_instruction: string;
  type: string;
  is_execute: boolean;
  status: "PENDING" | "PASSIVE_CONTEXT" | "QUEUED_FOR_AGENT" | "EXECUTING" | "COMPLETED" | "ARCHIVED" | "DISMISSED" | string;
  execution_log?: string;
  created_at: string;
  updated_at: string;
}

export interface ControlState {
  mode: "AUTO" | "MANUAL";
  ingest_policy: "EXECUTE" | "PENDING";
  poll_interval_sec: number;
  updated_at?: string;
}

export interface WorkspaceStatus {
  connected: boolean;
  mode: "LIVE_GCP" | "STANDBY_LOCAL" | string;
  auth_method?: string;
  service_account?: string;
  user_email?: string;
  scopes: string[];
  last_sync: string;
  items_indexed: number;
  last_error?: string;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  source: string;
  level: "INFO" | "EXECUTE" | "SUCCESS" | "WARN" | "ERROR" | string;
  message: string;
}

export interface NotificationRecord {
  id: string;
  event: string;
  recipient: string;
  channel: string;
  title: string;
  summary: string;
  metadata?: Record<string, string>;
  delivered: boolean;
  error?: string;
  created_at: string;
}


