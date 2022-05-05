/* eslint-disable  @typescript-eslint/no-explicit-any */
import type { IpcRendererEvent, IpcRenderer } from '@electron-toolkit/preload'
import { onUnmounted } from 'vue'

type IpcRendererListener = (event: IpcRendererEvent, ...args: any[]) => void

type IpcEvents = 'win:max-reply' | 'ev:add-videos' | 'ev:play-videos' | 'ev:pause'

export default function useIpcRendererOn(
  channel: IpcEvents,
  listener: IpcRendererListener
): IpcRenderer {
  const ipc = window.electron.ipcRenderer

  onUnmounted(() => {
    ipc.removeListener(channel, listener)
  })

  return window.electron.ipcRenderer.on(channel, listener)
}
