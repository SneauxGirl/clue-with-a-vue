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
  <div class="flex flex-wrap items-center gap-4">
    <fieldset class="flex flex-wrap items-center gap-2">
      <legend class="sr-only">Filter by outcome</legend>
      <button
        type="button"
        :aria-pressed="outcome === null"
        :class="[
          'rounded-full px-3 py-1 text-lg font-medium transition duration-150 ease-out active:scale-[0.97]',
          outcome === null ? 'bg-surface-elevated text-text border border-surface-border' : 'bg-surface-raised text-text-secondary border border-surface-border hover:border-text-muted hover:bg-surface-elevated',
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
          'rounded-full px-3 py-1 text-lg font-medium capitalize transition duration-150 ease-out active:scale-[0.97]',
          outcome === value ? 'bg-surface-elevated text-text border border-surface-border' : 'bg-surface-raised text-text-secondary border border-surface-border hover:border-text-muted hover:bg-surface-elevated',
        ]"
        @click="emit('update:outcome', value)"
      >
        {{ value }}
      </button>
    </fieldset>

    <label class="flex items-center gap-2 text-lg text-text-secondary">
      <input
        type="checkbox"
        :checked="groupByCategory"
        class="size-4 rounded border-surface-border bg-surface text-risk-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        @change="emit('update:groupByCategory', ($event.target as HTMLInputElement).checked)"
      />
      Group by category
    </label>
  </div>
</template>
