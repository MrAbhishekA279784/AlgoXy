import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_FILE = path.join(__dirname, '../../data/cache/generatedResponses.json');

let cacheInit: [string, { value: any; expires: number }][] = [];
try {
  const fileData = readFileSync(CACHE_FILE, 'utf-8');
  const parsed = JSON.parse(fileData);
  if (!Array.isArray(parsed)) {
    cacheInit = Object.entries(parsed);
  } else if (parsed.length === 0) {
    cacheInit = [];
  } else {
    cacheInit = parsed;
  }
} catch {
  // empty
}
export const cache: Map<string, { value: any; expires: number }> = new Map(cacheInit as any);

export const saveCache = () => {
  try {
    writeFileSync(CACHE_FILE, JSON.stringify(Object.fromEntries(cache.entries())), 'utf-8');
  } catch (e) {
    console.error('Failed to save cache', e);
  }
};

const originalDelete = cache.delete.bind(cache);
cache.delete = function(key: string) {
  const res = originalDelete(key);
  saveCache();
  return res;
};

export const CACHE_TTL = {
  jobs: 60 * 60 * 1000,       // 1 hour
  interview: 24 * 60 * 60 * 1000, // 24h
  test: 24 * 60 * 60 * 1000,
  career: 60 * 60 * 1000,
};

export function cacheGet(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) { cache.delete(key); return null; }
  return entry.value;
}

export function cacheSet(key: string, value: any, ttl = CACHE_TTL.career): void {
  cache.set(key, { value, expires: Date.now() + ttl });
  saveCache();
}
