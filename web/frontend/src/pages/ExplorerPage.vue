<script setup>
import { onMounted, computed } from "vue";
import AppButton from "../components/AppButton.vue";
import AppInput from "../components/AppInput.vue";
import StatList from "../components/StatList.vue";
import DataTable from "../components/DataTable.vue";
import { useResource } from "../composables/useSolscan.js";
import { ref } from "vue";

const chain = useResource("chain-info");

// Token lookup
const tokenAddress = ref("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const tokenError = ref("");
const token = useResource("token-meta");

const chainStats = computed(() => {
  const d = chain.data.value?.data;
  if (!d) return [];
  return [
    { label: "Absolute slot", value: d.absoluteSlot?.toLocaleString() ?? "—" },
    { label: "Block height", value: d.blockHeight?.toLocaleString() ?? "—" },
    { label: "Current epoch", value: d.currentEpoch ?? "—" },
    { label: "Total transactions", value: d.transactionCount?.toLocaleString() ?? "—" },
  ];
});

const tokenColumns = [
  { key: "field", label: "Field" },
  { key: "value", label: "Value", mono: true },
];

const tokenRows = computed(() => {
  const d = token.data.value?.data;
  if (!d) return [];
  return [
    { field: "Name", value: d.name },
    { field: "Symbol", value: d.symbol },
    { field: "Price (USD)", value: d.price },
    { field: "Holders", value: d.holder?.toLocaleString?.() ?? d.holder },
    { field: "Market cap", value: d.market_cap },
  ];
});

function lookupToken() {
  tokenError.value = "";
  const v = tokenAddress.value.trim();
  // Solana addresses are base58, 32–44 chars. Validate before hitting the API.
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(v)) {
    tokenError.value = "Enter a valid Solana token address (base58, 32–44 chars).";
    return;
  }
  token.load({ token_address: v });
}

onMounted(() => chain.load());
</script>

<template>
  <main class="page">
    <header class="page__head">
      <h1>Solana Blockchain Explorer</h1>
      <p class="page__sub">Live chain stats and token lookup via the Solscan API.</p>
    </header>

    <section class="panel" aria-labelledby="chain-h">
      <div class="panel__head">
        <h2 id="chain-h">Network status</h2>
        <AppButton variant="secondary" :loading="chain.loading.value" @click="chain.load()">
          Refresh
        </AppButton>
      </div>
      <p v-if="chain.error.value" class="panel__error" role="alert">{{ chain.error.value }}</p>
      <StatList :items="chainStats" :loading="chain.loading.value" />
    </section>

    <section class="panel" aria-labelledby="token-h">
      <h2 id="token-h">Token lookup</h2>
      <form class="lookup" @submit.prevent="lookupToken">
        <AppInput
          id="token-address"
          v-model="tokenAddress"
          label="Token mint address"
          placeholder="e.g. EPjFWdd5Aufq…TDt1v"
          :error="tokenError"
          @submit="lookupToken"
        />
        <AppButton type="submit" :loading="token.loading.value">Search</AppButton>
      </form>
      <DataTable
        caption="Token metadata"
        :columns="tokenColumns"
        :rows="tokenRows"
        :loading="token.loading.value"
        :error="token.error.value"
        empty-label="Search a token mint address to see its metadata."
      />
    </section>
  </main>
</template>

<style scoped>
.page {
  max-width: 880px;
  margin: 0 auto;
  padding: var(--space-7) var(--space-6);
  display: grid;
  gap: var(--space-7);
}
.page__head { display: grid; gap: var(--space-3); }
.page__sub { margin: 0; color: var(--text-muted); font-size: var(--font-size-md); }

.panel { display: grid; gap: var(--space-6); }
.panel__head { display: flex; align-items: center; justify-content: space-between; gap: var(--space-6); }
.panel__error { margin: 0; color: var(--text-error); font-size: var(--font-size-sm); }

.lookup {
  display: flex;
  align-items: flex-end;
  gap: var(--space-5);
}
.lookup > :first-child { flex: 1; }

@media (max-width: 560px) {
  .lookup { flex-direction: column; align-items: stretch; }
}
</style>
