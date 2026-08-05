<script setup lang="ts">
export type BadgeTone = 'low' | 'medium' | 'high' | 'critical' | 'allowed' | 'challenged' | 'blocked' | 'neutral'

defineProps<{
  label: string
  tone: BadgeTone
}>()

// Color + text together, never color alone (WCAG SC 1.4.1) — the dot is decorative,
// the label text is what actually distinguishes each tone.
const TONE_CLASSES: Record<BadgeTone, string> = {
  low: 'bg-risk-low/10 text-risk-low-fg',
  allowed: 'bg-risk-low/10 text-risk-low-fg',
  medium: 'bg-risk-medium/10 text-risk-medium-fg',
  challenged: 'bg-risk-medium/10 text-risk-medium-fg',
  high: 'bg-risk-high-pill/10 text-risk-high-fg',
  blocked: 'bg-risk-high-pill/10 text-risk-high-fg',
  critical: 'bg-risk-critical/10 text-risk-critical-fg',
  neutral: 'bg-surface-elevated/60 text-text-secondary',
}

const DOT_CLASSES: Record<BadgeTone, string> = {
  low: 'bg-risk-low',
  allowed: 'bg-risk-low',
  medium: 'bg-risk-medium',
  challenged: 'bg-risk-medium',
  high: 'bg-risk-high',
  blocked: 'bg-risk-high',
  critical: 'bg-risk-critical',
  neutral: 'bg-text-muted',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-lg font-medium',
      TONE_CLASSES[tone],
    ]"
  >
    <span aria-hidden="true" :class="['size-1.5 rounded-full', DOT_CLASSES[tone]]" />
    {{ label }}
  </span>
</template>
