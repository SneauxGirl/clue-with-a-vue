import type { Category, CategoryGroup, FraudEvent, Outcome, RiskMetrics, SortState } from './types'

const CATEGORY_ORDER: readonly Category[] = ['login', 'signup', 'payment', 'password-reset']
const OUTCOME_ORDER: readonly Outcome[] = ['allowed', 'challenged', 'blocked']

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
