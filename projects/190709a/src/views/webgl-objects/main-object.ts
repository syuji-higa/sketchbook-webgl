import MatIV from '../../utils-webgl/matrix'
import {
  useProgram,
  createVbo,
  createIbo,
  createTexture,
  enableAttribute,
  createProgramData,
  addInterleaveVertexAttr,
  createInterleaveData
} from '../../utils-webgl/util'
import { square } from '../../utils-webgl/model-2d'

// DEBUG
const { tweakpane }: any = 'DEBUG' in window ? window.DEBUG : {}

// import shader
const mainVertexShader = require('./shaders/main-default.vert')
const mainFragmentShader = require('./shaders/main-default.frag')

type State = {
  isDrawing?: boolean
  startTime?: number /* [0,inf) */
}

type Mat = {
  m: Float32Array /* model */
  v: Float32Array /* view */
  p: Float32Array /* projection */
  tmp: Float32Array /* template */
  mvp: Float32Array /* projection * view * model */
}

type Size = {
  w: number /* [0,inf) width */
  h: number /* [0,inf) height */
  wR: number /* [0,inf) widthRatio */
  hR: number /* [0,inf) heightRatio */
  maxR: number /* [1,inf) maxRatio */
  maxWR: number /* [1,inf) maxWidthRatio */
  maxHR: number /* [1,inf) maxHeightRatio */
  minR: number /* [0,1] minRatio */
  minWR: number /* [0,1] minWidthRatio */
  minHR: number /* [0,1] minHeightRatio */
}

type ProgramData = {
  default?: {
    prg: WebGLProgram
    attLocs: GLint[]
    attStrides: number[]
    uniLocs: { [key: string]: WebGLUniformLocation }
  }
}

type MainObjectData = {
  vbo: WebGLBuffer
  ibo: WebGLBuffer
  programData: ProgramData
  offsets: number[]
  byte: number
  indexLen: number
}

type ObjectData = {
  main?: MainObjectData
}

type Texture = {
  texture: WebGLTexture
  naturalWidth: number /* [0,inf) */
  naturalHeight: number /* [0,inf) */
}

type Params = {
  power: number /* [0,inf) */
  wave: number /* [0,inf) */
  speed: number /* [0,inf) */
}

class MainObject {
  private _dpr: number /* [0,inf) */ = 0
  private _gl: WebGLRenderingContext | null = null
  private _matIV: MatIV | null = null
  private _state: State = {}
  private _data: ObjectData = {}
  private _videos: HTMLVideoElement[] = []
  private _params: Params = {
    power: 0.5,
    wave: 1,
    speed: 1
  }

  constructor(dpr: number /* [0,inf) */) {
    this._dpr = dpr

    // DEBUG
    if (tweakpane) {
      const _f = tweakpane.addFolder({
        title: 'Draw Elements Object'
      })
      _f.addInput(this._params, 'power', { min: 0, max: 1 })
      _f.addInput(this._params, 'wave', { min: 0, max: 5 })
      _f.addInput(this._params, 'speed', { min: 0, max: 5 })
    }
  }

  create(gl: WebGLRenderingContext, matIV: MatIV): MainObject {
    this._gl = gl
    this._matIV = matIV

    this._state = {
      isDrawing: false,
      startTime: 0
    }

    // object
    this._data.main = this._createMainObject()

    return this
  }

  destroy(): MainObject {
    this._gl = null
    this._matIV = null
    this._state = {}
    this._data = {}
    return this
  }

  setVideo($video: HTMLVideoElement): MainObject {
    this._videos = [$video]
    return this
  }

  start(): MainObject {
    if (this._state.isDrawing) {
      return
    }
    this._state.isDrawing = true
    this._state.startTime = Date.now()
    return this
  }

  stop(): MainObject {
    if (!this._state.isDrawing) {
      return
    }
    this._state.isDrawing = false
    return this
  }

