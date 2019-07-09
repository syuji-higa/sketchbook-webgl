// DEBUG
import './debugs'

import { windowSizeObserver } from './modules'
import Camera from './views/camera'
import WebGL from './views/webgl'

windowSizeObserver.on().update()

// sequence
;(async () => {
  const camera = new Camera()
  const _$video = await camera.create({ video: true, audio: false })
  document.body.appendChild(_$video)

  await new Promise((resolve) => {
    _$video.onloadedmetadata = () => {
      _$video.play()
      resolve()
    }
  })

  const webGL: WebGL = new WebGL()
  webGL
    .create()
    .resize()
    .on()
    .start()
  webGL.setVideoObject('main', _$video).startObject('main')
})()
