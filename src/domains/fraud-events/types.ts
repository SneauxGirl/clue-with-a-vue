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
