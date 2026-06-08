<template>
  <div class="h-full absolute inset-0 overflow-hidden flex flex-col select-none rounded-xl group transition-all duration-500 bg-[#121212]"
       :style="accentStyle">
    <!-- Slim progress line at the very bottom (only in slim mode) -->
    <div v-if="layoutMode === 'slim' && time" class="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-50">
      <div class="h-full bg-[#1ed760] transition-all duration-150 animate-pulse-subtle" :style="{ width: `${time ? time[2] : 0}%` }"></div>
    </div>

    <!-- Custom Spotify Header Bar (Always visible but semi-transparent, draggable background) -->
    <div class="spotify-header absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-3 z-40 select-none drag bg-gradient-to-b from-black/30 to-transparent">
      <!-- Left: Back to Main App -->
      <button class="no-drag header-icon-btn flex items-center justify-center w-7 h-7 rounded-full text-white/50 hover:text-white"
              title="메인 창으로 복귀"
              @click="closeMiniPlayer">
        <BackToAppIcon class="w-3.5 h-3.5" />
      </button>

      <!-- Right Controls -->
      <div class="flex items-center space-x-1 no-drag">
        <!-- Layout Switcher Button -->
        <button class="header-icon-btn flex items-center justify-center w-7 h-7 rounded-full text-white/50 hover:text-white"
                title="레이아웃 전환"
                @click="cycleLayoutMode">
          <LayoutIcon class="w-3.5 h-3.5" />
        </button>
        <!-- Always on Top Pin -->
        <button class="header-icon-btn flex items-center justify-center w-7 h-7 rounded-full"
                :title="isTop ? '항상 위에 표시 해제' : '항상 위에 표시'"
                @click="toggleStayTop">
          <PinIcon class="w-3.5 h-3.5" :class="isTop ? 'text-[#1ed760] fill-[#1ed760]' : 'text-white/50 hover:text-white'" />
        </button>
        <!-- Close Window Button -->
        <button class="header-icon-btn flex items-center justify-center w-7 h-7 rounded-full text-white/50 hover:text-red-500"
                title="닫기"
                @click="closeMiniPlayer">
          <CloseIcon class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Layout Wrapper -->
    <div class="player-layout flex-auto flex p-6 items-center justify-center relative z-10" :class="layoutMode">
      
      <!-- MODE 1: SLIM LAYOUT -->
      <template v-if="layoutMode === 'slim'">
        <div class="slim-container flex items-center justify-between w-full h-full pt-4">
          <!-- Left: Thumbnail & Metadata -->
          <div class="flex items-center min-w-0 flex-1 mr-4">
            <div class="art-card flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border border-white/5 shadow-lg relative mr-3">
              <template v-if="trackBusy">
                <div class="absolute inset-0 flex items-center justify-center z-20 bg-black/60 backdrop-blur-sm">
                  <Spinner size="sm" />
                </div>
              </template>
              <img v-if="thumbnail" :src="thumbnail" alt="album art" class="w-full h-full object-cover pointer-events-none" loading="lazy" @load="handleAccent" />
              <div v-else class="w-full h-full bg-zinc-900 flex items-center justify-center">
                <MiniPlayerIcon class="w-4 h-4 text-zinc-600" />
              </div>
            </div>
            
            <div class="min-w-0 flex-1 text-left">
              <h2 v-if="track?.video" class="text-white text-xs font-bold truncate leading-tight hover:underline cursor-pointer">{{ track.video.title }}</h2>
              <h2 v-else class="text-zinc-500 text-xs font-bold truncate">재생 중인 곡 없음</h2>
              <p v-if="track?.video" class="text-zinc-400 text-[10px] font-medium mt-0.5 truncate">{{ track.video.author }}</p>
              <p v-else class="text-zinc-600 text-[10px] mt-0.5">-</p>
            </div>

            <!-- Like/Dislike Thumbs -->
            <div class="flex items-center space-x-2 ml-3 flex-shrink-0">
              <button v-if="playState?.liked !== undefined"
                      type="button"
                      class="thumb-btn text-zinc-400 hover:text-white"
                      :class="{ 'active': !!playState?.liked }"
                      :disabled="trackBusy"
                      title="좋아요"
                      @click="likeToggle">
                <ThumbsUpIcon class="w-3.5 h-3.5 fill-current" />
              </button>
              <button v-if="playState?.disliked !== undefined"
                      type="button"
                      class="thumb-btn text-zinc-400 hover:text-white"
                      :class="{ 'active': !!playState?.disliked }"
                      :disabled="trackBusy"
                      title="싫어요"
                      @click="dislikeToggle">
                <ThumbsDownIcon class="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>

          <!-- Right: Controls -->
          <div class="flex items-center space-x-2.5 flex-shrink-0">
            <!-- Prev Button -->
            <button type="button" class="control-btn-spotify" :disabled="trackBusy" @click="prev">
              <PrevIcon class="w-3.5 h-3.5 fill-current" />
            </button>

            <!-- Play/Pause -->
            <button type="button"
                    class="play-btn-spotify shadow-md flex items-center justify-center hover:scale-[1.06] active:scale-[0.96] transition-all duration-200"
                    :disabled="trackBusy"
                    @click="() => (!playing ? play() : pause())">
              <PauseIcon v-if="playing" class="w-3.5 h-3.5 fill-black text-black" />
              <PlayIcon v-else class="w-3.5 h-3.5 fill-black text-black ml-0.5" />
            </button>

            <!-- Next Button -->
            <button type="button" class="control-btn-spotify" :disabled="trackBusy" @click="next">
              <NextIcon class="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>
      </template>

      <!-- MODE 2: VERTICAL (SQUARE) LAYOUT -->
      <template v-else-if="layoutMode === 'vertical'">
        <div class="vertical-container flex flex-col items-center justify-center w-full pt-4">
          <!-- Album Art -->
          <div class="art-column relative group/art mb-3">
            <template v-if="trackBusy">
              <div class="absolute inset-0 flex items-center justify-center z-20 rounded-xl overflow-hidden bg-black/60 backdrop-blur-sm">
                <Spinner />
              </div>
            </template>
            <div class="art-card w-36 h-36 rounded-xl overflow-hidden border border-white/5 shadow-2xl transition-transform duration-300 group-hover/art:scale-[1.02]">
              <img v-if="thumbnail" :src="thumbnail" alt="album art" class="w-full h-full object-cover pointer-events-none" loading="lazy" @load="handleAccent" />
              <div v-else class="w-full h-full bg-zinc-900 flex items-center justify-center">
                <MiniPlayerIcon class="w-12 h-12 text-zinc-600" />
              </div>
            </div>
          </div>

          <!-- Metadata & Likes -->
          <div class="w-full flex items-center justify-between px-1 mb-2.5">
            <div class="text-left min-w-0 flex-1 mr-4">
              <h2 v-if="track?.video" class="text-white text-sm font-bold truncate leading-tight tracking-tight hover:underline cursor-pointer">{{ track.video.title }}</h2>
              <h2 v-else class="text-zinc-500 text-sm font-bold truncate">재생 중인 곡 없음</h2>
              <p v-if="track?.video" class="text-zinc-400 text-xs font-semibold mt-0.5 truncate">{{ track.video.author }}</p>
              <p v-else class="text-zinc-600 text-xs mt-0.5">-</p>
            </div>

            <!-- Like/Dislike Thumbs -->
            <div class="flex items-center space-x-2.5 flex-shrink-0">
              <button v-if="playState?.liked !== undefined"
                      type="button"
                      class="thumb-btn text-zinc-400 hover:text-white"
                      :class="{ 'active': !!playState?.liked }"
                      :disabled="trackBusy"
                      title="좋아요"
                      @click="likeToggle">
                <ThumbsUpIcon class="w-4 h-4 fill-current" />
              </button>
              <button v-if="playState?.disliked !== undefined"
                      type="button"
                      class="thumb-btn text-zinc-400 hover:text-white"
                      :class="{ 'active': !!playState?.disliked }"
                      :disabled="trackBusy"
                      title="싫어요"
                      @click="dislikeToggle">
                <ThumbsDownIcon class="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>

          <!-- Progress Slider -->
          <div class="w-full px-1 mb-2.5">
            <div class="progress-track-wrapper py-1.5 cursor-pointer group/progress" @click="setCurrentTime">
              <div class="progress-track-bg h-1 rounded-full bg-white/10 group-hover/progress:h-1.5 transition-all duration-150 relative">
                <div ref="progressHandle" class="progress-fill h-full rounded-full absolute left-0 top-0"
                     :style="{
                       width: `${time ? time[2] : 0}%`,
                       backgroundColor: '#1ed760'
                     }">
                  <div class="progress-thumb absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-white opacity-0 group-hover/progress:opacity-100 transition-opacity duration-150 shadow-md"></div>
                </div>
              </div>
            </div>
            <div v-if="time" class="flex justify-between text-[10px] text-zinc-500 font-semibold mt-1.5 tabular-nums">
              <span>{{ time[0] }}</span>
              <span>{{ time[1] }}</span>
            </div>
          </div>

          <!-- Playback Controls -->
          <div class="flex items-center justify-center space-x-4.5">
            <!-- Shuffle -->
            <button type="button" class="utility-btn-spotify text-zinc-400 hover:text-white" title="셔플" @click="toggleShuffle">
              <ShuffleIcon class="w-3.5 h-3.5" />
            </button>

            <!-- Prev -->
            <button type="button" class="control-btn-spotify text-zinc-400 hover:text-white" :disabled="trackBusy" @click="prev">
              <PrevIcon class="w-3.5 h-3.5 fill-current" />
            </button>

            <!-- Play/Pause -->
            <button type="button"
                    class="play-btn-spotify shadow-md flex items-center justify-center hover:scale-[1.06] active:scale-[0.96] transition-all duration-200"
                    :disabled="trackBusy"
                    @click="() => (!playing ? play() : pause())">
              <PauseIcon v-if="playing" class="w-4 h-4 fill-black text-black" />
              <PlayIcon v-else class="w-4 h-4 fill-black text-black ml-0.5" />
            </button>

            <!-- Next -->
            <button type="button" class="control-btn-spotify text-zinc-400 hover:text-white" :disabled="trackBusy" @click="next">
              <NextIcon class="w-3.5 h-3.5 fill-current" />
            </button>

            <!-- Repeat -->
            <button type="button" class="utility-btn-spotify text-zinc-400 hover:text-white" title="반복" @click="toggleRepeat">
              <RepeatIcon class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </template>

      <!-- MODE 3: HORIZONTAL (LANDSCAPE) LAYOUT -->
      <template v-else>
        <div class="horizontal-container flex items-center w-full pt-4">
          <!-- Album Art -->
          <div class="art-column flex-shrink-0 relative group/art mr-4">
            <template v-if="trackBusy">
              <div class="absolute inset-0 flex items-center justify-center z-20 rounded-xl overflow-hidden bg-black/60 backdrop-blur-sm">
                <Spinner />
              </div>
            </template>
            <div class="art-card w-20 h-20 rounded-xl overflow-hidden border border-white/5 shadow-2xl transition-transform duration-300 group-hover/art:scale-[1.02]">
              <img v-if="thumbnail" :src="thumbnail" alt="album art" class="w-full h-full object-cover pointer-events-none" loading="lazy" @load="handleAccent" />
              <div v-else class="w-full h-full bg-zinc-900 flex items-center justify-center">
                <MiniPlayerIcon class="w-10 h-10 text-zinc-600" />
              </div>
            </div>
          </div>

          <!-- Info & Controls Column -->
          <div class="flex-1 min-w-0 flex flex-col justify-center">
            <!-- Metadata & Likes -->
            <div class="w-full flex items-center justify-between mb-1">
              <div class="text-left min-w-0 flex-1 mr-4">
                <h2 v-if="track?.video" class="text-white text-xs font-bold truncate leading-tight hover:underline cursor-pointer">{{ track.video.title }}</h2>
                <h2 v-else class="text-zinc-500 text-xs font-bold truncate">재생 중인 곡 없음</h2>
                <p v-if="track?.video" class="text-zinc-400 text-[10px] font-semibold mt-0.5 truncate">{{ track.video.author }}</p>
                <p v-else class="text-zinc-600 text-xs mt-0.5">-</p>
              </div>

              <!-- Like/Dislike Thumbs -->
              <div class="flex items-center space-x-2 flex-shrink-0">
                <button v-if="playState?.liked !== undefined"
                        type="button"
                        class="thumb-btn text-zinc-400 hover:text-white"
                        :class="{ 'active': !!playState?.liked }"
                        :disabled="trackBusy"
                        title="좋아요"
                        @click="likeToggle">
                  <ThumbsUpIcon class="w-3.5 h-3.5 fill-current" />
                </button>
                <button v-if="playState?.disliked !== undefined"
                        type="button"
                        class="thumb-btn text-zinc-400 hover:text-white"
                        :class="{ 'active': !!playState?.disliked }"
                        :disabled="trackBusy"
                        title="싫어요"
                        @click="dislikeToggle">
                  <ThumbsDownIcon class="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>

            <!-- Progress Slider -->
            <div class="w-full mb-1">
              <div class="progress-track-wrapper py-1 cursor-pointer group/progress" @click="setCurrentTime">
                <div class="progress-track-bg h-1 rounded-full bg-white/10 group-hover/progress:h-1.5 transition-all duration-150 relative">
                  <div ref="progressHandle" class="progress-fill h-full rounded-full absolute left-0 top-0"
                       :style="{
                         width: `${time ? time[2] : 0}%`,
                         backgroundColor: '#1ed760'
                       }">
                    <div class="progress-thumb absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-white opacity-0 group-hover/progress:opacity-100 transition-opacity duration-150 shadow-md"></div>
                  </div>
                </div>
              </div>
              <div v-if="time" class="flex justify-between text-[9px] text-zinc-500 font-semibold mt-0.5 tabular-nums">
                <span>{{ time[0] }}</span>
                <span>{{ time[1] }}</span>
              </div>
            </div>

            <!-- Playback Controls -->
            <div class="flex items-center justify-center space-x-3.5">
              <!-- Shuffle -->
              <button type="button" class="utility-btn-spotify text-zinc-400 hover:text-white" title="셔플" @click="toggleShuffle">
                <ShuffleIcon class="w-3 h-3" />
              </button>

              <!-- Prev -->
              <button type="button" class="control-btn-spotify text-zinc-400 hover:text-white" :disabled="trackBusy" @click="prev">
                <PrevIcon class="w-3 h-3 fill-current" />
              </button>

              <!-- Play/Pause -->
              <button type="button"
                      class="play-btn-spotify shadow-md flex items-center justify-center hover:scale-[1.06] active:scale-[0.96] transition-all duration-200"
                      :disabled="trackBusy"
                      @click="() => (!playing ? play() : pause())">
                <PauseIcon v-if="playing" class="w-3.5 h-3.5 fill-black text-black" />
                <PlayIcon v-else class="w-3.5 h-3.5 fill-black text-black ml-0.5" />
              </button>

              <!-- Next -->
              <button type="button" class="control-btn-spotify text-zinc-400 hover:text-white" :disabled="trackBusy" @click="next">
                <NextIcon class="w-3 h-3 fill-current" />
              </button>

              <!-- Repeat -->
              <button type="button" class="utility-btn-spotify text-zinc-400 hover:text-white" title="반복" @click="toggleRepeat">
                <RepeatIcon class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TrackData } from "@main/utils/trackData";
