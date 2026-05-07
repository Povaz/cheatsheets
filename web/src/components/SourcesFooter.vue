<script setup>
const props = defineProps({
  sources: { type: Array, default: () => [] },
})

function pad(n) {
  return String(n).padStart(2, '0')
}
</script>

<template>
  <section v-if="sources.length" class="sources-footer" aria-label="Sources">
    <hr class="chapter-divider" />
    <div class="chapter-body">
      <div class="chapter-rail sources-rail" aria-hidden="true">
        <span class="chapter-rail-title">Sources</span>
      </div>
      <ol class="sources-list">
        <li
          v-for="(src, i) in sources"
          :key="src.href"
          class="sources-row"
        >
          <a
            class="sources-link"
            :href="src.href"
            :target="src.kind === 'remote' ? '_blank' : null"
            :rel="src.kind === 'remote' ? 'noopener noreferrer' : null"
            :download="src.kind === 'local' ? src.filename : null"
            :title="src.kind === 'local' ? `Download ${src.filename}` : src.href"
          >
            <span class="sources-index">{{ pad(i + 1) }}</span>
            <span class="sources-type label-soft">{{ src.type || 'src' }}</span>
            <span class="sources-title">{{ src.title }}</span>
            <span v-if="src.read_as" class="sources-readas">{{ src.read_as }}</span>
            <span v-if="src.fetched" class="sources-date">{{ src.fetched }}</span>
            <span class="sources-affordance" :aria-label="src.kind === 'local' ? 'download' : 'open in new tab'">
              {{ src.kind === 'local' ? '⬇' : '↗' }}
            </span>
          </a>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.sources-rail {
  color: #6b6b6b;
  cursor: default;
}

.sources-list {
  flex: 1 1 0;
  min-width: 0;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.sources-row + .sources-row {
  border-top: 1px solid #e4e0d9;
}

.sources-link {
  display: grid;
  grid-template-columns: 1.75rem auto 1fr auto 1rem;
  align-items: baseline;
  column-gap: 0.6rem;
  padding: 0.35rem 0.5rem 0.35rem 0;
  color: #1a1a1a;
  text-decoration: none;
  border-left: 2px solid transparent;
  transition: background-color 120ms, border-color 120ms, color 120ms;
}

.sources-link:hover,
.sources-link:focus-visible {
  background-color: rgba(228, 224, 217, 0.35);
  border-left-color: #c1440e;
}

.sources-link:hover .sources-title,
.sources-link:focus-visible .sources-title {
  text-decoration: underline;
  text-decoration-color: #c1440e;
  text-underline-offset: 3px;
}

.sources-link:hover .sources-affordance,
.sources-link:focus-visible .sources-affordance {
  color: #c1440e;
}

.sources-index {
  font-size: 10px;
  color: #6b6b6b;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.sources-type {
  display: inline-block;
  min-width: 2.5rem;
  text-align: center;
  padding: 0 0.35rem;
  border: 1px solid #e4e0d9;
  border-radius: 2px;
  background: #faf8f5;
  line-height: 1.5;
}

.sources-title {
  font-size: 12px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sources-readas {
  display: none;
  font-size: 10px;
  color: #6b6b6b;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (min-width: 1100px) {
  .sources-link {
    grid-template-columns: 1.75rem auto minmax(0, 1.2fr) minmax(0, 1.5fr) auto 1rem;
  }
  .sources-readas {
    display: inline;
  }
}

.sources-date {
  font-size: 10px;
  color: #6b6b6b;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.sources-affordance {
  font-size: 11px;
  color: #6b6b6b;
  text-align: center;
  transition: color 120ms;
}
</style>
