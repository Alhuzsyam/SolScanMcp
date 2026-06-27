<script setup>
/**
 * AppInput — labeled text field (the explorer's primary search input).
 *
 * States: default, hover, focus-visible, disabled, error.
 * A11y: <label> bound via id; error announced with role="alert" + aria-invalid +
 * aria-describedby so screen readers read the message on failure.
 */
import { computed } from "vue";

const props = defineProps({
  modelValue: { type: String, default: "" },
  id: { type: String, required: true },
  label: { type: String, required: true },
  placeholder: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  error: { type: String, default: "" },
});
defineEmits(["update:modelValue", "submit"]);

const describedBy = computed(() => (props.error ? `${props.id}-error` : undefined));
</script>

<template>
  <div class="field">
    <label :for="id" class="field__label">{{ label }}</label>
    <input
      :id="id"
      class="field__input"
      :class="{ 'has-error': error }"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="Boolean(error)"
      :aria-describedby="describedBy"
      type="text"
      autocomplete="off"
      spellcheck="false"
      @input="$emit('update:modelValue', $event.target.value)"
      @keydown.enter="$emit('submit')"
    />
    <p v-if="error" :id="`${id}-error`" class="field__error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field__label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.field__input {
  height: var(--control-height);
  padding: 0 var(--control-padding-x);
  background: var(--bg-card);
  color: var(--text-body);
  border: 1px solid var(--border-default);
  border-radius: var(--control-radius);
  font-family: var(--font-family-stack);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-base);
  transition: border-color var(--motion-duration-instant) var(--motion-ease);
}

.field__input::placeholder { color: var(--text-muted); }
.field__input:hover:not(:disabled) { border-color: var(--text-muted); }
.field__input:focus-visible { border-color: var(--border-focus); }

.field__input:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.field__input.has-error { border-color: var(--text-error); }

.field__error {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--text-error);
}
</style>
