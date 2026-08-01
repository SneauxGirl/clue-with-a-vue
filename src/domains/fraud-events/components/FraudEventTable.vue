<script setup lang="ts">
import { computed, ref } from 'vue'
import Badge from '../../../ui/common/Badge.vue'
import { calculateRiskMetrics, groupEventsByCategory, sortEvents } from '../transforms'
import type { FraudEvent, SortField, SortState } from '../types'

const props = defineProps<{
  events: FraudEvent[]
  groupByCategory: boolean
}>()

const sort = ref<SortState>({ field: 'timestamp', direction: 'desc' })

const COLUMNS: { field: SortField; label: string }[] = [
  { field: 'timestamp', label: 'Timestamp' },
  { field: 'category', label: 'Category' },
  { field: 'outcome', label: 'Outcome' },
  { field: 'riskScore', label: 'Risk score' },
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

const sortedEvents = computed(() => sortEvents(props.events, sort.value))
// TODO ux: when a parent filter is active, show "N of M events" (pass total or unfiltered count) so metrics don't look like the full set.
const metrics = computed(() => calculateRiskMetrics(props.events))
const groups = computed(() => (props.groupByCategory ? groupEventsByCategory(sortedEvents.value) : null))

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- TODO accessibility: aria-live="polite" on this summary so filter/sort changes are announced. -->
    <p class="text-sm text-slate-400">
      {{ metrics.total }} events — {{ metrics.byOutcome.allowed }} allowed, {{ metrics.byOutcome.challenged }} challenged,
      {{ metrics.byOutcome.blocked }} blocked. Avg risk score {{ metrics.averageRiskScore }}.
    </p>

    <!-- TODO accessibility: keyboard users can't scroll this region — add tabindex="0", role="region", aria-label. -->
    <!-- TODO style: table body uses text-sm / mono text-xs — raise to typography floors in the styles pass. -->
    <div class="overflow-x-auto rounded-lg border border-surface-border">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-surface-border bg-surface-raised text-xs uppercase text-slate-400">
          <tr>
            <th
              v-for="col in COLUMNS"
              :key="col.field"
              scope="col"
              :aria-sort="ariaSortFor(col.field)"
              class="px-3 py-2 font-medium"
            >
              <button
                type="button"
                class="inline-flex items-center gap-1 transition duration-150 ease-out hover:text-slate-200 active:scale-[0.97]"
                :aria-label="`Sort by ${col.label}`"
                @click="toggleSort(col.field)"
              >
                {{ col.label }}
                <span aria-hidden="true">{{ sort.field === col.field ? (sort.direction === 'asc' ? '▲' : '▼') : '' }}</span>
              </button>
            </th>
            <th scope="col" class="px-3 py-2 font-medium">Location</th>
            <th scope="col" class="px-3 py-2 font-medium">Reason</th>
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
