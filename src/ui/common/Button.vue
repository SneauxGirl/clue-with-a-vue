<script setup lang="ts">
export type ButtonVariant = 'primary' | 'secondary' | 'danger'

withDefaults(
  defineProps<{
    variant?: ButtonVariant
    type?: 'button' | 'submit'
    disabled?: boolean
    ariaLabel?: string
  }>(),
  {
    variant: 'primary',
    type: 'button',
    disabled: false,
    ariaLabel: undefined,
  },
)

defineEmits<{ click: [MouseEvent] }>()

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-risk-low text-white hover:bg-blue-700 active:bg-blue-800',
  secondary:
    'bg-surface-raised text-slate-200 border border-surface-border hover:bg-slate-800 active:bg-slate-700',
  danger: 'bg-risk-high text-white hover:bg-red-700 active:bg-red-800',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :aria-disabled="disabled"
    :aria-label="ariaLabel"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium',
      'transition duration-150 ease-out active:scale-[0.97]',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
      VARIANT_CLASSES[variant],
    ]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
