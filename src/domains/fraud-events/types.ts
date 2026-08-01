export type Outcome = 'allowed' | 'challenged' | 'blocked'
export type Category = 'login' | 'signup' | 'payment' | 'password-reset'

export interface FraudEvent {
  id: string
  timestamp: string
  category: Category
  outcome: Outcome
  riskScore: number
  userAgent: string
  geolocation: string
  reason?: string
}

export type SortField = 'timestamp' | 'category' | 'riskScore' | 'outcome'
export type SortDirection = 'asc' | 'desc'

export interface SortState {
  field: SortField
  direction: SortDirection
}

/** `null` means "all outcomes" — no filter applied. */
export type OutcomeFilter = Outcome | null

export interface FilterState {
  outcome: OutcomeFilter
  groupByCategory: boolean
}

export interface CategoryGroup {
  category: Category
  events: FraudEvent[]
  count: number
}

export interface RiskMetrics {
  total: number
  averageRiskScore: number
  byOutcome: Record<Outcome, number>
  byCategory: Record<Category, number>
}

/**
 * One hour of the timeline. `hourEnd` is the epoch ms upper bound of the span this
 * bucket counts, and doubles as its axis label; formatting is the chart's job.
 */
export interface HourBucket {
  hourEnd: number
  allowed: number
  challenged: number
  blocked: number
}

/**
 * Events payload for one IP lookup. `asOf` is the epoch-ms end of the 24h window —
 * event timestamps and the timeline chart both use it (mock and live API alike).
 */
export interface FraudEventsResult {
  asOf: number
  events: FraudEvent[]
}

export class FraudEventsFetchError extends Error {
  readonly ip: string

  constructor(ip: string) {
    super('Failed to fetch. Retry?')
    this.name = 'FraudEventsFetchError'
    this.ip = ip
  }
}
