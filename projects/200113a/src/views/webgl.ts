import { requestAnimationFramer } from '../modules'
import { maxRatio, minRatio } from '../models/ratio'
import MatIV from '../utils-webgl/matrix'
import { store } from '../store'

import DrawElementsObject from './webgl-objects/draw-elements-object'

type Matrix = {
  m: Float32Array
  v: Float32Array
  p: Float32Array
  tmp: Float32Array
  mvp: Float32Array
}

type State = {
  width: number // [0,inf)
  height: number // [0,inf)
  widthRatio: number // [0,inf)
  heightRatio: number // [0,inf)
  maxRatio: number // [1,inf)
  maxWidthRatio: number // [1,inf)
  maxHeightRatio: number // [1,inf)
  minRatio: number // [0,1]
  minWidthRatio: number // [0,1]
  minHeightRatio: number // [0,1]
  mouseX: number // [-1,1]
  mouseY: number // [-1,1]
}

type Options = {
  slefClassName?: string
}

type WebGLObject = {
  drawElements: DrawElementsObject
}

type StoreStateObject = {
  windowWidth: Function
  windowHeight: Function
}

class WebGL {
  private _isMobile: boolean = false
  private _slefClassName: string = ''
  private _dpr: number = 0 // [0,inf)
  private _mouseAccel: number = 0.1 // [0,inf)
  private _$wrap: Element | null
  private _$canvas: HTMLCanvasElement | null
  private _gl: WebGL2RenderingContext | null
  private _state: State | null
  private _matIV: MatIV | null
  private _matrix: Matrix | null
  private _objects: WebGLObject | null
  private _storeStateObject: StoreStateObject | null

  private static get _defaultOptions(): Options {
    return {
      slefClassName: 'js-webgl'
    }
  }

  constructor(options: Options = {}) {
    const { slefClassName } = { ...WebGL._defaultOptions, ...options }

    this._isMobile = !!store.state.platform.type.match(/^mobile$/)
    this._slefClassName = slefClassName
    this._dpr = 1 // devicePixelRatio or number
  }

  create(): WebGL {
    // init state
    this._state = {
      width: 0,
      height: 0,
      widthRatio: 0,
      heightRatio: 0,
      maxRatio: 0,
      maxWidthRatio: 0,
      maxHeightRatio: 0,
      minRatio: 0,
      minWidthRatio: 0,
      minHeightRatio: 0,
      mouseX: 0,
      mouseY: 0
    }

    // create matrix
    this._matIV = new MatIV()
    this._matrix = {
      m: this._matIV.identity(this._matIV.create()), // model
      v: this._matIV.identity(this._matIV.create()), // view
      p: this._matIV.identity(this._matIV.create()), // projection
      tmp: this._matIV.identity(this._matIV.create()), // template
      mvp: this._matIV.identity(this._matIV.create()) // projection * view * model
    }

    // create element
    this._$wrap = document.getElementsByClassName(this._slefClassName)[0]
    this._$canvas = document.createElement('canvas')
    this._$wrap.appendChild(this._$canvas)

    // get WebGL context
    const _webglOptions: Object = {
      // stencil: true
    }
    this._gl = this._$canvas.getContext(
      'webgl2',
      _webglOptions
    ) as WebGL2RenderingContext

    // set WebGL property
    this._gl.enable(this._gl.CULL_FACE) // culling
    this._gl.enable(this._gl.DEPTH_TEST) // depth test
    this._gl.depthFunc(this._gl.LEQUAL) // depth test
    this._gl.enable(this._gl.BLEND) // blend mode

    // create object
    this._objects = {
      drawElements: new DrawElementsObject(this._dpr)
    }
    for (const object of Object.values(this._objects)) {
      object.create(this._gl, this._matIV)
    }

    // observe store state
    this._storeStateObject = {
      windowWidth: (): void => {
        this.resize()
      },
      windowHeight: (): void => {
        this.resize()
      }
    }

    return this
  }

