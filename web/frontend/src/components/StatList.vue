<script setup>
/**
 * StatList — key/value list for chain & token summary stats.
 * States: default, loading, empty. Uses a description list for semantics.
 * Long values truncate with full value exposed via title.
 */
defineProps({
  items: { type: Array, default: () => [] }, // [{ label, value }]
  loading: { type: Boolean, default: false },
});
</script>

<template>
  <dl class="stats">
    <template v-if="loading">
      <div v-for="n in 4" :key="`sk-${n}`" class="stats__row">
        <dt><span class="skeleton skeleton--sm" /></dt>
        <dd><span class="skeleton" /></dd>
      </div>
    </template>
    <p v-else-if="!items.length" class="stats__empty">No stats available.</p>
    <div v-else v-for="item in items" :key="item.label" class="stats__row">
      <dt class="stats__label">{{ item.label }}</dt>
      <dd class="stats__value" :title="String(item.value)">{{ item.value }}</dd>
    </div>
  </dl>
</template>

<style scoped>
.stats {
  margin: 0;
  display: grid;
  gap: var(--space-3);
}
.stats__row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-6);
  padding: var(--space-4) var(--space-6);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
}
.stats__label { color: var(--text-muted); font-size: var(--font-size-sm); }
.stats__value {
  margin: 0;
  color: var(--text-heading);
  font-size: var(--font-size-sm);
  font-variant-numeric: tabular-nums;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 60%;
}
.stats__empty { color: var(--text-muted); }

.skeleton {
  display: block;
  width: 120px;
  height: 14px;
  border-radius: var(--radius-xs);
  background: linear-gradient(90deg, var(--bg-raised), var(--border-default), var(--bg-raised));
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}
.skeleton--sm { width: 80px; }
@keyframes shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}
</style>
