import { basename, extname } from 'path'
import { existsSync, statSync } from 'fs'

import { VideoFile } from '../common/types'

export function getVideoExtensions(withDot = true): string[] {
  return withDot ? ['.mp4', '.webm', '.ogg'] : ['mp4', 'webm', 'ogg']
}

export function getVideoFromPath(path: string): VideoFile | undefined {
  if (path && existsSync(path)) {
    const stats = statSync(path)
    if (stats.isFile()) {
      const name = basename(path)
      const ext = extname(name)
      const extensions = getVideoExtensions()
      if (extensions.indexOf(ext.toLowerCase()) >= 0) {
        return {
          path: path,
          name: name
        }
      }
    }
  }
  return
}