  destroy(): WebGL {
    for (const object of Object.values(this._objects)) {
      object.destroy()
    }

    this._state = null
    this._matIV = null
    this._matrix = null
    this._$wrap = null
    this._$canvas = null
    this._gl = null
    this._objects = null
    this._storeStateObject = null

    return this
  }

  on(): WebGL {
    store.observe(this._storeStateObject)
    return this
  }

  off(): WebGL {
    store.unobserve(this._storeStateObject)
    return this
  }

  start(): WebGL {
    requestAnimationFramer.add(this, this._render.bind(this))
    return this
  }

  stop(): WebGL {
    requestAnimationFramer.remove(this)
    return this
  }

  resize(): WebGL {
    const { width, height } = this._$wrap.getBoundingClientRect()

    const _width: number /* [0,inf) */ = width * this._dpr
    const _height: number /* [0,inf) */ = height * this._dpr
    const _maxRatio = maxRatio(width, height)
    const _minRatio = minRatio(width, height)

    // set size status
    this._state.width = _width
    this._state.height = _height
    this._state.widthRatio = _width / _height
    this._state.heightRatio = _height / _width
    this._state.maxRatio = _maxRatio.raito
    this._state.maxWidthRatio = _maxRatio.width
    this._state.maxHeightRatio = _maxRatio.height
    this._state.minRatio = _minRatio.raito
    this._state.minWidthRatio = _minRatio.width
    this._state.minHeightRatio = _minRatio.height

    // set canvas size
    this._$canvas.width = _width
    this._$canvas.height = _height
    this._$canvas.style.width = `${width}px`
    this._$canvas.style.height = `${height}px`

    // set gebGL viewport
    this._gl.viewport(0, 0, _width, _height)

    return this
  }

  async loadTextureObject(
    id: string,
    src: string,
    index: number /* int[0,inf) */
  ): Promise<boolean> {
    const _object = this._objects[id]
    const _isSuccess = await _object.loadTexture(src, index)
    return _isSuccess
  }

  startObject(id: string): WebGL {
    const _object = this._objects[id]
    _object.start()
    return this
  }

  stopObject(id: string): WebGL {
    const _object = this._objects[id]
    _object.stop()
    return this
  }

  private _render() {
    // calculation mouse
    this._calcMouse()

    // clear canvas
    this._gl.clearColor(0, 0, 0, 1)
    this._gl.clear(this._gl.COLOR_BUFFER_BIT)

    // clear blend mode
    this._gl.blendFunc(this._gl.ONE_MINUS_DST_COLOR, this._gl.ONE)

    const { width, height } = this._state
    const { v, p, tmp } = this._matrix

    // init view
    this._matIV.lookAt(
      [0, 0, 1], // camera position
      [0, 0, 0], // camera center
      [0, 1, 0], // camera up
      v
    )
    this._matIV.perspective(
      90, // fovy
      width / height, // aspect
      0.1, // near
      100, // far
      p
    )
    this._matIV.multiply(p, v, tmp)

    // draw object
    for (const object of Object.values(this._objects)) {
      object.draw(
        Date.now(),
        this._matrix,
        // size
        {
          w: width,
          h: height,
          wR: this._state.widthRatio,
          hR: this._state.heightRatio,
          maxR: this._state.maxRatio,
          maxWR: this._state.maxWidthRatio,
          maxHR: this._state.maxHeightRatio,
          minR: this._state.minRatio,
          minWR: this._state.minWidthRatio,
          minHR: this._state.minHeightRatio
        },
        // mouse
        {
          x: this._state.mouseX,
          y: this._state.mouseY
        }
      )
    }
  }

  private _calcMouse() {
    let _x: number = 0
    let _y: number = 0
    if (this._isMobile) {
      const { beta, gamma } = store.state
      _x = gamma
      _y = beta
    } else {
      const { mouseX, mouseY } = store.state
      _x = mouseX
      _y = mouseY
    }

    const { mouseX, mouseY } = this._state
    this._state.mouseX += (_x - mouseX) * this._mouseAccel
    this._state.mouseY += (_y - mouseY) * this._mouseAccel
  }
}

export { WebGL as default }
