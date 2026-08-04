import type { IPAnalysisResult, RiskLevel } from '../domains/ip-analysis/types'
import type { Category, FraudEvent, Outcome } from '../domains/fraud-events/types'

/**
 * Reserved IP that always fails the mock fetch, so the "Failed to fetch. Retry?"
 * error state is reachable on demand for demos instead of relying on random flake.
 */
export const ERROR_TRIGGER_IP = '0.0.0.0'

/** Simulated network latency range, in ms. */
const MIN_DELAY_MS = 400
const MAX_DELAY_MS = 900

export function simulateNetworkDelay(): Promise<void> {
  const ms = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** djb2 string hash — deterministic, non-cryptographic, good enough to seed a PRNG. */
function hashString(input: string): number {
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i)
  }
  return hash >>> 0
}

/** mulberry32 PRNG — deterministic per seed so the same IP always renders the same mock data. */
function createSeededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]
}

function riskLevelForScore(score: number): RiskLevel {
  if (score >= 85) return 'critical'
  if (score >= 60) return 'high'
  if (score >= 30) return 'medium'
  return 'low'
}

/** Paired city/country — one IP has one GeoIP location; events reuse it. */
const LOCATIONS = [
  { city: 'Ashburn', country: 'United States' },
  { city: 'Frankfurt', country: 'Germany' },
  { city: 'Amsterdam', country: 'Netherlands' },
  { city: 'Sao Paulo', country: 'Brazil' },
  { city: 'Mumbai', country: 'India' },
  { city: 'Tokyo', country: 'Japan' },
  { city: 'Toronto', country: 'Canada' },
  { city: 'London', country: 'United Kingdom' },
  { city: 'Paris', country: 'France' },
  { city: 'Singapore', country: 'Singapore' },
  { city: 'Ho Chi Minh City', country: 'Vietnam' },
  { city: 'Kyiv', country: 'Ukraine' },
  { city: 'Sydney', country: 'Australia' },
  { city: 'Warsaw', country: 'Poland' },
] as const

/** Display string matching what a live API adapter would format from city + country. */
function formatGeolocation(city: string | null, country: string): string {
  return city ? `${city}, ${country}` : country
}

const RESIDENTIAL_PROVIDERS = [
  { organization: 'Comcast Cable Communications', asn: 'AS7922' },
  { organization: 'AT&T Services', asn: 'AS7018' },
  { organization: 'Deutsche Telekom AG', asn: 'AS3320' },
  { organization: 'Vodafone Group', asn: 'AS1273' },
  { organization: 'NTT Communications', asn: 'AS2914' },
  { organization: 'Orange S.A.', asn: 'AS3215' },
] as const

const DATACENTER_PROVIDERS = [
  { organization: 'DigitalOcean, LLC', asn: 'AS14061' },
  { organization: 'OVH SAS', asn: 'AS16276' },
  { organization: 'Hetzner Online GmbH', asn: 'AS24940' },
  { organization: 'Contabo GmbH', asn: 'AS51167' },
  { organization: 'M247 Europe SRL', asn: 'AS9009' },
] as const

/**
 * Curated showcase IPs so the demo has guaranteed clean/risky examples without
 * hunting. The risky ones deliberately use RFC 5737 documentation ranges
 * (TEST-NET-1/2/3) rather than real infrastructure, so nothing here points at
 * an actual company or individual as a fraud source.
 */
const SHOWCASE_IPS: Record<string, IPAnalysisResult> = {
  '8.8.8.8': {
    ip: '8.8.8.8',
    fraudScore: 2,
    riskLevel: 'low',
    isVPN: false,
    isProxy: false,
    isTor: false,
    country: 'United States',
    city: 'Mountain View',
    abuseReportCount: 0,
    lastAbuseReportDate: null,
    isInDatacenter: true,
    asn: 'AS15169',
    organization: 'Google LLC (Public DNS)',
  },
  '1.1.1.1': {
    ip: '1.1.1.1',
    fraudScore: 1,
    riskLevel: 'low',
    isVPN: false,
    isProxy: false,
    isTor: false,
    country: 'Australia',
    city: 'Sydney',
    abuseReportCount: 0,
    lastAbuseReportDate: null,
    isInDatacenter: true,
    asn: 'AS13335',
    organization: 'Cloudflare, Inc. (Public DNS)',
  },
  '203.0.113.42': {
    ip: '203.0.113.42',
    fraudScore: 71,
    riskLevel: 'high',
    isVPN: true,
    isProxy: true,
    isTor: false,
    country: 'Netherlands',
    city: 'Amsterdam',
    abuseReportCount: 34,
    lastAbuseReportDate: '2026-07-27T14:12:00.000Z',
    isInDatacenter: true,
    asn: 'AS9009',
    organization: 'M247 Europe SRL (example VPN exit — RFC 5737 test range)',
  },
  '198.51.100.23': {
    ip: '198.51.100.23',
    fraudScore: 96,
    riskLevel: 'critical',
    isVPN: false,
    isProxy: true,
    isTor: true,
    country: 'Germany',
    city: 'Frankfurt',
    abuseReportCount: 112,
    lastAbuseReportDate: '2026-07-30T02:41:00.000Z',
    isInDatacenter: true,
    asn: 'AS24940',
    organization: 'Hetzner Online GmbH (example Tor exit — RFC 5737 test range)',
  },
  '192.0.2.77': {
    ip: '192.0.2.77',
    fraudScore: 48,
    riskLevel: 'medium',
    isVPN: false,
    isProxy: true,
    isTor: false,
    country: 'Singapore',
    city: 'Singapore',
    abuseReportCount: 6,
    lastAbuseReportDate: '2026-07-21T09:03:00.000Z',
    isInDatacenter: true,
    asn: 'AS14061',
    organization: 'DigitalOcean, LLC (example proxy — RFC 5737 test range)',
  },
}

