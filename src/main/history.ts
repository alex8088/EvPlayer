import { app, JumpListCategory, JumpListItem } from 'electron'
import { platform } from '@electron-toolkit/utils'
import { store } from './store'
import { VideoInfo } from '../common/types'

export const clearWindowJumpList = (): void => {
  if (!platform.isWindows) {
    return
  }
  app.setJumpList(null)
}

export const setWindowJumpList = (videoList?: VideoInfo[]): void => {
  if (!platform.isWindows) {
    return
  }

  const jumpList: JumpListCategory[] = []

  let videos = videoList || store.get('playlist')

  const jumpItemList: JumpListItem[] = []
  if (videos.length) {
    videos = videos.slice(0, 5)
    videos.forEach((v) => {
      jumpItemList.push({
        type: 'task',
        title: v.name.substring(0, 255),
        description: v.path.substring(0, 255),
        program: process.execPath,
        args: `--uri=${v.path}`,
        iconPath: process.execPath,
        iconIndex: 0
      })
    })
  }

  if (jumpItemList.length) {
    jumpList.push({
      type: 'custom',
      name: '最近播放',
      items: jumpItemList
    })
  }

  if (jumpList.length) {
    app.setJumpList(jumpList)
  }
}

export const clearMacOSRecentDocuments = (): void => {
  if (!platform.isMacOS) {
    return
  }
  app.clearRecentDocuments()
}

export const setMacOSRecentDocuments = (videoList?: VideoInfo[]): void => {
  if (!platform.isMacOS) {
    return
  }

  app.clearRecentDocuments()

  let videos = videoList || store.get('playlist')
  videos = videos.slice(0, 5)

  if (videos.length) {
    videos.reverse().forEach((v) => app.addRecentDocument(v.path))
  }
}
