<script setup lang="ts">
import { BarChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { computed } from 'vue'
import VChart from 'vue-echarts'
import type { FraudEvent } from '../types'

echarts.use([BarChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

const props = defineProps<{ events: FraudEvent[] }>()

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface HourBucket {
  label: string
  allowed: number
  challenged: number
  blocked: number
}

const buckets = computed<HourBucket[]>(() => {
  const now = Date.now()
  const hours: HourBucket[] = Array.from({ length: 24 }, (_, i) => {
    const hourStart = new Date(now - (23 - i) * 3_600_000)
    return { label: hourStart.toLocaleTimeString(undefined, { hour: 'numeric' }), allowed: 0, challenged: 0, blocked: 0 }
  })

  for (const event of props.events) {
    const hoursAgo = Math.floor((now - new Date(event.timestamp).getTime()) / 3_600_000)
    if (hoursAgo < 0 || hoursAgo > 23) continue
    hours[23 - hoursAgo][event.outcome] += 1
  }

  return hours
})

const option = computed(() => ({
  animation: !prefersReducedMotion,
  color: ['#2563eb', '#d97706', '#dc2626'],
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { data: ['allowed', 'challenged', 'blocked'], textStyle: { color: '#cbd5e1' } },
  grid: { left: 40, right: 12, top: 36, bottom: 24 },
  xAxis: {
    type: 'category',
    data: buckets.value.map((b) => b.label),
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
    <h2 class="mb-2 text-sm font-medium text-slate-300">Fraud events, last 24 hours</h2>
    <div role="img" aria-label="Bar chart of fraud events per hour over the last 24 hours, broken down by outcome. The full data is also available in the event table below.">
      <VChart :option="option" autoresize class="h-64 w-full" />
    </div>
  </div>
</template>
