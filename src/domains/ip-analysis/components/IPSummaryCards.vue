<script setup lang="ts">
import { computed } from 'vue'
import Badge, { type BadgeTone } from '../../../ui/common/Badge.vue'
import Card from '../../../ui/common/Card.vue'
import type { IPAnalysisResult } from '../types'

const props = defineProps<{ analysis: IPAnalysisResult }>()

const riskTone = computed<BadgeTone>(() => props.analysis.riskLevel)

const signals = computed(() => [
  { label: 'VPN', active: props.analysis.isVPN },
  { label: 'Proxy', active: props.analysis.isProxy },
  { label: 'Tor', active: props.analysis.isTor },
  { label: 'Datacenter', active: props.analysis.isInDatacenter },
])

function formatDate(iso: string | null): string {
  if (!iso) return 'None reported'
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <Card>
      <p class="text-xs font-medium text-slate-400">Fraud score</p>
      <p class="mt-1 text-3xl font-semibold text-white">{{ analysis.fraudScore }}<span class="text-base text-slate-500">/100</span></p>
      <Badge class="mt-2" :label="analysis.riskLevel" :tone="riskTone" />
    </Card>

    <Card>
      <p class="text-xs font-medium text-slate-400">Risk signals</p>
      <ul class="mt-2 flex flex-wrap gap-2">
        <li v-for="signal in signals" :key="signal.label">
          <Badge :label="signal.label" :tone="signal.active ? 'high' : 'neutral'" />
        </li>
      </ul>
    </Card>

    <Card>
      <p class="text-xs font-medium text-slate-400">Location &amp; network</p>
      <p class="mt-1 text-sm text-slate-200">
        {{ analysis.city ? `${analysis.city}, ${analysis.country}` : analysis.country }}
      </p>
      <p class="text-sm text-slate-400">{{ analysis.organization }}</p>
      <p class="font-mono text-xs text-slate-500">{{ analysis.asn }}</p>
    </Card>

    <Card>
      <p class="text-xs font-medium text-slate-400">Abuse reports</p>
      <p class="mt-1 text-3xl font-semibold text-white">{{ analysis.abuseReportCount }}</p>
      <p class="text-sm text-slate-400">Last reported: {{ formatDate(analysis.lastAbuseReportDate) }}</p>
    </Card>
  </div>
</template>
