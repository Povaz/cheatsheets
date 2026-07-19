<script setup>
import { topics, recallData } from '../lib/content.js'
</script>

<template>
  <div class="space-y-8">
    <section>
      <h1 class="font-serif text-4xl md:text-5xl font-extrabold leading-none">cheatsheets</h1>
      <p class="text-muted text-sm mt-3 max-w-xl">
        Single-page reference sheets for IT and CS topics. Press
        <kbd class="kbd">/</kbd> to search within a sheet.
      </p>
    </section>

    <section class="space-y-3">
      <ul class="grid gap-3 cards2:grid-cols-2 cards3:grid-cols-3">
        <li
          v-for="t in topics"
          :key="t.slug"
          class="relative bg-surface border border-hairline rounded-sm shadow-card p-4 flex flex-col gap-2 hover:border-accent transition-colors"
        >
          <div class="flex items-baseline justify-between gap-2">
            <RouterLink
              :to="`/${t.slug}`"
              class="font-serif text-2xl font-extrabold text-ink hover:text-accent min-w-0 after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-accent"
            >{{ t.title }}</RouterLink>
            <span v-if="t.subtopics.length > 1" class="label-soft whitespace-nowrap flex-shrink-0">{{ t.subtopics.length }} sheets</span>
          </div>
          <p v-if="t.subtitle" class="text-xs text-muted">{{ t.subtitle }}</p>
          <div v-if="t.subtopics.length" class="flex flex-wrap gap-1 pt-1">
            <RouterLink
              v-for="s in t.subtopics"
              :key="s.name"
              :to="`/${s.slug}`"
              class="pill relative z-10 hover:border-accent hover:text-accent hover:bg-accent/5 transition-colors"
            >{{ s.name }}</RouterLink>
          </div>
        </li>

        <li
          v-if="recallData"
          class="relative bg-surface border border-accent/30 rounded-sm shadow-card p-4 flex flex-col gap-2 hover:border-accent transition-colors"
        >
          <div class="flex items-baseline justify-between gap-2">
            <RouterLink
              to="/recall"
              class="font-serif text-2xl font-extrabold text-accent hover:opacity-70 min-w-0 after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-accent"
            >Daily Recall</RouterLink>
            <span class="label-soft whitespace-nowrap flex-shrink-0">{{ recallData.questions.length }} questions</span>
          </div>
          <p class="text-xs text-muted">Test your recall across all topics</p>
        </li>
      </ul>
    </section>
  </div>
</template>
