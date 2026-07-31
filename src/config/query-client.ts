import { QueryClient } from '@tanstack/vue-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // No automatic retries: errors here are deliberate mock outcomes (invalid
      // IP, simulated fetch failure), not transient network blips, and the UI
      // exposes its own manual "Retry" action (see ErrorAlert).
      retry: false,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
})
