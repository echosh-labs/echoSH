/**
 * @file savedSounds.ts
 * @description A tiny persistent store for user-saved sound blueprints (e.g. a
 * `random` sound someone liked). Backed by the renderer's localStorage so the
 * collection survives app restarts without any extra IPC plumbing.
 */

import { SoundBlueprint } from './audioBlueprints'

export interface SavedSound {
  name: string
  blueprint: SoundBlueprint
  savedAt: number
}

const STORAGE_KEY = 'echosh:savedSounds'

function read(): SavedSound[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(sounds: SavedSound[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sounds))
  } catch {
    // Storage unavailable or full — fail quietly; the sound still played live.
  }
}

export const savedSounds = {
  /** All saved sounds, alphabetised by name. */
  list(): SavedSound[] {
    return read().sort((a, b) => a.name.localeCompare(b.name))
  },

  /** Looks up a saved sound by name, case-insensitively. */
  get(name: string): SavedSound | undefined {
    const lower = name.trim().toLowerCase()
    return read().find((s) => s.name.toLowerCase() === lower)
  },

  /** Picks the next free `<prefix>-N` name so auto-saves don't clash. */
  nextName(prefix = 'sound'): string {
    const taken = new Set(read().map((s) => s.name.toLowerCase()))
    let n = 1
    while (taken.has(`${prefix}-${n}`)) n++
    return `${prefix}-${n}`
  },

  /** Saves a blueprint under `name`, replacing any existing entry with that name. */
  save(name: string, blueprint: SoundBlueprint): SavedSound {
    const entry: SavedSound = { name, blueprint, savedAt: Date.now() }
    const sounds = read().filter((s) => s.name.toLowerCase() !== name.toLowerCase())
    sounds.push(entry)
    write(sounds)
    return entry
  },

  /** Removes a saved sound by name. Returns true if something was removed. */
  remove(name: string): boolean {
    const sounds = read()
    const next = sounds.filter((s) => s.name.toLowerCase() !== name.trim().toLowerCase())
    if (next.length === sounds.length) return false
    write(next)
    return true
  }
}
