// Glossary and Translation History utilities

import { openDB, type DBSchema, type IDBPDatabase } from "idb";

// ==========================================
// Glossary Management
// ==========================================

export interface GlossaryEntry {
  source: string;
  target: string;
  language: string; // target language code
}

const GLOSSARY_STORAGE_KEY = "subtitle_translator_glossary";

export const loadGlossary = (): GlossaryEntry[] => {
  try {
    const data = localStorage.getItem(GLOSSARY_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveGlossary = (entries: GlossaryEntry[]): void => {
  localStorage.setItem(GLOSSARY_STORAGE_KEY, JSON.stringify(entries));
};

export const addGlossaryEntry = (entry: GlossaryEntry): void => {
  const entries = loadGlossary();
  // Avoid duplicates: remove existing entry with same source+language
  const filtered = entries.filter((e) => !(e.source === entry.source && e.language === entry.language));
  saveGlossary([...filtered, entry]);
};

export const removeGlossaryEntry = (index: number): void => {
  const entries = loadGlossary();
  entries.splice(index, 1);
  saveGlossary(entries);
};

export const clearGlossary = (): void => {
  localStorage.removeItem(GLOSSARY_STORAGE_KEY);
};

/**
 * Apply glossary replacements to text.
 * Performs case-insensitive replacement for each glossary entry.
 */
export const applyGlossary = (text: string, entries: GlossaryEntry[], language: string): string => {
  const filtered = entries.filter((e) => e.language === language);
  let result = text;
  for (const entry of filtered) {
    if (entry.source.trim() && entry.target.trim()) {
      // Case-insensitive global replacement
      const regex = new RegExp(entry.source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      result = result.replace(regex, entry.target);
    }
  }
  return result;
};

/**
 * Apply glossary to subtitle content lines before translation.
 */
export const applyGlossaryToLines = (lines: string[], glossary: GlossaryEntry[], targetLanguage: string): string[] => {
  return lines.map((line) => applyGlossary(line, glossary, targetLanguage));
};

// ==========================================
// Translation History (IndexedDB)
// ==========================================

interface HistoryDB extends DBSchema {
  translations: {
    key: number;
    value: {
      id: number;
      timestamp: number;
      sourceLanguage: string;
      targetLanguage: string;
      service: string;
      sourcePreview: string;
      resultPreview: string;
      lineCount: number;
      fileName?: string;
    };
    indexes: { timestamp: number };
  };
}

const DB_NAME = "subtitle-translator-history";
const DB_VERSION = 1;
const STORE_NAME = "translations";
const MAX_HISTORY = 100;

let dbPromise: Promise<IDBPDatabase<HistoryDB>> | null = null;

const getDb = async (): Promise<IDBPDatabase<HistoryDB>> => {
  if (dbPromise) return dbPromise;
  dbPromise = openDB<HistoryDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      store.createIndex("timestamp", "timestamp");
    },
  });
  return dbPromise;
};

export interface HistoryEntry {
  id: number;
  timestamp: number;
  sourceLanguage: string;
  targetLanguage: string;
  service: string;
  sourcePreview: string;
  resultPreview: string;
  lineCount: number;
  fileName?: string;
}

export const addHistoryEntry = async (entry: Omit<HistoryEntry, "id" | "timestamp">): Promise<void> => {
  try {
    const db = await getDb();
    const id = await db.add(STORE_NAME, {
      ...entry,
      timestamp: Date.now(),
    });

    // Clean up old entries if over limit
    const count = await db.count(STORE_NAME);
    if (count > MAX_HISTORY) {
      const oldestEntries = await db.getAllFromIndex(STORE_NAME, "timestamp", undefined, count - MAX_HISTORY);
      for (const old of oldestEntries) {
        await db.delete(STORE_NAME, old.id);
      }
    }
  } catch (e) {
    console.warn("Failed to save translation history:", e);
  }
};

export const getHistoryEntries = async (limit: number = 20): Promise<HistoryEntry[]> => {
  try {
    const db = await getDb();
    const entries = await db.getAllFromIndex(STORE_NAME, "timestamp", undefined, limit);
    return entries.reverse(); // newest first
  } catch (e) {
    console.warn("Failed to load translation history:", e);
    return [];
  }
};

export const clearHistory = async (): Promise<void> => {
  try {
    const db = await getDb();
    await db.clear(STORE_NAME);
  } catch (e) {
    console.warn("Failed to clear translation history:", e);
  }
};

export const deleteHistoryEntry = async (id: number): Promise<void> => {
  try {
    const db = await getDb();
    await db.delete(STORE_NAME, id);
  } catch (e) {
    console.warn("Failed to delete history entry:", e);
  }
};
