<template>
  <div class="landing">
    <div class="landing-brand">
      <span class="landing-wordmark">cheatsheet</span>
      <span class="landing-os">OS</span>
    </div>
    <p class="landing-copy">Select a sheet from the sidebar to begin.</p>
    <div class="landing-hints">
      <span><kbd class="kbd">/</kbd> search within a sheet</span>
      <span><kbd class="kbd">⌘[</kbd> <kbd class="kbd">⌘]</kbd> step between sheets</span>
    </div>
  </div>
</template>

<style scoped>
.landing {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.landing-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
}
.landing-wordmark {
  font-family: Fraunces, ui-serif, serif;
  font-size: 44px;
  font-weight: 800;
  line-height: 1;
  color: rgb(var(--c-ink));
}
.landing-os {
  display: inline-flex;
  align-items: center;
  padding: 3px 7px;
  border-radius: 3px;
  background: rgb(var(--c-accent));
  color: rgb(var(--c-paper));
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
.landing-copy {
  font-size: 12px;
  color: rgb(var(--c-muted));
}
.landing-hints {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 11px;
  color: rgb(var(--c-muted));
}
</style>
