<script setup lang="ts">
export type BadgeTone = 'low' | 'medium' | 'high' | 'critical' | 'allowed' | 'challenged' | 'blocked' | 'neutral'

defineProps<{
  label: string
  tone: BadgeTone
}>()

// Color + text together, never color alone (WCAG SC 1.4.1) — the dot is decorative,
// the label text is what actually distinguishes each tone.
const TONE_CLASSES: Record<BadgeTone, string> = {
  low: 'bg-risk-low/15 text-blue-300',
  allowed: 'bg-risk-low/15 text-blue-300',
  medium: 'bg-risk-medium/15 text-amber-300',
  challenged: 'bg-risk-medium/15 text-amber-300',
  high: 'bg-risk-high/15 text-red-300',
  blocked: 'bg-risk-high/15 text-red-300',
  critical: 'bg-risk-critical/15 text-purple-300',
  neutral: 'bg-slate-700/40 text-slate-300',
}

const DOT_CLASSES: Record<BadgeTone, string> = {
  low: 'bg-risk-low',
  allowed: 'bg-risk-low',
  medium: 'bg-risk-medium',
  challenged: 'bg-risk-medium',
  high: 'bg-risk-high',
  blocked: 'bg-risk-high',
  critical: 'bg-risk-critical',
  neutral: 'bg-slate-400',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
      TONE_CLASSES[tone],
    ]"
  >
    <span aria-hidden="true" :class="['size-1.5 rounded-full', DOT_CLASSES[tone]]" />
    {{ label }}
  </span>
</template>
