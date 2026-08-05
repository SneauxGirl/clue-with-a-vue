<script setup lang="ts">
import { ref } from 'vue'
import { getShowcaseIPs } from '../../../config/mock-data'
import Button from '../../../ui/common/Button.vue'
import { isValidIPv4 } from '../../../shared/ip'

withDefaults(defineProps<{ loading?: boolean }>(), { loading: false })
const emit = defineEmits<{ search: [ip: string] }>()

const inputValue = ref('')
const error = ref<string | null>(null)
const showcaseIPs = getShowcaseIPs()

function handleSubmit() {
  const trimmed = inputValue.value.trim()
  if (!isValidIPv4(trimmed)) {
    error.value = 'Invalid IP address. Format: 192.168.1.1'
    return
  }
  error.value = null
  emit('search', trimmed)
}

function handleQuickPick(ip: string) {
  inputValue.value = ip
  error.value = null
  emit('search', ip)
}
</script>

<template>
  <form class="flex flex-col gap-2" @submit.prevent="handleSubmit">
    <label for="ip-search" class="text-base font-medium text-text-secondary">Search IP address</label>
    <div class="flex flex-col gap-2 sm:flex-row">
      <input
        id="ip-search"
        v-model="inputValue"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        placeholder="192.168.1.1"
        :aria-invalid="error !== null"
        :aria-describedby="error ? 'ip-search-error' : undefined"
        class="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-lg text-text placeholder:text-text-muted focus-visible:border-focus"
      />
      <Button type="submit" :disabled="loading" aria-label="Search fraud data for this IP address">
        {{ loading ? 'Searching…' : 'Search' }}
      </Button>
    </div>
    <p v-if="error" id="ip-search-error" role="alert" class="text-lg text-risk-high-fg">
      {{ error }}
    </p>
    <div class="flex flex-wrap items-center gap-2 pt-1">
      <span class="text-base text-text-secondary">Try:</span>
      <button
        v-for="ip in showcaseIPs"
        :key="ip"
        type="button"
        :aria-label="`Search showcase IP ${ip}`"
        class="rounded-md border border-surface-border px-2 py-1 font-mono text-base text-text-secondary transition duration-150 ease-out hover:border-focus hover:text-text active:scale-[0.97]"
        @click="handleQuickPick(ip)"
      >
        {{ ip }}
      </button>
    </div>
  </form>
</template>
