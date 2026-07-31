import { useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { fetchIPAnalysis, isValidIPv4 } from './services'

export function useIPAnalysis(ip: Ref<string>) {
  return useQuery({
    queryKey: ['ip-analysis', ip],
    queryFn: () => fetchIPAnalysis(ip.value),
    enabled: computed(() => isValidIPv4(ip.value)),
  })
}