import MiniPlayerIcon from "@renderer/assets/icons/mini-player.svg";
import NextIcon from "@renderer/assets/icons/next.svg";
import PrevIcon from "@renderer/assets/icons/prev.svg";
import Spinner from "@renderer/components/Spinner.vue";
import { refLastFM } from "@renderer/lib/lastfm";
import { logger } from "@shared/utils/console";
import { refIpc, refWindowState } from "@shared/utils/Ipc";
import { intervalToDuration } from "date-fns";
import { clamp } from "lodash-es";
import {
  AlertCircleIcon,
  ExternalLink as BackToAppIcon,
  CheckIcon,
  X as CloseIcon,
  LayoutGrid as LayoutIcon, 
  Pause as PauseIcon,
  Pin as PinIcon,
  Play as PlayIcon,
  Repeat as RepeatIcon,
  Shuffle as ShuffleIcon,
  ThumbsDown as ThumbsDownIcon,
  ThumbsUp as ThumbsUpIcon
} from "lucide-vue-next";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

const zeroPad = (num) => String(num).padStart(2, "0");
const createInterval = (dts: number[]): [string, number] => [
  dts
    .filter((p, i) => (i === 0 ? Boolean(p) : true))
    .map(zeroPad)
    .join(":"),
  dts.length,
];

