/**
 * Run an async mapper over items with a maximum number of concurrent tasks.
 * @template T, R
 * @param {T[]} items
 * @param {(item: T, index: number) => Promise<R>} fn
 * @param {number} limit
 * @returns {Promise<R[]>}
 */
export const mapWithConcurrency = async (items, fn, limit = 6) => {
  if (items.length === 0) return []
  const results = new Array(items.length)
  let nextIndex = 0

  const worker = async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++
      results[index] = await fn(items[index], index)
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker()
  )
  await Promise.all(workers)
  return results
}