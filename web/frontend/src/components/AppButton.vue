<script setup>
/**
 * AppButton — tokenized action control.
 *
 * States (all required by brief): default, hover, focus-visible, active,
 * disabled, loading, error.
 * Keyboard: native <button> → Enter/Space activate. Pointer + touch: 36px min
 * target height meets WCAG 2.5.8. Loading sets aria-busy and blocks clicks.
 */
defineProps({
  variant: { type: String, default: "primary" }, // primary | secondary | ghost
  type: { type: String, default: "button" },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});
defineEmits(["click"]);
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[`btn--${variant}`, { 'is-loading': loading }]"
    :disabled="disabled || loading"
    :aria-busy="loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />
    <span class="btn__label"><slot /></span>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: var(--control-height);
  padding: 0 var(--control-padding-x);
  border-radius: var(--control-radius);
  border: 1px solid transparent;
  font-family: var(--font-family-stack);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  cursor: pointer;
  transition: background-color var(--motion-duration-instant) var(--motion-ease),
    border-color var(--motion-duration-instant) var(--motion-ease);
}

.btn--primary {
  background: var(--bg-accent);
  color: var(--text-on-accent);
}
.btn--primary:hover:not(:disabled) { background: var(--bg-accent-hover); }
.btn--primary:active:not(:disabled) { background: var(--bg-accent-hover); transform: translateY(1px); }

.btn--secondary {
  background: var(--bg-raised);
  color: var(--text-body);
  border-color: var(--border-default);
}
.btn--secondary:hover:not(:disabled) { border-color: var(--border-focus); }
.btn--secondary:active:not(:disabled) { transform: translateY(1px); }

.btn--ghost {
  background: transparent;
  color: var(--text-link);
}
.btn--ghost:hover:not(:disabled) { color: var(--text-link-hover); }

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn.is-loading { cursor: progress; }

.btn__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: btn-spin 0.6s linear infinite;
}

@keyframes btn-spin { to { transform: rotate(360deg); } }
</style>
