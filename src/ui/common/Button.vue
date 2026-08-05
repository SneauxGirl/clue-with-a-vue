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
  // Outline primary: Watch cyan border, white label.
  primary:
    'bg-surface text-text border border-focus hover:bg-focus/10 active:bg-focus/15',
  secondary:
    'bg-surface-raised text-text border border-surface-border hover:bg-surface-elevated active:bg-surface-elevated',
  danger: 'bg-risk-high text-surface hover:brightness-110 active:brightness-90',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :aria-disabled="disabled"
    :aria-label="ariaLabel"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-lg font-medium',
      'transition duration-150 ease-out active:scale-[0.97]',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
      VARIANT_CLASSES[variant],
    ]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
