<script setup>
import { topics } from '../lib/content.js'
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
      <h2 class="section-label">cheatsheets</h2>
      <ul class="grid gap-3 cards2:grid-cols-2 cards3:grid-cols-3">
        <li
          v-for="t in topics"
          :key="t.slug"
          class="bg-white border border-hairline rounded-sm shadow-card p-4 flex flex-col gap-2"
        >
          <div class="flex items-baseline justify-between gap-2">
            <RouterLink
              :to="`/${t.slug}`"
              class="font-serif text-2xl font-extrabold text-ink hover:text-accent"
            >{{ t.title }}</RouterLink>
            <span class="section-label whitespace-nowrap">
              {{ t.subtopics.length === 1 ? '1 sheet' : `${t.subtopics.length} sheets` }}
            </span>
          </div>
          <p v-if="t.subtitle" class="text-xs text-muted">{{ t.subtitle }}</p>
          <div v-if="t.subtopics.length > 1" class="flex flex-wrap gap-1 pt-1">
            <RouterLink
              v-for="s in t.subtopics"
              :key="s.name"
              :to="`/${s.slug}`"
              class="pill hover:border-accent/60 hover:text-accent transition-colors"
            >{{ s.name }}</RouterLink>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>
