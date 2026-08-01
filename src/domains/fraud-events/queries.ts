import { useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { z } from 'zod'
import { ERROR_TRIGGER_IP, generateFraudEvents, generateIPAnalysis, simulateNetworkDelay } from '../../config/mock-data'
import { InvalidIPError, isValidIPv4 } from '../../shared/ip'
import { FraudEventsFetchError, type FraudEvent, type FraudEventsResult } from './types'

const fraudEventSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  category: z.enum(['login', 'signup', 'payment', 'password-reset']),
  outcome: z.enum(['allowed', 'challenged', 'blocked']),
  riskScore: z.number().min(0).max(100),
  userAgent: z.string(),
  geolocation: z.string(),
  reason: z.string().optional(),
}) satisfies z.ZodType<FraudEvent>

const fraudEventsResultSchema = z.object({
  asOf: z.number(),
  events: z.array(fraudEventSchema),
}) satisfies z.ZodType<FraudEventsResult>

/**
 * Mock fetch for the event list. Kept alongside the query hook (no dedicated
 * services.ts in this domain) since it's a thin wrapper over the shared mock
 * generator — real validation/error handling still applies, mirroring
 * ip-analysis/services.ts.
 *
 * Captures `asOf` once so event timestamps and the timeline share the same
 * window end (a live API would return this on the payload).
 */
async function fetchFraudEvents(ip: string): Promise<FraudEventsResult> {
  const trimmed = ip.trim()
  if (!isValidIPv4(trimmed)) {
    throw new InvalidIPError(trimmed)
  }

  await simulateNetworkDelay()

  if (trimmed === ERROR_TRIGGER_IP) {
    throw new FraudEventsFetchError(trimmed)
  }

  const asOf = Date.now()
  const analysis = generateIPAnalysis(trimmed)
  const result = fraudEventsResultSchema.safeParse({
    asOf,
    events: generateFraudEvents(trimmed, analysis, asOf),
  })
  if (!result.success) {
    throw new FraudEventsFetchError(trimmed)
  }

  return result.data
}

export function useFraudEvents(ip: Ref<string>) {
  return useQuery({
    queryKey: ['fraud-events', ip],
    queryFn: () => fetchFraudEvents(ip.value),
    enabled: computed(() => isValidIPv4(ip.value)),
  })
}
