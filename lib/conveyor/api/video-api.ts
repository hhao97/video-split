import { ConveyorApi } from '@/lib/preload/shared'
import type { ChannelArgs } from '@/lib/conveyor/schemas'

export class VideoApi extends ConveyorApi {
  selectFile = () => this.invoke('video-select-file')
  selectFolder = () => this.invoke('video-select-folder')
  checkFfmpeg = () => this.invoke('video-check-ffmpeg')
  process = (settings: ChannelArgs<'video-process'>[0]) => this.invoke('video-process', settings)
}

