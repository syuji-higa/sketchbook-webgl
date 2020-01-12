// DEBUG
import './debugs'

import { windowSizeObserver } from './modules'
import Camera from './views/camera'
import WebGL from './views/webgl'

windowSizeObserver.on().update()

// sequence
;(async () => {
  const camera = new Camera()
  const $video = await camera.create({ video: true, audio: false })
  document.body.appendChild($video)

  await new Promise((resolve) => {
    $video.onloadedmetadata = () => {
      $video.width = $video.videoWidth
      $video.height = $video.videoHeight
      $video.play()
      resolve()
    }
  })

  const webGL: WebGL = new WebGL()
  webGL
    .create()
    .resize()
    .on()
    .start()
  await webGL.load('main')
  webGL.setVideoObject('main', $video).startObject('main')
})()