  draw(time: number /* int[0,inf) */, mat: Mat, size: Size): MainObject {
    if (!this._state.isDrawing) {
      return
    }

    const _time: number /* [0,inf] */ = time - this._state.startTime
    const { texture, naturalWidth, naturalHeight } = this._updateTexture()
    const _textureRatio = naturalWidth / naturalHeight

    // main object
    {
      const { vbo, ibo, programData, offsets, byte, indexLen } = this._data.main
      const { prg, attLocs, attStrides, uniLocs } = programData.default

      // use program
      useProgram(this._gl, prg)
      this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, ibo)
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vbo)
      for (let i = 0; attLocs.length > i; i++) {
        enableAttribute(this._gl, attLocs[i], attStrides[i], {
          stride: byte,
          offset: offsets[i]
        })
      }
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null)

      // matrix transform
      this._matIV.identity(mat.m) // init
      this._matIV.multiply(mat.tmp, mat.m, mat.mvp)
      this._matIV.scale(mat.m, [_textureRatio, 1, 0], mat.m) // contain
      this._matIV.multiply(mat.tmp, mat.m, mat.mvp)

      // set uniform
      this._gl.uniformMatrix4fv(uniLocs['mvpMatrix'], false, mat.mvp)
      this._gl.uniform1f(uniLocs['time'], _time * 0.001 * this._params.speed)
      this._gl.uniform2f(uniLocs['resolution'], size.w, size.h)
      this._gl.uniform1f(uniLocs['power'], this._params.power)
      this._gl.uniform1f(uniLocs['wave'], this._params.wave)

      // set texture uniform
      this._gl.activeTexture(this._gl.TEXTURE0)
      this._gl.bindTexture(this._gl.TEXTURE_2D, texture)
      this._gl.uniform1i(uniLocs['texture'], 0)

      // draw
      this._gl.drawElements(
        this._gl.TRIANGLES,
        indexLen,
        this._gl.UNSIGNED_SHORT,
        0
      )
    }

    return this
  }

  private _createMainObject(): MainObjectData {
    const _programData: ProgramData = {}
    const _attLocs: string[] = []
    const _attStrides: number[] /* int[0,inf) */ = []
    const _uniLocs: string[] = []
    const _vartexAtts: number[] = []
    const _indexes: number[] /* int[0,inf) */ = []
    let _vertexLen: number /* int[0,inf) */ = 0

    // set attributes
    _attLocs[0] = 'position'
    _attStrides[0] = 3
    _attLocs[1] = 'uv'
    _attStrides[1] = 2

    // set uniform location
    _uniLocs.push('mvpMatrix', 'time', 'resolution', 'texture', 'power', 'wave')

    // default program
    _programData.default = createProgramData(
      this._gl,
      _attLocs,
      _uniLocs,
      _attStrides,
      mainVertexShader,
      mainFragmentShader
    )

    // create attribute
    {
      // create model
      const { position, uv, index } = square(1, 1, 1, 1, {
        offsetIndex: _vertexLen
      })
      const _len: number /* int[0,inf) */ = position.length / 3

      // add vartex attribute for interleave
      addInterleaveVertexAttr(_vartexAtts, _attStrides, _len, [position, uv])

      // set & update index
      _indexes.push(...index)
      _vertexLen += _len
    }

    // create interleave data
    const { offsets, byte } = createInterleaveData(_attStrides)

    return {
      vbo: createVbo(this._gl, new Float32Array(_vartexAtts)),
      ibo: createIbo(this._gl, _indexes),
      programData: _programData,
      offsets: offsets,
      byte: byte,
      indexLen: _indexes.length
    }
  }

  private _updateTexture(): Texture {
    const { texture, naturalWidth, naturalHeight } = createTexture(
      this._gl,
      this._videos[0],
      { dpr: this._dpr }
    )

    return { texture, naturalWidth, naturalHeight }
  }
}

export { MainObject as default }
