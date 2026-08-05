<script setup lang="ts"></script>

<template>
  <div class="min-h-screen bg-surface">
    <header class="border-b border-surface-border">
      <div class="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <h1 class="font-display text-[1.25rem] leading-tight tracking-wide text-text sm:text-[1.5rem] lg:text-[2rem]">
          Clue-With-A-Vue
        </h1>
        <p class="text-base text-text-secondary">IP fraud explorer</p>
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <slot />
    </main>
  </div>
</template>
