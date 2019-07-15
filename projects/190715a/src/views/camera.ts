class Camera {
  private _$video: HTMLVideoElement | null = null

  constructor() {}

  async create(constraints: Object = {}): Promise<HTMLVideoElement> {
    this._$video = document.createElement('video') as HTMLVideoElement

    await navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        this._$video.srcObject = stream
      })
      .catch((err) => {
        console.error(`An error occured! ${err}`)
      })

    return this._$video
  }

  destroy(): Camera {
    this._$video = null
    return this
  }
}

export { Camera as default }
