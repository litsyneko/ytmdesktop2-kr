<template>
  <div class="h-full absolute inset-0 overflow-hidden flex flex-row bg-black p-2 select-none">
    <!-- Transparent Control Bar for dragging and close/min buttons -->
    <control-bar title="" class="control-bar-spotify">
      <template #icon>
        <span class="w-0 h-0 hidden"></span>
      </template>
    </control-bar>

    <!-- Sidebar Navigation Card -->
    <div class="spotify-sidebar flex-shrink-0 flex flex-col justify-between pt-12">
      <div class="sidebar-scroll overflow-y-auto px-4 py-4 flex-auto">
        <div class="flex items-center space-x-2.5 px-3 pb-6">
          <LogoIcon class="pointer-events-none w-6 h-6 text-[#1ed760]" />
          <span class="font-bold text-base tracking-tight text-white">{{ translations.settings }}</span>
        </div>

        <div class="sidebar-menu-group">
          <div class="menu-group-title">{{ translations.appName }}</div>
          
          <router-link to="/" class="menu-item" exact-active-class="active">
            <span class="active-indicator"></span>
            <span class="menu-item-text">{{ translations.tabs.generic }}</span>
          </router-link>
          
          <router-link to="/player" class="menu-item" active-class="active">
            <span class="active-indicator"></span>
            <span class="menu-item-text">{{ translations.tabs.player }}</span>
          </router-link>
          
          <router-link to="/discord" class="menu-item" active-class="active">
            <span class="active-indicator"></span>
            <span class="menu-item-text">{{ translations.tabs.discord }}</span>
          </router-link>
          
          <router-link to="/custom-css" class="menu-item" active-class="active">
            <span class="active-indicator"></span>
            <span class="menu-item-text">{{ translations.tabs.customCss }}</span>
          </router-link>
          
          <router-link to="/integrations" class="menu-item" active-class="active">
            <span class="active-indicator"></span>
            <span class="menu-item-text">{{ translations.tabs.integrations }}</span>
          </router-link>
          
          <router-link to="/about" class="menu-item" active-class="active">
            <span class="active-indicator"></span>
            <span class="menu-item-text">{{ translations.tabs.about }}</span>
          </router-link>
        </div>
      </div>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer p-4 bg-black/20 rounded-b-lg border-t border-white/5">
        <div class="flex flex-col text-[11px] text-[#a7a7a7] space-y-1">
          <span class="font-medium opacity-80">v{{ appVersion }}@{{ appEnv }}</span>
          <div class="flex space-x-3 pt-0.5">
            <a href="https://github.com/Venipa/ytmdesktop2" target="_blank" class="hover:text-white transition-colors duration-150">{{ translations.links.github }}</a>
            <a href="https://youtube-music.app" target="_blank" class="hover:text-white transition-colors duration-150">{{ translations.links.website }}</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Pane Card -->
    <div class="spotify-content flex-auto relative flex flex-col pt-12 ml-2">
      <!-- Spotify Exit Button (Circular Close Button) -->
      <div class="spotify-close-btn" @click="onClose" :title="translations.settings + ' 닫기'">
        <CloseIcon class="w-4 h-4" />
      </div>

      <div class="overflow-y-auto overflow-x-hidden flex-auto px-10 py-6 scroll-container">
        <div class="max-w-[680px] w-full mx-auto pb-12">
          <router-view v-slot="{ Component }">
            <transition name="spotify-fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import CloseIcon from "@renderer/assets/icons/close.svg";
import LogoIcon from "@renderer/assets/logo.svg";
import ControlBar from "@renderer/components/ControlBar.vue";
import { onMounted } from "vue";

onMounted(() => {
	document.title = `YouTube Music - Settings`;
});

const appVersion = window.api.version;
const appOS = window.process.platform;
const appEnv = window.process.environment;

const onClose = () => {
	window.api.closeWindow();
};
</script>

<style lang="scss">
.control-bar-spotify {
  background: transparent !important;
  border-bottom: none !important;
  position: absolute !important;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  
  p {
    display: none !important;
  }

  // Hide the native window controls on the right (minimize, maximize, close buttons)
  .flex.items-center.space-x-1,
  .control-button,
  .w-px {
    display: none !important;
  }
}

.spotify-sidebar {
  width: 230px;
  background-color: #121212;
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  .sidebar-scroll {
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }

  .sidebar-menu-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .menu-group-title {
    font-size: 11px;
    font-weight: 700;
    color: #a7a7a7;
    text-transform: uppercase;
    padding: 6px 12px;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
    opacity: 0.8;
  }

  .menu-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 4px;
    color: #a7a7a7;
    font-size: 14px;
    font-weight: 700;
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;

    .active-indicator {
      position: absolute;
      left: 0;
      width: 4px;
      height: 16px;
      background-color: #1ed760;
      border-radius: 0 4px 4px 0;
      transform: scaleY(0);
      transition: transform 0.2s ease;
    }

    &:hover {
      color: #ffffff;
    }

    &.active {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.05);

      .active-indicator {
        transform: scaleY(1);
      }
    }
  }
}

.spotify-content {
  background-color: #121212;
  border-radius: 8px;
  height: 100%;
  color: #ffffff;
  
  .scroll-container {
    &::-webkit-scrollbar {
      width: 8px;
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 4px;
      border: none !important;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.25);
    }
  }
}

/* Spotify Close Button styling */
.spotify-close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: #a7a7a7;
  z-index: 60; /* Overlay above transparent drag bar */
  -webkit-app-region: no-drag; /* Allows click events to propagate through Electron drag region */
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: #ffffff;
    background-color: rgba(0, 0, 0, 0.8);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

/* Spotify Fade transition for pages */
.spotify-fade-enter-active,
.spotify-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.spotify-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.spotify-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
