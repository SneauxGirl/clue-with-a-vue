import { useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { isValidIPv4 } from '../ip-analysis/services'
import { IPAnalysisFetchError, InvalidIPError } from '../ip-analysis/types'
import { ERROR_TRIGGER_IP, generateFraudEvents, generateIPAnalysis, simulateNetworkDelay } from '../../config/mock-data'
import type { FraudEvent } from './types'

/**
 * Mock fetch for the event list. Kept alongside the query hook (no dedicated
 * services.ts in this domain) since it's a thin wrapper over the shared mock
 * generator — real validation/error handling still applies, mirroring
 * ip-analysis/services.ts.
 */
async function fetchFraudEvents(ip: string): Promise<FraudEvent[]> {
  const trimmed = ip.trim()
  if (!isValidIPv4(trimmed)) {
    throw new InvalidIPError(trimmed)
  }

  await simulateNetworkDelay()

  if (trimmed === ERROR_TRIGGER_IP) {
    throw new IPAnalysisFetchError(trimmed)
  }

  const analysis = generateIPAnalysis(trimmed)
  return generateFraudEvents(trimmed, analysis)
}

export function useFraudEvents(ip: Ref<string>) {
  return useQuery({
    queryKey: ['fraud-events', ip],
    queryFn: () => fetchFraudEvents(ip.value),
    enabled: computed(() => isValidIPv4(ip.value)),
  })
}
