/**
 * Shared GitHub API utilities.
 * Single source of truth for auth headers and in-memory caching.
 */

/**
 * Build GitHub API request headers, attaching the bearer token when available.
 * @returns {Object} Headers object
 */
export const getGitHubHeaders = () => {
  const token = import.meta.env.VITE_GITHUB_TOKEN
  return token
    ? { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
    : { Accept: 'application/vnd.github+json' }
}

/**
 * Create a simple in-memory cache with a configurable TTL.
 * @param {number} ttl - Time-to-live in milliseconds
 * @returns {{ get: Function, set: Function, has: Function }}
 */
export const createCache = (ttl) => {
  const store = new Map()
  return {
    get: (key) => store.get(key)?.data ?? null,
    set: (key, data) => store.set(key, { data, ts: Date.now() }),
    has: (key) => {
      const entry = store.get(key)
      return entry != null && Date.now() - entry.ts < ttl
    },
  }
}
