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

function themeColor(varName: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  return value || fallback
}

const option = computed(() => {
  const riskLow = themeColor('--color-risk-low', '#00e7c6')
  const riskMedium = themeColor('--color-risk-medium', '#ffd93d')
  const riskHigh = themeColor('--color-risk-high', '#ff5a36')
  const border = themeColor('--color-surface-border', '#4a6d82')
  const label = themeColor('--color-text-muted', '#8aa5b4')
  const legend = themeColor('--color-text-secondary', '#bfd2dc')
  const tooltipBg = themeColor('--color-surface-card', '#12171b')
  const tooltipText = themeColor('--color-text', '#f4f9fc')

  return {
    animation: !prefersReducedMotion,
    color: [riskLow, riskMedium, riskHigh],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: tooltipBg,
      borderColor: border,
      textStyle: { color: tooltipText, fontSize: 16 },
    },
    legend: {
      data: ['allowed', 'challenged', 'blocked'],
      top: 0,
      textStyle: { color: legend, fontSize: 18 },
    },
    grid: { left: 40, right: 12, top: 44, bottom: 36 },
    xAxis: {
      type: 'category',
      data: buckets.value.map((b) => formatHour(b.hourEnd)),
      axisLine: { lineStyle: { color: border } },
      axisLabel: { color: label, fontSize: 16 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: label, fontSize: 16 },
      splitLine: { lineStyle: { color: border } },
    },
    series: [
      { name: 'allowed', type: 'bar', stack: 'total', data: buckets.value.map((b) => b.allowed) },
      { name: 'challenged', type: 'bar', stack: 'total', data: buckets.value.map((b) => b.challenged) },
      { name: 'blocked', type: 'bar', stack: 'total', data: buckets.value.map((b) => b.blocked) },
    ],
  }
})
</script>

<template>
  <div>
    <h2 class="mb-2 text-lg font-medium text-text-secondary">Fraud events — 24 hours to {{ anchorLabel }}</h2>
    <div
      role="img"
      class="h-64 w-full"
      :aria-label="`Bar chart of fraud events per hour for the 24 hours ending ${anchorLabel}, broken down by outcome. The full data is also available in the event table below.`"
    >
      <VChart :option="option" autoresize class="h-full w-full" />
    </div>
  </div>
</template>