const [track, setTrack] = refIpc<TrackData>("TRACK_CHANGE", {
  ignoreUndefined: true,
  defaultValue: null,
});
const accentColor = ref<string | null>(null);
const [state] = refWindowState();
const [playState, setPlayState] = refIpc<{
  playing: boolean;
  progress: number;
  duration: number;
  liked: boolean;
  disliked: boolean;
}>("TRACK_PLAYSTATE");
const showWinBorder = ref<boolean | "win11">(false);
const trackBusy = ref(false);
const isTop = ref(false);

const windowWidth = ref(window.innerWidth);
const windowHeight = ref(window.innerHeight);

const handleResize = () => {
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;
};

const detectLayoutMode = (width: number, height: number): "vertical" | "horizontal" | "slim" => {
  if (height <= 160) return "slim";
  if (width / height <= 1.25) return "vertical";
  return "horizontal";
};

const layoutMode = ref<"vertical" | "horizontal" | "slim">("vertical");

// Update layout mode reactively on manual resizes
watch([windowWidth, windowHeight], ([w, h]) => {
  layoutMode.value = detectLayoutMode(w, h);
});

async function cycleLayoutMode() {
  let nextMode: "vertical" | "horizontal" | "slim" = "vertical";
  if (layoutMode.value === "vertical") {
    nextMode = "horizontal";
  } else if (layoutMode.value === "horizontal") {
    nextMode = "slim";
  } else {
    nextMode = "vertical";
  }

  layoutMode.value = nextMode;
  await window.api.action("miniplayer.setLayout", nextMode);
}

