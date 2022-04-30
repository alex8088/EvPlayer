import Store, { Schema } from 'electron-store'
import { VideoInfo } from '../common/types'

interface Entity {
  playlist: VideoInfo[]
}

const schema: Schema<Entity> = {
  playlist: {
    type: 'array',
    default: []
  }
}

export const store = new Store<Entity>({ schema })
