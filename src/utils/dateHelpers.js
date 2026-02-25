export const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000)
  const intervals = {
    y: 31536000,
    mo: 2592000,
    w: 604800,
    d: 86400,
    h: 3600,
    m: 60
  }

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit)
    if (interval >= 1) {
      return `${interval}${unit}`
    }
  }
  return 'now'
}
