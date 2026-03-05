const GITHUB_API = 'https://api.github.com'

const getHeaders = () => {
  const token = import.meta.env.VITE_GITHUB_TOKEN
  return token
    ? { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
    : { Accept: 'application/vnd.github+json' }
}

// In-memory cache per repo URL
const cache = new Map()
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Fetches commit_activity for a single repo with retry on 202 (stats computing).
 * Returns array of 52 week objects: { week, total, days: [sun..sat] }
 */
const fetchRepoActivity = async (repo, retries = 4, delay = 2500) => {
  const url = `${GITHUB_API}/repos/${repo}/stats/commit_activity`
  const cached = cache.get(url)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers: getHeaders() })

    if (res.status === 202) {
      // GitHub is computing stats asynchronously — wait and retry
      await wait(delay)
      continue
    }

    if (res.status === 403 || res.status === 429) {
      const reset = res.headers.get('X-RateLimit-Reset')
      throw new Error(`GitHub rate limit hit. Resets at ${new Date(reset * 1000).toLocaleTimeString()}. Add VITE_GITHUB_TOKEN to .env for higher limits.`)
    }

    if (!res.ok) throw new Error(`GitHub API ${res.status} for ${repo}`)

    const data = await res.json()
    cache.set(url, { data, timestamp: Date.now() })
    return data
  }

  return null // Stats still not ready after retries
}

/**
 * Fetches and aggregates commit activity across all repos for a chain.
 * Returns { weeks: [{week, total, days}], totalCommits } or null on failure.
 */
export const fetchChainActivity = async (repos) => {
  const results = await Promise.allSettled(
    repos.map(repo => fetchRepoActivity(repo))
  )

  const valid = results
    .filter(r => r.status === 'fulfilled' && Array.isArray(r.value) && r.value.length > 0)
    .map(r => r.value)

  if (valid.length === 0) return null

  // Sum daily commits across all repos for each week/day slot
  const weeks = valid[0].map((week, wi) => {
    const combinedDays = week.days.map((_, di) =>
      valid.reduce((sum, data) => sum + (data[wi]?.days[di] ?? 0), 0)
    )
    return {
      week: week.week,
      total: combinedDays.reduce((a, b) => a + b, 0),
      days: combinedDays,
    }
  })

  const totalCommits = weeks.reduce((sum, w) => sum + w.total, 0)
  return { weeks, totalCommits }
}
