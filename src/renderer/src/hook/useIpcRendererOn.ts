/* eslint-disable  @typescript-eslint/no-explicit-any */
import type { IpcRendererEvent, IpcRenderer } from '@electron-toolkit/preload'
import { onUnmounted } from 'vue'

import { IpcEvents } from '../../../common/ipcEvents'

type IpcRendererListener = (event: IpcRendererEvent, ...args: any[]) => void

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
