import { z } from 'zod'
import { ERROR_TRIGGER_IP, generateIPAnalysis, simulateNetworkDelay } from '../../config/mock-data'
import { IPAnalysisFetchError, InvalidIPError, type IPAnalysisResult } from './types'

// IPv4 only (dotted-quad, 0-255 per octet) — matches the "192.168.1.1" format this UI advertises.
const IPV4_REGEX =
  /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/

export function isValidIPv4(value: string): boolean {
  return IPV4_REGEX.test(value.trim())
}

const ipAnalysisSchema = z.object({
  ip: z.string(),
  fraudScore: z.number().min(0).max(100),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  isVPN: z.boolean(),
  isProxy: z.boolean(),
  isTor: z.boolean(),
  country: z.string(),
  abuseReportCount: z.number().int().min(0),
  lastAbuseReportDate: z.string().nullable(),
  isInDatacenter: z.boolean(),
  asn: z.string(),
  organization: z.string(),
}) satisfies z.ZodType<IPAnalysisResult>

/**
 * Fetches (mock) fraud analysis for an IP address.
 *
 * Mirrors what a real integration needs even though everything here is mocked:
 * - input validated client-side before it ever reaches a request
 * - response validated with zod, as if the API could return malformed data
 * - a real backend would also need rate-limiting and CORS/CSP headers scoped to
 *   this origin; see SECURITY.md
 */
export async function fetchIPAnalysis(ip: string): Promise<IPAnalysisResult> {
  const trimmed = ip.trim()
  if (!isValidIPv4(trimmed)) {
    throw new InvalidIPError(trimmed)
  }

  await simulateNetworkDelay()

  if (trimmed === ERROR_TRIGGER_IP) {
    throw new IPAnalysisFetchError(trimmed)
  }

  const raw = generateIPAnalysis(trimmed)
  const result = ipAnalysisSchema.safeParse(raw)
  if (!result.success) {
    throw new IPAnalysisFetchError(trimmed)
  }

  return result.data
}
