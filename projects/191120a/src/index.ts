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
    .startObject('drawArrays')
})()
