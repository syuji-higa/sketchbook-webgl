import Tweakpane from 'tweakpane'

declare global {
  interface Window {
    DEBUG: {
      tweakpane: Tweakpane
    }
  }
}

if (typeof window.DEBUG !== 'undefined') {
  throw new Error('namespace "DEBUG" is already exists.')
}

window.DEBUG = {
  tweakpane: new Tweakpane()
}