onMounted(() => {
  document.title = `YouTube Music - Mini Player`;
  window.addEventListener("resize", handleResize);
  layoutMode.value = detectLayoutMode(window.innerWidth, window.innerHeight);
  Promise.all([
    window.ipcRenderer.invoke("api/track"),
    window.ipcRenderer.invoke("api/track/state"),
    window.process.isWin11(),
    window.ipcRenderer.invoke("miniplayer.stayOnTop"),
    window.api.windowState(),
  ]).then(([trackData, playStateData, isWin11, stayTop, windowState]) => {
    setTrack(trackData);
    setPlayState(playStateData);
    showWinBorder.value = window.process.platform === "win32" ? (isWin11 ? "win11" : true) : windowState.platform.isMacOS;
    isTop.value = stayTop;
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

const accentStyle = computed(() => {
  if (!accentColor.value) {
    return {
      background: "#121212"
    };
  }
  // Hex with alpha transparency (e.g. 24 is ~14% opacity) for a sleek backdrop glow
  return {
    background: `linear-gradient(135deg, ${accentColor.value}24 0%, #121212 100%)`
  };
});

const { lastFM, lastFMLoading, lastFMState, authorizeLastFM } = refLastFM();
const progressHandle = ref<HTMLElement>(null);
let accentHandle: any;

const getCurrentAccent = (retry: number = 0) => {
  if (accentHandle) clearTimeout(accentHandle);
  window.ipcRenderer.invoke("api/track/accent").then((clr) => {
    if (!clr || retry > 2) accentColor.value = clr || null;
    else accentColor.value = clr;
    if (!clr) accentHandle = setTimeout(getCurrentAccent.bind(this, retry + 1), 500);
  });
};

function next() {
  trackBusy.value = true;
  return window.ipcRenderer
    .invoke("api/track/next")
    .finally(() => {
      trackBusy.value = false;
    })
    .then(() => {
      playState.value.progress = 0;
    });
}

function prev() {
  trackBusy.value = true;
  return window.ipcRenderer.invoke("api/track/prev").finally(() => {
    trackBusy.value = false;
    playState.value.progress = 0;
  });
}

function pause() {
  return window.ipcRenderer.invoke("api/track/pause");
}

function play() {
  return window.ipcRenderer.invoke("api/track/play");
}

function likeToggle() {
  if (typeof playState.value?.liked !== "boolean") return;
  trackBusy.value = true;
  return window.ipcRenderer.invoke("api/track/like", !playState.value.liked).finally(() => {
    trackBusy.value = false;
  });
}

function dislikeToggle() {
  if (typeof playState.value?.disliked !== "boolean") return;
  trackBusy.value = true;
  return window.ipcRenderer.invoke("api/track/dislike", !playState.value.disliked).finally(() => {
    trackBusy.value = false;
  });
}

function handleAccent(ev: Parameters<HTMLImageElement["onload"]>[0]) {
  const src = (ev.target as HTMLImageElement).src;
  if (src) {
    getCurrentAccent();
  }
}

function setCurrentTime(ev: MouseEvent) {
  if (trackBusy.value) return;
  if (!playState.value) return;
  const el = ev.currentTarget as HTMLDivElement;
  const rect = el.getBoundingClientRect();
  const percSelected = (ev.clientX - rect.left) / rect.width;
  const { duration } = playState.value;
  const seekTime = clamp(duration * percSelected, 0, duration) * 1000;

  trackBusy.value = true;
  return window.ipcRenderer.invoke("api/track/seek", { time: seekTime, type: "seek" }).finally(() => {
    trackBusy.value = false;
  });
}

async function toggleStayTop() {
  const result = await window.api.action("miniplayer.stayOnTop");
  isTop.value = result;
}

function closeMiniPlayer() {
  window.api.closeWindow();
}

function toggleShuffle() {
  window.ipcRenderer.invoke("api/track/shuffle");
}

function toggleRepeat() {
  window.ipcRenderer.invoke("api/track/repeat");
}

const thumbnail = computed(() => {
  return track.value?.meta?.thumbnail;
});

const playing = computed(() => {
  return !!playState.value?.playing;
});

const time = computed((): [string, string, number] => {
  const { duration, progress } = playState.value ?? {};
  if (typeof duration !== "number" || typeof progress !== "number") return null;
  const [current] = (({ hours, minutes, seconds }) => createInterval([hours, minutes, seconds]))(
    intervalToDuration({
      start: duration * 1000 - (progress > duration ? duration : Math.floor(progress)) * 1000,
      end: duration * 1000,
    }),
  );
  const [end, endPad] = (({ hours, minutes, seconds }) => createInterval([hours, minutes, seconds]))(intervalToDuration({ start: 0, end: duration * 1000 })) as [string, number];
  const timePad = endPad * 2;
  const percentage = ((progress > duration ? duration : progress) / duration) * 100;
  return [current.padEnd(timePad), end.padStart(timePad), percentage];
});

watch(state, (windowState) => logger.debug(windowState && { ...windowState }));
</script>

<style lang="scss" scoped>
/* Spotify Ambient backdrop gradient transition */
.group {
  transition: background 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Custom Spotify Header overlay */
.spotify-header {
  .no-drag {
    -webkit-app-region: no-drag !important;
  }
}

.header-icon-btn {
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }
  
  &:active {
    transform: scale(0.92);
  }
}

/* Layout setups */
.player-layout {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
  box-sizing: border-box;
  
  &.slim {
    padding: 8px 16px;
  }
  
  &.horizontal {
    padding: 12px 18px;
  }
}

/* Micro-animations */
@keyframes pulse-subtle {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 1; }
}

.animate-pulse-subtle {
  animation: pulse-subtle 2s infinite ease-in-out;
}

/* Spotify buttons styling */
.control-btn-spotify {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: all 0.2s ease;
  cursor: pointer;
  background: transparent;
  border: none;
  outline: none;
  color: #b3b3b3;
  -webkit-app-region: no-drag;

  svg {
    fill: currentColor;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
    color: #ffffff;
  }

  &:active {
    transform: scale(0.9);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.utility-btn-spotify {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: all 0.2s ease;
  cursor: pointer;
  background: transparent;
  border: none;
  outline: none;
  color: #b3b3b3;
  -webkit-app-region: no-drag;

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
    color: #ffffff;
  }

  &:active {
    transform: scale(0.9);
  }
}

/* Play/Pause Spotify White Circular Button */
.play-btn-spotify {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ffffff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease;
  -webkit-app-region: no-drag;
  
  svg {
    color: #000000;
  }

  &:hover {
    background-color: #f6f6f6;
    transform: scale(1.06);
  }
  
  &:active {
    transform: scale(0.94);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

/* Thumbs Up / Thumbs Down Styles */
.thumb-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: transparent;
  border: none;
  outline: none;
  -webkit-app-region: no-drag;
  transition: all 0.2s ease;
  
  svg {
    stroke: #b3b3b3;
    fill: transparent;
    transition: all 0.2s ease;
  }

  &:hover svg {
    stroke: #ffffff;
  }

  &.active {
    svg {
      stroke: #1ed760;
      fill: #1ed760;
    }
    &:hover svg {
      stroke: #1fdf64;
      fill: #1fdf64;
    }
  }
  
  &:active {
    transform: scale(0.9);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

/* Draggable parts */
.art-card,
.art-column {
  -webkit-app-region: drag;
  
  img {
    -webkit-app-region: drag;
  }
}

/* Progress Slider */
.progress-track-wrapper {
  -webkit-app-region: no-drag;
}
</style>
