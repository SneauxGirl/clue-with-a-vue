<script setup lang="ts">
import { computed, ref } from 'vue'
import Badge from '../../../ui/common/Badge.vue'
import { calculateRiskMetrics, groupEventsByCategory, sortEvents } from '../transforms'
import type { FraudEvent, OutcomeFilter, SortField, SortState } from '../types'

const props = defineProps<{
  events: FraudEvent[]
  /** Full unfiltered count — when set and larger than `events.length`, summary shows "N of M". */
  totalCount?: number
  /** Active outcome filter — when set, summary names the filter instead of per-outcome counts. */
  outcomeFilter?: OutcomeFilter
  groupByCategory: boolean
}>()

const sort = ref<SortState>({ field: 'timestamp', direction: 'desc' })
/**
 * Caret preview: focus → hover → active sort.
 * Keyboard focus wins over hover so Tab and the caret stay on the same header.
 */
const focusedField = ref<SortField | null>(null)
const hoveredField = ref<SortField | null>(null)

const COLUMNS: { field: SortField; label: string }[] = [
  { field: 'timestamp', label: 'Timestamp' },
  { field: 'category', label: 'Category' },
  { field: 'outcome', label: 'Outcome' },
  { field: 'riskScore', label: 'Risk score' },
  { field: 'geolocation', label: 'Location' },
  { field: 'reason', label: 'Reason' },
]

function toggleSort(field: SortField) {
  sort.value =
    sort.value.field === field
      ? { field, direction: sort.value.direction === 'asc' ? 'desc' : 'asc' }
      : { field, direction: 'desc' }
}

function ariaSortFor(field: SortField): 'ascending' | 'descending' | 'none' {
  if (sort.value.field !== field) return 'none'
  return sort.value.direction === 'asc' ? 'ascending' : 'descending'
}

const pointedField = computed(() => focusedField.value ?? hoveredField.value ?? sort.value.field)

function caretFor(field: SortField): string {
  if (pointedField.value !== field) return ''
  const direction =
    sort.value.field === field ? sort.value.direction : 'desc'
  return direction === 'asc' ? '▲' : '▼'
}

const sortedEvents = computed(() => sortEvents(props.events, sort.value))
const metrics = computed(() => calculateRiskMetrics(props.events))
const groups = computed(() => (props.groupByCategory ? groupEventsByCategory(sortedEvents.value) : null))

const eventCountLabel = computed(() => {
  const shown = metrics.value.total
  const total = props.totalCount
  if (total != null && total !== shown) return `${shown} of ${total} events`
  return `${shown} events`
})

const summaryDetail = computed(() => {
  const filter = props.outcomeFilter
  if (filter) return filter
  const { allowed, challenged, blocked } = metrics.value.byOutcome
  return `${allowed} allowed, ${challenged} challenged, ${blocked} blocked`
})

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="text-sm text-slate-400" aria-live="polite">
      {{ eventCountLabel }} — {{ summaryDetail }}. Avg risk score {{ metrics.averageRiskScore }}.
    </p>

    <!-- TODO style: table body uses text-sm / mono text-xs — raise to typography floors in the styles pass. -->
    <div
      class="overflow-x-auto rounded-lg border border-surface-border"
      role="region"
      aria-label="Fraud events table"
      tabindex="0"
    >
      <table class="w-full border-collapse text-left text-sm">
        <thead class="border-b border-surface-border bg-surface-raised text-xs text-slate-400">
          <tr>
            <th
              v-for="col in COLUMNS"
              :key="col.field"
              scope="col"
              :aria-sort="ariaSortFor(col.field)"
              class="p-0 font-medium"
            >
              <button
                type="button"
                class="inline-flex w-full items-center gap-1 px-3 py-2 text-left transition duration-150 ease-out hover:text-slate-200 active:scale-[0.97]"
                :aria-label="`Sort by ${col.label}`"
                @click="toggleSort(col.field)"
                @focus="focusedField = col.field"
                @blur="focusedField = null"
                @mouseenter="hoveredField = col.field"
                @mouseleave="hoveredField = null"
              >
                {{ col.label }}
                <span aria-hidden="true" class="inline-block w-3 shrink-0 text-center">{{ caretFor(col.field) }}</span>
              </button>
            </th>
          </tr>
        </thead>
        <template v-if="groups">
          <tbody v-for="group in groups" :key="group.category">
            <tr class="bg-surface-raised/60">
              <th scope="rowgroup" colspan="6" class="px-3 py-1.5 text-left text-xs font-semibold capitalize text-slate-300">
                {{ group.category }} ({{ group.count }})
              </th>
            </tr>
            <tr v-for="event in group.events" :key="event.id" class="border-b border-surface-border last:border-0">
              <td class="px-3 py-2 font-mono text-xs text-slate-300">{{ formatTimestamp(event.timestamp) }}</td>
              <td class="px-3 py-2 capitalize text-slate-300">{{ event.category }}</td>
              <td class="px-3 py-2"><Badge :label="event.outcome" :tone="event.outcome" /></td>
              <td class="px-3 py-2 text-slate-300">{{ event.riskScore }}</td>
              <td class="px-3 py-2 text-slate-400">{{ event.geolocation }}</td>
              <td class="px-3 py-2 text-slate-400">{{ event.reason ?? '—' }}</td>
            </tr>
          </tbody>
        </template>
        <tbody v-else>
          <tr v-for="event in sortedEvents" :key="event.id" class="border-b border-surface-border last:border-0">
            <td class="px-3 py-2 font-mono text-xs text-slate-300">{{ formatTimestamp(event.timestamp) }}</td>
            <td class="px-3 py-2 capitalize text-slate-300">{{ event.category }}</td>
            <td class="px-3 py-2"><Badge :label="event.outcome" :tone="event.outcome" /></td>
            <td class="px-3 py-2 text-slate-300">{{ event.riskScore }}</td>
            <td class="px-3 py-2 text-slate-400">{{ event.geolocation }}</td>
            <td class="px-3 py-2 text-slate-400">{{ event.reason ?? '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
