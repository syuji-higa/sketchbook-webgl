import Eventer from './modules/eventer'
import WindowSizeObserver from './modules/window-size-observer'
import MouseMoveObserver from './modules/mouse-move-observer'
import DeviceOrientationObserver from './modules/device-orientation-observer'
import RequestAnimationFramer from './modules/request-animation-framer'

// Eventer
export const eventer: Eventer = new Eventer()

// WindowSizeObserver
export const windowSizeObserver: WindowSizeObserver = new WindowSizeObserver()

// MouseMoveObserver
export const mouseMoveObserver: MouseMoveObserver = new MouseMoveObserver()

// DeviceOrientationObserver
export const deviceOrientationObserver: DeviceOrientationObserver = new DeviceOrientationObserver()

// RequestAnimationFramer
export const requestAnimationFramer: RequestAnimationFramer = new RequestAnimationFramer()
