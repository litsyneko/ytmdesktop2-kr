<template>
  <div class="flex flex-col gap-4">
    <div class="bg-opacity-5 bg-white shadow sm:rounded-lg mt-4">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-100">{{ translations.discord.title }}</h3>
        <div class="mt-2 max-w-xl text-sm text-gray-200">
          <p>{{ translations.discord.desc }}</p>
        </div>
        <div class="mt-3 text-sm">
          <a
            href="https://discord.com/rich-presence"
            target="_blank"
            class="font-medium text-indigo-400 hover:text-indigo-300"
          >
            {{ translations.discord.learnMore }}
            <span aria-hidden="true">&rarr;</span></a
          >
        </div>
      </div>
    </div>
    <div class="px-3 flex flex-col gap-4 mt-4">
      <settings-checkbox config-key="discord.enabled">{{ translations.discord.enable }}</settings-checkbox>
      <settings-checkbox config-key="discord.buttons">{{ translations.discord.showButtons }}</settings-checkbox>
    </div>
  </div>
</template>

<script lang="ts">
import SettingsCheckbox from "@renderer/components/SettingsCheckbox.vue";
import { defineComponent } from "vue";

export default defineComponent({
	components: { SettingsCheckbox },
});
</script>

<style></style>
