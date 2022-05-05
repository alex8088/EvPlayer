<script setup lang="ts">
import { ref, onMounted } from 'vue'
import useIpcRendererOn from '../hook/useIpcRendererOn'
import { VideoInfo } from '../../../common/types'
import { IpcEvents } from '../../../common/ipcEvents'

import OverlayScrollbars from '@codeporter/overlayscrollbars-vue'
import 'overlayscrollbars/css/OverlayScrollbars.css'

const expand = ref<boolean>(false)
const list = ref<VideoInfo[]>()
const current = ref<string>()

const emit = defineEmits<{
  (e: 'click', video: VideoInfo): void
}>()

useIpcRendererOn(IpcEvents.EV_ADD_VIDEOS, (_, videos: VideoInfo[]) => {
  const video = videos[0]
  current.value = video?.path
  list.value = videos
  if (video) emit('click', video)
})

onMounted(() => {
  window.electron.ipcRenderer.invoke(IpcEvents.EV_GET_PLAYLIST).then((videos: VideoInfo[]) => {
    list.value = videos
  })
})

const handleClick = (video: VideoInfo): void => {
  current.value = video.path
  emit('click', video)
}

const toggle = (): void => {
  expand.value = !expand.value
}

defineExpose({
  toggle
})
</script>

<template>
  <div v-if="expand" class="playlist">
    <overlay-scrollbars
      class="playlist-container"
      :options="{
        scrollbars: { autoHide: 'leave' },
        className: 'os-theme-light',
        updateOnLoad: null
      }"
    >
      <ul>
        <li v-for="v in list" :key="v.name" :title="v.path" @click="handleClick(v)">
          <img class="poster" :src="`file:///${v.poster}`" alt="" />
          <span class="duration">{{ v.duration }}</span>
          <div v-if="current === v.path" class="playing"></div>
        </li>
      </ul>
    </overlay-scrollbars>
  </div>
</template>

<style lang="less">
.playlist {
  width: 206px;
  background-color: rgb(37, 37, 37);

  &-container {
    height: 100%;
    overflow: hidden;
  }

  ul {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;

    li {
      position: relative;
      margin: 6px 6px 0 6px;
      border-radius: 4px;

      &:not(:first-child) {
        margin-top: 0;
      }

      &:last-child {
        margin-bottom: 6px;
      }

      &:hover {
        background-color: rgba(90, 93, 94, 0.31);
      }

      .poster {
        display: block;
        height: 100px;
        width: 178px;
        object-fit: cover;
        cursor: pointer;
        border-radius: 8px;
        border: 1px solid transparent;
        padding: 4px;
      }

      .duration {
        position: absolute;
        bottom: 10px;
        right: 20px;
        color: #fff;
        font-size: 13px;
      }

      .playing {
        position: absolute;
        top: 12px;
        right: 20px;
        background-color: #1e80ff;
        height: 10px;
        width: 10px;
        border-radius: 100%;
      }
    }
  }
}
</style>
