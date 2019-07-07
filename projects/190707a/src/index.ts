// DEBUG
import './debugs'

import { windowSizeObserver } from './modules'
import WebGL from './views/webgl'

windowSizeObserver.on().update()
;(async () => {
  const webGL: WebGL = new WebGL()
  webGL
    .create()
    .resize()
    .on()
    .start()
  const _isSuccessLoadTextre: boolean = await webGL.loadTextureObject(
    'drawElements',
    './goat.png',
    0
  )
  if (_isSuccessLoadTextre) {
    webGL.startObject('drawElements')
    webGL.startObject('drawArrays')
  }
})()
