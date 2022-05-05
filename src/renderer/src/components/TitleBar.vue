<script setup lang="ts">
import { ref } from 'vue'
import useIpcRendererOn from '../hook/useIpcRendererOn'
import { IpcEvents } from '../../../common/ipcEvents'

defineProps({
  title: String
})

const isWindow = ref<boolean>(window.electron.process.platform === 'win32')
const isLinux = ref<boolean>(window.electron.process.platform === 'linux')

const emit = defineEmits<{
  (e: 'toggle-playlist'): void
}>()

const maximize = ref(false)

const handleClick = (action: 'min' | 'max' | 'close'): void => {
  window.electron.ipcRenderer.send(IpcEvents.WIN_INVOKE, action)
}

const openVideo = (): void => {
  window.electron.ipcRenderer.send(IpcEvents.EV_SHOW_OPEN_DIALOG)
}

useIpcRendererOn(IpcEvents.WIN_MAX_REPLY, (_, arg: boolean) => {
  maximize.value = arg
})
</script>

<template>
  <div class="titlebar">
    <div v-if="isWindow" class="titlebar__icon"></div>
    <div class="titlebar__title">{{ isLinux ? '' : title }}</div>
    <div class="titlebar__opr">
      <ul class="toolbar">
        <li @click="openVideo"><a class="codicon codicon-open"></a></li>
        <li @click="emit('toggle-playlist')"><a class="codicon codicon-right-layout"></a></li>
      </ul>
      <div v-if="isWindow" class="win-control">
        <div
          class="win-control__btn win-control__btn-min codicon codicon-win-minimize"
          @click="handleClick('min')"
        ></div>
        <div
          class="win-control__btn win-control__btn-max codicon"
          :class="[maximize ? 'codicon-win-restore' : 'codicon-win-maximize']"
          @click="handleClick('max')"
        ></div>
        <div
          class="win-control__btn win-control__btn-close codicon codicon-win-close"
          @click="handleClick('close')"
        ></div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@titlebarBg: rgb(60, 60, 60);
@titlebarColor: rgb(204, 204, 204);
@titlebarHeight: 30px;
@titlebarFontSize: 13px;
@titlebarTitleWidth: 320px;
@titlbarBtnWidth: 46px;
@titlbarBtnColor: #ccc;

.titlebar {
  -webkit-app-region: drag;
  background-color: @titlebarBg;
  color: @titlebarColor;
  height: @titlebarHeight;
  line-height: @titlebarHeight;
  width: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
  user-select: none;

  &__icon {
    background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg%20viewBox%3D%220%200%201024%201024%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22256%22%20height%3D%22256%22%3E%3Cpath%20d%3D%22M32.60749206%20506.66666667c2.1997037-160.6650582%2030.10234921-293.69837037%20111.68643386-373.03940741C223.63496296%2052.04317461%20356.66827513%2024.1405291%20517.33333333%2021.9408254c160.6650582%202.1997037%20293.69837037%2030.10234921%20373.03940741%20111.68643386C971.95682539%20212.9682963%20999.8594709%20346.00160847%201002.0591746%20506.66666667c-2.1997037%20160.6650582-30.10234921%20293.69837037-111.68643386%20373.03940741C811.0317037%20961.29015873%20677.99839153%20989.19280424%20517.33333333%20991.39250794c-160.6650582-2.1997037-293.69837037-30.10234921-373.03940741-111.68643386C62.70984127%20800.36503704%2034.80719576%20667.33172487%2032.60749206%20506.66666667z%22%20fill%3D%22%231296DB%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M695.23843386%20462.06577778l-263.31428572-146.54577778c-34.01413757-18.93045503-75.85185186%205.66721693-75.85185184%2044.60088889v293.09155556c0%2038.93367195%2041.83771429%2063.53134392%2075.85185184%2044.60088889l263.31428572-146.54577778c34.95686773-19.46141799%2034.95686773-69.74035979%200-89.20177778z%22%20fill%3D%22%23FFFFFF%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E');
    background-repeat: no-repeat;
    background-size: 20px;
    background-position: 50%;
    width: 35px;
    height: 100%;
    position: relative;
    z-index: 3000;
    flex-shrink: 0;
  }

  &__title {
    flex: 0 1 auto;
    height: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin: 0 auto;
    zoom: 1;
    max-width: @titlebarTitleWidth;
    font-size: @titlebarFontSize;
  }

  &__opr {
    -webkit-app-region: no-drag;
    display: flex;
    flex-grow: 0;
    flex-shrink: 0;
    position: relative;
    z-index: 1000;
    height: 100%;
  }
}

.win-control {
  &__btn {
    color: @titlbarBtnColor;
    display: inline-block;
    height: 100%;
    width: @titlbarBtnWidth;
    font-size: 16px;

    &:hover {
      background-color: hsla(0, 0%, 100%, 0.1);
    }
  }

  &__btn-close {
    &:hover {
      background-color: rgba(232, 17, 35, 0.9);
    }
  }
}

.toolbar {
  color: @titlbarBtnColor;
  display: flex;
  height: 100%;
  margin-right: 4px;

  li {
    display: block;
    cursor: pointer;
    margin: 0 4px;

    a {
      padding: 3px;
      border-radius: 5px;

      &:hover {
        background-color: hsla(0, 0%, 100%, 0.1);
      }
    }
  }
}
</style>
