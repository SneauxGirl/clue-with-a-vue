import { describe, expect, it } from 'vitest'
import {
  bucketEventsByHour,
  calculateRiskMetrics,
  filterEventsByOutcome,
  groupEventsByCategory,
  sortEvents,
} from './transforms'
import type { FraudEvent } from './types'

function event(partial: Partial<FraudEvent> & Pick<FraudEvent, 'id'>): FraudEvent {
  return {
    timestamp: '2026-08-05T12:00:00.000Z',
    category: 'login',
    outcome: 'allowed',
    riskScore: 10,
    userAgent: 'test-agent',
    geolocation: 'Austin, US',
    ...partial,
  }
}

const sample: FraudEvent[] = [
  event({
    id: 'a',
    timestamp: '2026-08-05T10:00:00.000Z',
    category: 'payment',
    outcome: 'blocked',
    riskScore: 90,
    geolocation: 'Berlin, DE',
    reason: 'Matched abuse blocklist ASN',
  }),
  event({
    id: 'b',
    timestamp: '2026-08-05T12:00:00.000Z',
    category: 'login',
    outcome: 'allowed',
    riskScore: 10,
    geolocation: 'Austin, US',
  }),
  event({
    id: 'c',
    timestamp: '2026-08-05T11:00:00.000Z',
    category: 'signup',
    outcome: 'challenged',
    riskScore: 40,
    geolocation: 'Austin, US',
    reason: 'Excessive failed attempts',
  }),
]

describe('filterEventsByOutcome', () => {
  it('returns all events when outcome is null', () => {
    expect(filterEventsByOutcome(sample, null)).toEqual(sample)
  })

  it('keeps only the requested outcome', () => {
    expect(filterEventsByOutcome(sample, 'challenged').map((e) => e.id)).toEqual(['c'])
  })
})

describe('sortEvents', () => {
  it('sorts by timestamp ascending without mutating the input', () => {
    const original = sample.map((e) => e.id)
    const sorted = sortEvents(sample, { field: 'timestamp', direction: 'asc' })
    expect(sorted.map((e) => e.id)).toEqual(['a', 'c', 'b'])
    expect(sample.map((e) => e.id)).toEqual(original)
  })

  it('sorts by riskScore descending', () => {
    expect(sortEvents(sample, { field: 'riskScore', direction: 'desc' }).map((e) => e.id)).toEqual([
      'a',
      'c',
      'b',
    ])
  })

  it('sorts by outcome using severity order', () => {
    expect(sortEvents(sample, { field: 'outcome', direction: 'asc' }).map((e) => e.outcome)).toEqual([
      'allowed',
      'challenged',
      'blocked',
    ])
  })

  it('treats missing reason as empty string', () => {
    const sorted = sortEvents(sample, { field: 'reason', direction: 'asc' })
    expect(sorted.map((e) => e.id)).toEqual(['b', 'c', 'a'])
  })
})

describe('groupEventsByCategory', () => {
  it('groups in category order and omits empty categories', () => {
    const groups = groupEventsByCategory(sample)
    expect(groups.map((g) => [g.category, g.count])).toEqual([
      ['login', 1],
      ['signup', 1],
      ['payment', 1],
    ])
  })
})

describe('bucketEventsByHour', () => {
  const now = Date.parse('2026-08-05T12:00:00.000Z')

  it('creates 24 buckets ending at now, oldest first', () => {
    const buckets = bucketEventsByHour([], now)
    expect(buckets).toHaveLength(24)
    expect(buckets[0].hourEnd).toBe(now - 23 * 3_600_000)
    expect(buckets[23].hourEnd).toBe(now)
  })

  it('counts outcomes into the hour window anchored by now', () => {
    const events = [
      event({ id: 'in-window', timestamp: '2026-08-05T11:30:00.000Z', outcome: 'blocked' }),
      event({ id: 'same-hour', timestamp: '2026-08-05T11:10:00.000Z', outcome: 'allowed' }),
      event({ id: 'too-old', timestamp: '2026-08-04T11:00:00.000Z', outcome: 'challenged' }),
      event({ id: 'future', timestamp: '2026-08-05T13:00:00.000Z', outcome: 'allowed' }),
    ]

    const buckets = bucketEventsByHour(events, now)
    const currentHour = buckets[23]
    expect(currentHour.hourEnd).toBe(now)
    expect(currentHour.blocked).toBe(1)
    expect(currentHour.allowed).toBe(1)
    expect(buckets.reduce((sum, b) => sum + b.challenged, 0)).toBe(0)
  })
})

describe('calculateRiskMetrics', () => {
  it('returns zeros for an empty list', () => {
    expect(calculateRiskMetrics([])).toEqual({
      total: 0,
      averageRiskScore: 0,
      byOutcome: { allowed: 0, challenged: 0, blocked: 0 },
      byCategory: { login: 0, signup: 0, payment: 0, 'password-reset': 0 },
    })
  })

  it('aggregates totals, averages, and breakdowns', () => {
    expect(calculateRiskMetrics(sample)).toEqual({
      total: 3,
      averageRiskScore: 47,
      byOutcome: { allowed: 1, challenged: 1, blocked: 1 },
      byCategory: { login: 1, signup: 1, payment: 1, 'password-reset': 0 },
    })
  })
})
