<script setup>
/**
 * DataTable — tokenized data grid for token/transaction rows.
 *
 * States: default, loading (skeleton rows), empty, error.
 * Long content: cells truncate with ellipsis + title attribute (full value on
 * hover/focus). Horizontal overflow scrolls within the card, never the page.
 * A11y: real <table> semantics with scope="col" headers + a <caption>.
 */
defineProps({
  caption: { type: String, required: true },
  columns: { type: Array, required: true }, // [{ key, label, mono }]
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
  emptyLabel: { type: String, default: "No data to display." },
});
</script>

<template>
  <div class="table-wrap" role="region" :aria-label="caption" tabindex="0">
    <table class="table">
      <caption class="sr-only">{{ caption }}</caption>
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key" scope="col">{{ col.label }}</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="loading">
          <tr v-for="n in 5" :key="`sk-${n}`" class="row--skeleton">
            <td v-for="col in columns" :key="col.key"><span class="skeleton" /></td>
          </tr>
        </template>

        <tr v-else-if="error">
          <td :colspan="columns.length" class="state state--error">{{ error }}</td>
        </tr>

        <tr v-else-if="!rows.length">
          <td :colspan="columns.length" class="state state--empty">{{ emptyLabel }}</td>
        </tr>

        <tr v-else v-for="(row, i) in rows" :key="i">
          <td
            v-for="col in columns"
            :key="col.key"
            :class="{ mono: col.mono }"
            :title="String(row[col.key] ?? '')"
          >
            {{ row[col.key] ?? "—" }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

th, td {
  text-align: left;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

th {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: var(--bg-raised); }

.mono { font-variant-numeric: tabular-nums; }

.state { text-align: center; color: var(--text-muted); padding: var(--space-7) var(--space-6); white-space: normal; }
.state--error { color: var(--text-error); }

.skeleton {
  display: block;
  height: 14px;
  border-radius: var(--radius-xs);
  background: linear-gradient(90deg, var(--bg-raised), var(--border-default), var(--bg-raised));
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}
</style>
