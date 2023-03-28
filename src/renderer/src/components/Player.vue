<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import videojs from 'video.js'

import { getVideoInfoList } from '../utils/video'
import Keyboard from '../utils/keyboard'

import { VideoFile, VideoInfo } from '../../../common/types'
import { IpcEvents } from '../../../common/ipcEvents'

const playerRef = ref<HTMLVideoElement>()
const player = ref<videojs.Player>()
const currentVideo = ref<VideoInfo | null>()

const play = (video: VideoInfo): void => {
  if (currentVideo.value?.path !== video.path) {
    currentVideo.value = video
    if (video) player.value?.src(`file:///${video.path}`)
  }
}

const pause = (): void => {
  player.value?.pause()
}

const handleDrop = async (e: DragEvent): Promise<void> => {
  e.preventDefault()

  const files: VideoFile[] = []
  if (e.dataTransfer) {
    for (const f of e.dataTransfer.files) {
      if (f.type.startsWith('video')) {
        files.push({
          path: f.path,
          name: f.name
        })
      }
    }
  }

  if (files.length) {
    const videoInfoList = await getVideoInfoList(files)
    window.electron.ipcRenderer.send(IpcEvents.EV_ADD_VIDEOS, videoInfoList)
  }
}

onMounted(() => {
  if (playerRef.value) {
    player.value = videojs(playerRef.value, {
      controls: true,
      autoplay: true,
      fill: true,
      controlBar: {
        volumePanel: { inline: false, volumeControl: { vertical: true } },
        children: [
          'playToggle',
          'volumePanel',
          'currentTimeDisplay',
          'progressControl',
          'durationDisplay',
          'fullscreenToggle'
        ]
      },
      userActions: {
        hotkeys: function (event): void {
          if (player.value) {
            Keyboard.handlerKeyCode(player.value, event.keyCode)
          }
        }
      }
    })
    const keyboard = new Keyboard(player.value)
    keyboard.bind()
  }
})

onUnmounted(() => {
  if (player.value) player.value.dispose()
})

defineExpose({
  play,
  pause
})
</script>

<template>
  <div class="player" @drop="handleDrop" @dragenter.prevent @dragover.prevent>
    <video ref="playerRef" class="video-js"></video>
  </div>
</template>

<style>
@import 'video.js/dist/video-js.css';
@import '../assets/css/player.css';

.player {
  flex: 1;
}
</style>
