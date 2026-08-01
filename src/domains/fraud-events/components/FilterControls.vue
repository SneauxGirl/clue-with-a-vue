<script setup lang="ts">
import type { Outcome, OutcomeFilter } from '../types'

defineProps<{
  outcome: OutcomeFilter
  groupByCategory: boolean
}>()

const emit = defineEmits<{
  'update:outcome': [OutcomeFilter]
  'update:groupByCategory': [boolean]
}>()

const OUTCOMES: readonly Outcome[] = ['allowed', 'challenged', 'blocked']
</script>

<template>
  <!-- TODO style: filter pills use text-xs — raise to typography floor (≥0.875rem captions / ≥1rem controls). -->
  <div class="flex flex-wrap items-center gap-4">
    <fieldset class="flex flex-wrap items-center gap-2">
      <legend class="sr-only">Filter by outcome</legend>
      <button
        type="button"
        :aria-pressed="outcome === null"
        :class="[
          'rounded-full px-3 py-1 text-xs font-medium transition duration-150 ease-out active:scale-[0.97]',
          outcome === null ? 'bg-slate-200 text-slate-900' : 'bg-surface-raised text-slate-300 border border-surface-border hover:border-slate-500',
        ]"
        @click="emit('update:outcome', null)"
      >
        All
      </button>
      <button
        v-for="value in OUTCOMES"
        :key="value"
        type="button"
        :aria-pressed="outcome === value"
        :class="[
          'rounded-full px-3 py-1 text-xs font-medium capitalize transition duration-150 ease-out active:scale-[0.97]',
          outcome === value ? 'bg-slate-200 text-slate-900' : 'bg-surface-raised text-slate-300 border border-surface-border hover:border-slate-500',
        ]"
        @click="emit('update:outcome', value)"
      >
        {{ value }}
      </button>
    </fieldset>

    <label class="flex items-center gap-2 text-sm text-slate-300">
      <input
        type="checkbox"
        :checked="groupByCategory"
        class="size-4 rounded border-surface-border bg-surface text-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
        @change="emit('update:groupByCategory', ($event.target as HTMLInputElement).checked)"
      />
      Group by category
    </label>
  </div>
</template>
