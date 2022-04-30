import { app } from 'electron'
import fs from 'fs'
import path from 'path'

export const saveBase64Image = (data: string): string => {
  try {
    const raw = data.replace(/^data:image\/jpeg;base64,/, '')
    const buffer = Buffer.from(raw, 'base64')

    const temp = path.join(app.getPath('userData'), 'posters')
    if (!fs.existsSync(temp)) {
      fs.mkdirSync(temp, { recursive: true })
    }

    const absPath = path.join(temp, `/${+new Date()}.jpg`)
    fs.writeFileSync(absPath, buffer)
    return absPath
  } catch {
    return ''
  }
}
