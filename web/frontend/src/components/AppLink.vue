<script setup>
/**
 * AppLink — descriptive navigation/action link (the densest element on Solscan
 * pages). Labels MUST be descriptive; never "click here".
 * External links get rel="noopener noreferrer" and an aria-label suffix.
 */
defineProps({
  href: { type: String, required: true },
  external: { type: Boolean, default: false },
  ariaLabel: { type: String, default: "" },
});
</script>

<template>
  <a
    class="link"
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    :aria-label="ariaLabel || undefined"
  >
    <slot />
    <span v-if="external" class="sr-only"> (opens in new tab)</span>
  </a>
</template>

<style scoped>
.link {
  color: var(--text-link);
  text-decoration: none;
  border-radius: var(--radius-xs);
  transition: color var(--motion-duration-instant) var(--motion-ease);
}
.link:hover { color: var(--text-link-hover); text-decoration: underline; }
.link:active { color: var(--text-link-hover); }
</style>
