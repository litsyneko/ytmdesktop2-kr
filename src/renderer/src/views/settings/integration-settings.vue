<template>
  <div>
    <SectionCard
      :loading="loading || lastFM.processing"
      class="cursor-pointer"
      @click="toggleLastFM"
    >
      <div class="grid grid-cols-[1fr_100px]">
        <div class="flex flex-col">
          <h1 class="font-semibold">{{ translations.integrations.lastfmTitle }}</h1>
          <p class="text-sm text-gray-300">{{ translations.integrations.lastfmDesc }}</p>
        </div>
        <div class="flex items-center justify-center">
          <input
            type="checkbox"
            class="toggle toggle-primary pointer-events-none"
            :checked="lastFM.connected"
          />
        </div>
      </div>
    </SectionCard>
  </div>
</template>

<script lang="ts" setup>
import SectionCard from "@renderer/components/SectionCard.vue";
import { refIpc } from "@shared/utils/Ipc";
import { onMounted, ref } from "vue";

const loading = ref(false);
const [lastFM, setLastFM] = refIpc("LAST_FM_STATUS", {
	ignoreUndefined: true,
	defaultValue: { connected: false, name: null, error: null, processing: false },
});
onMounted(() => {
	window.api.action("lastfm.status").then((status) => {
		setLastFM(status);
	});
});
function toggleLastFM() {
	if (loading.value || lastFM.value.processing) return;
	loading.value = true;
	window.api
		.action("lastfm.toggle", !lastFM.value.connected)
		.then((status) => {
			setLastFM(status);
		})
		.finally(() => {
			loading.value = false;
		});
}
</script>

<style></style>
