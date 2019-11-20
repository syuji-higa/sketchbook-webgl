import Eventer from './modules/eventer'
import WindowSizeObserver from './modules/window-size-observer'
import RequestAnimationFramer from './modules/request-animation-framer'

// Eventer
export const eventer: Eventer = new Eventer()

// WindowSizeObserver
export const windowSizeObserver: WindowSizeObserver = new WindowSizeObserver()

// RequestAnimationFramer
export const requestAnimationFramer: RequestAnimationFramer = new RequestAnimationFramer()
