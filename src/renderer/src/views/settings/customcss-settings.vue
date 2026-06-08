<template>
  <div class="flex flex-col gap-4 mt-4">
    <div class="px-3 flex flex-col gap-4">
      <settings-checkbox ref="customCssToggle"
                          config-key="customcss.enabled">{{ translations.customCss.enable }}</settings-checkbox>
      <settings-checkbox config-key="customcss.watching">{{ translations.customCss.watching }}</settings-checkbox>
      <settings-checkbox config-key="customcss.thumbnailBackground">{{ translations.customCss.thumbnailBackground }}</settings-checkbox>
      <ease-transition>
        <div v-if="customCssToggle && customCssToggle.value"
              class="flex flex-col gap-4">
          <settings-input ref="customCssPathInput"
                           config-key="customcss.scssFile"
                           type="file"
                           accept=".scss,.sass">
            <template #label>{{ translations.customCss.scssFile }}</template>
            <template #hint>
              <div class="flex justify-end gap-2 mt-2"
                   v-if="customCssPathInput">
                <div class="btn-group">
                  <button class="btn btn-sm"
                          @click="reloadCSS">{{ translations.customCss.reload }}</button>
                  <button class="btn btn-sm"
                          @click="openCSSFile">{{ translations.customCss.openCssFile }}</button>
                </div>
              </div>
            </template>
          </settings-input>
        </div>
      </ease-transition>
    </div>
  </div>
</template>
<script lang="ts" setup>
import EaseTransition from "@renderer/components/EaseTransition.vue";
import SettingsCheckbox from "@renderer/components/SettingsCheckbox.vue";
import SettingsInput from "@renderer/components/SettingsInput.vue";
import { ref } from "vue";

const customCssToggle = ref(null),
	customCssPathInput = ref(null);
function reloadCSS() {
	window.api.reloadCustomCss();
}
function openCSSFile() {
	const path = customCssPathInput.value?.value;
	console.log({ path });
	if (path) {
		window.api.openFile(path);
	}
}
</script>
<style></style>
