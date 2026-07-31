<script setup lang="ts">
import Button from './Button.vue'

withDefaults(
  defineProps<{
    message: string
    retryable?: boolean
  }>(),
  { retryable: false },
)

defineEmits<{ retry: [] }>()
</script>

<template>
  <div role="alert" class="flex flex-col items-start gap-3 rounded-lg border border-risk-high/40 bg-risk-high/10 p-4 sm:flex-row sm:items-center sm:justify-between">
    <p class="text-sm text-red-200">{{ message }}</p>
    <Button v-if="retryable" variant="danger" aria-label="Retry the failed request" @click="$emit('retry')">
      Retry
    </Button>
  </div>
</template>
