<template>
  <div class="flex flex-col gap-4">
    <div v-if="getStartedEnabled" class="bg-opacity-5 bg-white shadow sm:rounded-lg mt-4">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-100">{{ translations.generic.getStartedTitle }}</h3>
        <div class="mt-2 max-w-xl text-sm text-gray-200">
          <p>{{ translations.generic.getStartedDesc }}</p>
        </div>
        <div class="mt-3 text-sm">
          <a
            href="https://youtube-music.app/"
            target="_blank"
            class="font-medium text-indigo-400 hover:text-indigo-300"
          >
            {{ translations.generic.learnMore }}
            <span aria-hidden="true">&rarr;</span></a
          >
        </div>
        <div class="mt-3 text-xs">
          <a
            href="#"
            class="font-medium text-red-400 hover:text-red-300"
            @click.prevent="disableGetStarted"
            >{{ translations.generic.dontShowAgain }}</a
          >
        </div>
      </div>
    </div>
    <div class="px-3 flex flex-col gap-4 mt-4">
      <!-- Language Selector -->
      <div class="flex flex-col gap-4 -mx-3 px-3 py-3 rounded-lg border border-white/5 bg-black/10">
        <settings-select config-key="app.language" class="bg-transparent border-0" :default-value="systemLang">
          <template #label>{{ translations.generic.language }}</template>
          <template #options>
            <option value="en">English (US)</option>
            <option value="ko">한국어 (Korean)</option>
            <option value="ja">日本語 (Japanese)</option>
            <option value="zh">简体中文 (Chinese)</option>
          </template>
        </settings-select>
      </div>

      <div
        :class="[
          'flex flex-col gap-y-1 border -mx-3 px-3',
          appAutostartEnabled
            ? 'border-gray-500 bg-gray-800 transition-all duration-150 ease-in-out pt-1.5 pb-2.5 rounded-lg'
            : 'border-gray-500/0 bg-gray-800/0 mt-1.5',
        ]"
      >
        <settings-checkbox config-key="app.autostart">{{ translations.generic.autostart }}</settings-checkbox>
        <template v-if="appAutostartEnabled">
          <settings-checkbox config-key="app.autostartMinimized">
            {{ translations.generic.autostartMinimized }}
          </settings-checkbox>
        </template>
      </div>
      <settings-checkbox config-key="app.autoupdate">{{ translations.generic.autoupdate }}</settings-checkbox>
      <settings-checkbox config-key="app.enableStatisticsAndErrorTracing">
        <div class="flex flex-col">
          <span>{{ translations.generic.sentryReporting }}</span>
          <span class="opacity-80 text-xs">{{ translations.generic.sentryReportingDesc }}</span>
        </div>
      </settings-checkbox>
      <settings-checkbox config-key="app.minimizeTrayOverride">
        {{ translations.generic.minimizeToTray }}
      </settings-checkbox>
      <settings-checkbox config-key="app.enableDev" class="group">
        <div class="flex flex-col">
          <div>{{ translations.generic.devMode }}</div>
          <div class="select-none opacity-80 group-hover:opacity-100 text-xs font-medium">
            {{ translations.generic.devModeDesc }}
          </div>
          <div
            class="select-none flex flex-col opacity-80 group-hover:opacity-100 text-xs font-medium"
          >
            <div class="flex space-x-1">
              <div class="uppercase font-bold text-red-500">{{ translations.generic.devWarningTitle }}</div>
              {{ translations.generic.devWarningDesc1 }}
            </div>
            <div>
              {{ translations.generic.devWarningDesc2 }}
            </div>
          </div>
        </div>
      </settings-checkbox>
      <settings-checkbox config-key="app.disableHardwareAccel" class="group">
        <div class="flex flex-col">
          <div>{{ translations.generic.hardwareAcceleration }}</div>
          <div class="select-none opacity-80 group-hover:opacity-100 text-xs font-medium">
            {{ translations.generic.hardwareAccelerationDesc }}
          </div>
        </div>
      </settings-checkbox>
      <div
        :class="[
          'flex flex-col gap-y-1 border -mx-3 px-3',
          apiEnabledSetting
            ? 'border-gray-500 pt-1.5 pb-2.5 rounded-lg'
            : 'border-gray-500/0 mt-1.5',
        ]"
      >
        <settings-checkbox config-key="api.enabled" class="group">
          <div class="flex flex-col">
            <div>{{ translations.generic.enableApi }}</div>
            <div class="select-none opacity-80 group-hover:opacity-100 text-xs font-medium">
              {{ translations.generic.enableApiDesc }}
            </div>
            <div
              class="select-none text-red-500 opacity-80 group-hover:opacity-100 uppercase text-xs font-medium"
            >
              {{ translations.generic.experimental }}
            </div>
          </div>
        </settings-checkbox>

        <template v-if="apiEnabledSetting">
          <settings-input
            config-key="api.port"
            type="number"
            :min="13000"
            :max="39999"
            placeholder="13000-39999"
          >
            <template #label>{{ translations.generic.apiPort }}</template>
          </settings-input>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SettingsCheckbox from "@renderer/components/SettingsCheckbox.vue";
import SettingsInput from "@renderer/components/SettingsInput.vue";
import SettingsSelect from "@renderer/components/SettingsSelect.vue";
import { refIpcSetting } from "@shared/utils/Ipc";
import { onMounted, watch } from "vue";

const [getStartedEnabled] = refIpcSetting("app.getstarted");
const [apiEnabledSetting] = refIpcSetting("api.enabled");
const [appAutostartEnabled] = refIpcSetting("app.autostart");
const [appLanguage] = refIpcSetting<string>("app.language");

const systemLang = navigator.language.startsWith("ko") ? "ko" : navigator.language.startsWith("ja") ? "ja" : navigator.language.startsWith("zh") ? "zh" : "en";

onMounted(() => {
	if (appLanguage.value) {
		localStorage.setItem("app.language", appLanguage.value);
	}
});

watch(appLanguage, (newLang, oldLang) => {
	if (oldLang !== undefined && newLang && newLang !== oldLang) {
		localStorage.setItem("app.language", newLang);
		window.location.reload();
	}
});

const disableGetStarted = () => {
	window.api.settingsProvider.update("app.getstarted", false).then((v) => {
		getStartedEnabled.value = v;
	});
};
</script>

<style></style>
