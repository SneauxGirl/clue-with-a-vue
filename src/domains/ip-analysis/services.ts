import { z } from 'zod'
import { ERROR_TRIGGER_IP, generateIPAnalysis, simulateNetworkDelay } from '../../config/mock-data'
import { InvalidIPError, isValidIPv4 } from '../../shared/ip'
import { IPAnalysisFetchError, type IPAnalysisResult } from './types'

const ipAnalysisSchema = z.object({
  ip: z.string(),
  fraudScore: z.number().min(0).max(100),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  isVPN: z.boolean(),
  isProxy: z.boolean(),
  isTor: z.boolean(),
  country: z.string(),
  city: z.string().nullable(),
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
 * - rate-limiting and CORS would be the backend's job; CSP is this app's own to set
 *   at deploy time — see SECURITY.md
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
