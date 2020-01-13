// DEBUG
import './debugs'

import {
  windowSizeObserver,
  mouseMoveObserver,
  deviceOrientationObserver
} from './modules'
import WebGL from './views/webgl'

windowSizeObserver.on().update()
mouseMoveObserver.on().update()
deviceOrientationObserver.on().update()
;(async () => {
  const webGL: WebGL = new WebGL()
  webGL
    .create()
    .resize()
    .on()
    .start()
    .startObject('drawElements')
})()
