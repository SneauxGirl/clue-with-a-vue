import type { Category, CategoryGroup, FraudEvent, HourBucket, Outcome, RiskMetrics, SortState } from './types'

const CATEGORY_ORDER: readonly Category[] = ['login', 'signup', 'payment', 'password-reset']
const OUTCOME_ORDER: readonly Outcome[] = ['allowed', 'challenged', 'blocked']

const HOUR_MS = 3_600_000
const TIMELINE_HOURS = 24

export function filterEventsByOutcome(events: FraudEvent[], outcome: Outcome | null): FraudEvent[] {
  if (outcome === null) return events
  return events.filter((event) => event.outcome === outcome)
}

export function sortEvents(events: FraudEvent[], sort: SortState): FraudEvent[] {
  const direction = sort.direction === 'asc' ? 1 : -1
  return [...events].sort((a, b) => {
    switch (sort.field) {
      case 'timestamp':
        return a.timestamp.localeCompare(b.timestamp) * direction
      case 'category':
        return a.category.localeCompare(b.category) * direction
      case 'outcome':
        return (OUTCOME_ORDER.indexOf(a.outcome) - OUTCOME_ORDER.indexOf(b.outcome)) * direction
      case 'riskScore':
        return (a.riskScore - b.riskScore) * direction
      case 'geolocation':
        return a.geolocation.localeCompare(b.geolocation) * direction
      case 'reason':
        return (a.reason ?? '').localeCompare(b.reason ?? '') * direction
    }
  })
}

export function groupEventsByCategory(events: FraudEvent[]): CategoryGroup[] {
  const groups = new Map<Category, FraudEvent[]>()
  for (const category of CATEGORY_ORDER) groups.set(category, [])
  for (const event of events) groups.get(event.category)?.push(event)

  return CATEGORY_ORDER.map((category) => {
    const categoryEvents = groups.get(category) ?? []
    return { category, events: categoryEvents, count: categoryEvents.length }
  }).filter((group) => group.count > 0)
}

/**
 * Buckets events into the 24 hours ending at `now`, oldest first.
 *
 * `now` is a parameter rather than a `Date.now()` call so the window is anchored
 * by the caller to the payload's `asOf` (when the dataset's 24h window ended)
 * instead of drifting with wall clock time while the page sits open.
 */
export function bucketEventsByHour(events: FraudEvent[], now: number): HourBucket[] {
  const buckets: HourBucket[] = Array.from({ length: TIMELINE_HOURS }, (_, index) => ({
    hourEnd: now - (TIMELINE_HOURS - 1 - index) * HOUR_MS,
    allowed: 0,
    challenged: 0,
    blocked: 0,
  }))

  for (const event of events) {
    const hoursAgo = Math.floor((now - new Date(event.timestamp).getTime()) / HOUR_MS)
    if (hoursAgo < 0 || hoursAgo >= TIMELINE_HOURS) continue
    buckets[TIMELINE_HOURS - 1 - hoursAgo][event.outcome] += 1
  }

  return buckets
}

export function calculateRiskMetrics(events: FraudEvent[]): RiskMetrics {
  const byOutcome = { allowed: 0, challenged: 0, blocked: 0 } satisfies Record<Outcome, number>
  const byCategory = {
    login: 0,
    signup: 0,
    payment: 0,
    'password-reset': 0,
  } satisfies Record<Category, number>

  let riskScoreSum = 0
  for (const event of events) {
    byOutcome[event.outcome] += 1
    byCategory[event.category] += 1
    riskScoreSum += event.riskScore
  }

  return {
    total: events.length,
    averageRiskScore: events.length === 0 ? 0 : Math.round(riskScoreSum / events.length),
    byOutcome,
    byCategory,
  }
}