export function getShowcaseIPs(): string[] {
  return Object.keys(SHOWCASE_IPS)
}

/** Deterministic mock IP analysis — same IP always yields the same result. */
export function generateIPAnalysis(ip: string): IPAnalysisResult {
  const showcase = SHOWCASE_IPS[ip]
  if (showcase) return showcase

  const rng = createSeededRandom(hashString(ip))

  const bandRoll = rng()
  const fraudScore =
    bandRoll < 0.55
      ? Math.floor(rng() * 30) // low: 0-29
      : bandRoll < 0.8
        ? 30 + Math.floor(rng() * 30) // medium: 30-59
        : bandRoll < 0.94
          ? 60 + Math.floor(rng() * 25) // high: 60-84
          : 85 + Math.floor(rng() * 16) // critical: 85-100

  const riskLevel = riskLevelForScore(fraudScore)
  const riskFactor = fraudScore / 100

  const isInDatacenter = rng() < 0.15 + riskFactor * 0.6
  const isVPN = rng() < riskFactor * 0.7
  const isProxy = rng() < riskFactor * 0.6
  const isTor = riskLevel !== 'low' && rng() < riskFactor * 0.25

  const provider = isInDatacenter ? pick(rng, DATACENTER_PROVIDERS) : pick(rng, RESIDENTIAL_PROVIDERS)
  const location = pick(rng, LOCATIONS)
  // Occasional country-only resolution, as real GeoIP sometimes lacks a city.
  const city = rng() < 0.1 ? null : location.city
  const abuseReportCount = Math.round(riskFactor * 80 + rng() * 15)
  const daysAgo = 1 + Math.floor(rng() * 60)
  const lastAbuseReportDate =
    abuseReportCount > 0 ? new Date(Date.now() - daysAgo * 86_400_000).toISOString() : null

  return {
    ip,
    fraudScore,
    riskLevel,
    isVPN,
    isProxy,
    isTor,
    country: location.country,
    city,
    abuseReportCount,
    lastAbuseReportDate,
    isInDatacenter,
    ...provider,
  }
}

const CATEGORIES: readonly Category[] = ['login', 'signup', 'payment', 'password-reset']

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/124.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
] as const

const BLOCK_REASONS = [
  'Known VPN/proxy IP',
  'Tor exit node',
  'Excessive failed attempts',
  'Device fingerprint mismatch',
  'Velocity abuse — multiple accounts',
  'Disposable email domain',
  'Matched abuse blocklist ASN',
] as const

/** Deterministic mock fraud events for the given IP + analysis, over the 24h ending at `now`. */
export function generateFraudEvents(
  ip: string,
  analysis: IPAnalysisResult,
  now: number,
): FraudEvent[] {
  const rng = createSeededRandom(hashString(`${ip}-events`))
  const count = 30 + Math.floor(rng() * 21)
  const riskFactor = analysis.fraudScore / 100

  const events: FraudEvent[] = []
  for (let i = 0; i < count; i++) {
    const offsetMs = rng() * 24 * 60 * 60 * 1000
    const timestamp = new Date(now - offsetMs).toISOString()

    const riskScore = Math.min(100, Math.max(0, Math.round(analysis.fraudScore + (rng() - 0.5) * 40)))

    const outcomeRoll = rng()
    const outcome: Outcome =
      outcomeRoll < 0.15 + riskFactor * 0.5
        ? 'blocked'
        : outcomeRoll < 0.35 + riskFactor * 0.35
          ? 'challenged'
          : 'allowed'

    const reason = outcome === 'allowed' ? undefined : pick(rng, BLOCK_REASONS)

    events.push({
      id: `evt-${hashString(`${ip}-${i}`).toString(36)}`,
      timestamp,
      category: pick(rng, CATEGORIES),
      outcome,
      riskScore,
      userAgent: pick(rng, USER_AGENTS),
      geolocation: formatGeolocation(analysis.city, analysis.country),
      reason,
    })
  }

  return events.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}
