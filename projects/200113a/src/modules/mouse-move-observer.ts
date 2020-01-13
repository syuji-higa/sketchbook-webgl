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

class MouseMoveObserver {
  private _mousemoveThrottle: Function
  private _mousemoveEvt: EventFunction

  constructor() {
    this._mousemoveThrottle = throttle()
    this._mousemoveEvt = eventer.create(
      window,
      'mousemove',
      this._onMousemove.bind(this)
    )
  }

  on(): MouseMoveObserver {
    this._mousemoveEvt.add()
    return this
  }

  off(): MouseMoveObserver {
    this._mousemoveEvt.remove()
    return this
  }

  update(): MouseMoveObserver {
    return this
  }

  private _onMousemove(e: MouseEvent) {
    this._mousemoveThrottle(this._mousemoved.bind(this, e))
  }

  private _mousemoved(e: MouseEvent) {
    const { windowWidth, windowHeight } = store.state

    const _x: number /* [-1,1] */ = (e.clientX / windowWidth) * 2 - 1
    const _y: number /* [-1,1] */ = (e.clientY / windowHeight) * 2 - 1

    store.commit('setMouseX', _x)
    store.commit('setMouseY', _y)
  }
}

export { MouseMoveObserver as default }
