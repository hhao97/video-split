import { ConveyorApi } from '@/lib/preload/shared'
import type { ChannelArgs } from '@/lib/conveyor/schemas'

export class VideoApi extends ConveyorApi {
  selectFile = () => this.invoke('video-select-file')
  selectFolder = () => this.invoke('video-select-folder')
  checkFfmpeg = () => this.invoke('video-check-ffmpeg')
  inspect = (settings: ChannelArgs<'video-inspect'>[0]) => this.invoke('video-inspect', settings)
  previewUrl = (settings: ChannelArgs<'video-preview-url'>[0]) => this.invoke('video-preview-url', settings)
  split = (settings: ChannelArgs<'video-split'>[0]) => this.invoke('video-split', settings)
  stopSplit = () => this.invoke('video-stop-split')
  merge = (settings: ChannelArgs<'video-merge'>[0]) => this.invoke('video-merge', settings)
}
