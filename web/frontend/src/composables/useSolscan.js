import { ref } from "vue";

/**
 * Thin client for the Express proxy (/api/*). The proxy holds the Solscan key,
 * so the browser never sees it. Each call exposes loading/error/data refs so
 * components can render every required state.
 */
export function useResource(resource) {
  const data = ref(null);
  const loading = ref(false);
  const error = ref("");

  async function load(params = {}) {
    loading.value = true;
    error.value = "";
    try {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
      ).toString();
      const res = await fetch(`/api/${resource}${qs ? `?${qs}` : ""}`);
      const body = await res.json();
      if (!res.ok) {
        // Surface Solscan's real message (e.g. "upgrade your api key level").
        error.value = body?.errors?.message || body?.error || `Request failed (${res.status})`;
        data.value = null;
      } else {
        data.value = body;
      }
    } catch (e) {
      error.value = "Network error — is the proxy running on :8787?";
      data.value = null;
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, error, load };
}
