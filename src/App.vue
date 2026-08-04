<script setup lang="ts">
import { computed, ref } from 'vue'
import IPSearchBar from './domains/ip-analysis/components/IPSearchBar.vue'
import IPSummaryCards from './domains/ip-analysis/components/IPSummaryCards.vue'
import { useIPAnalysis } from './domains/ip-analysis/queries'
import EventTimeline from './domains/fraud-events/components/EventTimeline.vue'
import FilterControls from './domains/fraud-events/components/FilterControls.vue'
import FraudEventTable from './domains/fraud-events/components/FraudEventTable.vue'
import { useFraudEvents } from './domains/fraud-events/queries'
import { filterEventsByOutcome } from './domains/fraud-events/transforms'
import type { OutcomeFilter } from './domains/fraud-events/types'
import Card from './ui/common/Card.vue'
import ErrorAlert from './ui/common/ErrorAlert.vue'
import LoadingSpinner from './ui/common/LoadingSpinner.vue'
import PageLayout from './ui/layouts/PageLayout.vue'

const searchedIP = ref('')
const outcomeFilter = ref<OutcomeFilter>(null)
const groupByCategory = ref(false)

const analysisQuery = useIPAnalysis(searchedIP)
const eventsQuery = useFraudEvents(searchedIP)

// Spinner for first load and for Retry after error (isLoading is false once a query
// has settled with an error — isFetching && !data covers that refetch).
const isLoading = computed(() => {
  const analysisBusy =
    analysisQuery.isLoading.value ||
    (analysisQuery.isFetching.value && !analysisQuery.data.value)
  const eventsBusy =
    eventsQuery.isLoading.value || (eventsQuery.isFetching.value && !eventsQuery.data.value)
  return analysisBusy || eventsBusy
})
const errorMessage = computed(() => analysisQuery.error.value?.message ?? eventsQuery.error.value?.message ?? null)
const hasSearched = computed(() => searchedIP.value !== '')
const allEvents = computed(() => eventsQuery.data.value?.events ?? [])
const filteredEvents = computed(() => filterEventsByOutcome(allEvents.value, outcomeFilter.value))

// Same `asOf` the fetch used to stamp event timestamps — not TanStack's
// dataUpdatedAt, so the chart window matches the dataset (live API: map
// server windowEnd → asOf in the fetch adapter).
const timelineAnchor = computed(() => eventsQuery.data.value?.asOf ?? Date.now())

function handleSearch(ip: string) {
  // New investigation → clear view filters. Same IP again keeps them.
  if (ip !== searchedIP.value) {
    outcomeFilter.value = null
    groupByCategory.value = false
  }
  searchedIP.value = ip
}

function handleRetry() {
  analysisQuery.refetch()
  eventsQuery.refetch()
}
</script>

<template>
  <PageLayout>
    <div class="flex flex-col gap-6">
      <Card>
        <IPSearchBar :loading="isLoading" @search="handleSearch" />
      </Card>

      <LoadingSpinner v-if="isLoading" label="Searching for fraud data" />

      <ErrorAlert v-else-if="errorMessage" :message="errorMessage" retryable @retry="handleRetry" />

      <p v-else-if="!hasSearched" class="rounded-lg border border-dashed border-surface-border p-8 text-center text-sm text-slate-400">
        Search an IP to see fraud events
      </p>

      <template v-else-if="analysisQuery.data.value && eventsQuery.data.value">
        <IPSummaryCards :analysis="analysisQuery.data.value" />

        <Card>
          <EventTimeline :events="filteredEvents" :now="timelineAnchor" />
        </Card>

        <Card>
          <div class="flex flex-col gap-4">
            <FilterControls
              :outcome="outcomeFilter"
              :group-by-category="groupByCategory"
              @update:outcome="outcomeFilter = $event"
              @update:group-by-category="groupByCategory = $event"
            />
            <p
              v-if="filteredEvents.length === 0"
              class="rounded-lg border border-dashed border-surface-border p-6 text-center text-sm text-slate-400"
            >
              No events match this outcome filter.
            </p>
            <FraudEventTable
              v-else
              :events="filteredEvents"
              :total-count="allEvents.length"
              :outcome-filter="outcomeFilter"
              :group-by-category="groupByCategory"
            />
          </div>
        </Card>
      </template>
    </div>
  </PageLayout>
</template>
