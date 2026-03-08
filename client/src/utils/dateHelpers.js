export const getTimeAgo = (date, locale = 'en-US') => {
  const target = new Date(date)
  const elapsedSeconds = Math.round((target.getTime() - Date.now()) / 1000)
  const divisions = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]

  for (const [unit, secondsInUnit] of divisions) {
    if (Math.abs(elapsedSeconds) >= secondsInUnit) {
      return new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' }).format(
        Math.round(elapsedSeconds / secondsInUnit),
        unit,
      )
    }
  }

  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' }).format(0, 'second')
}
