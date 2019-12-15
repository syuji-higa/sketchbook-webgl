/**
 * depends on 'vanix' used in 'store'
 */

import { store } from '../store'
import { eventer } from '../modules'
import { throttle } from '../utils/throttle'

type EventFunction = {
  add: Function
  remove: Function
}

class deviceOrientationObserver {
  private _deviceorientationThrottle: Function
  private _deviceorientationEvt: EventFunction

  constructor() {
    this._deviceorientationThrottle = throttle()
    this._deviceorientationEvt = eventer.create(
      window,
      'deviceorientation',
      this._onDeviceorientation.bind(this)
    )
  }

  on(): deviceOrientationObserver {
    this._deviceorientationEvt.add()
    return this
  }

  off(): deviceOrientationObserver {
    this._deviceorientationEvt.remove()
    return this
  }

  update(): deviceOrientationObserver {
    return this
  }

  private _onDeviceorientation(e: DeviceOrientationEvent) {
    this._deviceorientationThrottle(this._deviceorientationed.bind(this, e))
  }

  private _deviceorientationed(e: DeviceOrientationEvent) {
    store.commit('setAlpha', e.alpha / 360)
    store.commit('setBeta', (e.beta - 45) / 90)
    store.commit('setGamma', e.gamma / 90)
  }
}

export { deviceOrientationObserver as default }
