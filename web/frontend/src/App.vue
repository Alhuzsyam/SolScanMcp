<script setup>
import ExplorerPage from "./pages/ExplorerPage.vue";
</script>

<template>
  <a class="skip" href="#main">Skip to content</a>
  <div id="main">
    <ExplorerPage />
  </div>
</template>

<style scoped>
/* Skip link: hidden until focused, a WCAG 2.4.1 bypass-blocks requirement. */
.skip {
  position: absolute;
  left: var(--space-6);
  top: -48px;
  background: var(--bg-accent);
  color: var(--text-on-accent);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-sm);
  transition: top var(--motion-duration-instant) var(--motion-ease);
  z-index: 10;
}
.skip:focus-visible { top: var(--space-6); }
</style>
