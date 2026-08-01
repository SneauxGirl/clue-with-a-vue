<script setup lang="ts">
import { BarChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { bucketEventsByHour } from '../transforms'
import type { FraudEvent } from '../types'

echarts.use([BarChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

/** `now` anchors the 24h window — same `asOf` from the events payload (see App.vue). */
const props = defineProps<{ events: FraudEvent[]; now: number }>()

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const buckets = computed(() => bucketEventsByHour(props.events, props.now))

function formatHour(epochMs: number): string {
  return new Date(epochMs).toLocaleTimeString(undefined, { hour: 'numeric' })
}

const anchorLabel = computed(() =>
  new Date(props.now).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
)

const option = computed(() => ({
  animation: !prefersReducedMotion,
  // TODO style: read risk/surface tokens from CSS vars instead of hardcoding hex (tokens live in style.css).
  // TODO style: legend overlaps x-axis labels and bar bottoms — give grid more bottom room and/or move
  // legend above the plot (legend.top / grid.bottom) so items don't collide with each other or the axis.
  color: ['#2563eb', '#d97706', '#dc2626'],
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { data: ['allowed', 'challenged', 'blocked'], textStyle: { color: '#cbd5e1' } },
  grid: { left: 40, right: 12, top: 36, bottom: 24 },
  xAxis: {
    type: 'category',
    data: buckets.value.map((b) => formatHour(b.hourEnd)),
    axisLine: { lineStyle: { color: '#2a2e38' } },
    axisLabel: { color: '#94a3b8' },
  },
  yAxis: { type: 'value', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#2a2e38' } } },
  series: [
    { name: 'allowed', type: 'bar', stack: 'total', data: buckets.value.map((b) => b.allowed) },
    { name: 'challenged', type: 'bar', stack: 'total', data: buckets.value.map((b) => b.challenged) },
    { name: 'blocked', type: 'bar', stack: 'total', data: buckets.value.map((b) => b.blocked) },
  ],
}))
</script>

<template>
  <div>
    <h2 class="mb-2 text-sm font-medium text-slate-300">Fraud events — 24 hours to {{ anchorLabel }}</h2>
    <div
      role="img"
      class="h-64 w-full"
      :aria-label="`Bar chart of fraud events per hour for the 24 hours ending ${anchorLabel}, broken down by outcome. The full data is also available in the event table below.`"
    >
      <!-- TODO style: replace inline style with Tailwind classes (also eases a strict CSP style-src). -->
      <!-- TODO performance: consider async import of vue-echarts / this component — chart dominates bundle weight. -->
      <VChart :option="option" autoresize style="width: 100%; height: 100%" />
    </div>
  </div>
</template>
