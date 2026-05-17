import { ConveyorApi } from '@/lib/preload/shared'
export class VideoApi extends ConveyorApi {
  selectFile = () => this.invoke('video-select-file')
  selectFolder = () => this.invoke('video-select-folder')
  checkFfmpeg = () => this.invoke('video-check-ffmpeg')
  inspect = (settings) => this.invoke('video-inspect', settings)
  previewUrl = (settings) => this.invoke('video-preview-url', settings)
  split = (settings) => this.invoke('video-split', settings)
  stopSplit = () => this.invoke('video-stop-split')
  merge = (settings) => this.invoke('video-merge', settings)
}
