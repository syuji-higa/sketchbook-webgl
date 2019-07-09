/**
 * depends on 'vanix'
 * depends on 'bowser'
 */

import Vanix from 'vanix'
import * as Bowser from 'bowser'

// bowser
const { browser, engine, os, platform } = Bowser.parse(navigator.userAgent)

type State = {
  browser: Object
  engine: Object
  os: Object
  platform: Object
  breakPoint: number[] // int[0,inf)
  windowWidth: number // int[0,inf)
  windowHeight: number // int[0,inf)
  windowWidthLastChangedHeight: number // int[0,inf)
  windowSizeType: string
}

const state: State = {
  browser,
  engine,
  os,
  platform,
  breakPoint: [768],
  windowWidth: 0,
  windowHeight: 0,
  windowWidthLastChangedHeight: 0,
  windowSizeType: ''
}

const mutations: { [key: string]: Function } = {
  setWindowWidth(state: State, data: number /* int[0,inf) */): void {
    state.windowWidth = data
  },
  setWindowHeight(state: State, data: number /* int[0,inf) */): void {
    state.windowHeight = data
  },
  setWindowWidthLastChangedHeight(
    state: State,
    data: number /* int[0,inf) */
  ): void {
    state.windowWidthLastChangedHeight = data
  },
  setWindowSizeType(state: State, data: string): void {
    state.windowSizeType = data
  }
}

const actions: { [key: string]: Function } = {}

const vanix: Vanix = new Vanix({ state, mutations, actions })

export const store = vanix.create()
