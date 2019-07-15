import { requestAnimationFramer } from '../../modules'
import * as posenet from '@tensorflow-models/posenet'
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
const mainDefaultVertexShader = require('./shaders/main-default.vert')
const mainDefaultFragmentShader = require('./shaders/main-default.frag')

type PoseState = {
  eyes: number[]
}

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
  size: number /* [0,inf) */
  darkMode: boolean
}

class MainObject {
  private _net: posenet.PoseNet | null = null
  private _poseState: PoseState = {
    eyes: [0, 0, 0, 0]
  }
  private _dpr: number /* [0,inf) */ = 0
  private _gl: WebGLRenderingContext | null = null
  private _matIV: MatIV | null = null
  private _state: State = {}
  private _data: ObjectData = {}
  private _videos: HTMLVideoElement[] = []
  private _params: Params = {
    size: 1.5,
    darkMode: false
  }

  constructor(dpr: number /* [0,inf) */) {
    this._dpr = dpr

    // DEBUG
    if (tweakpane) {
      const _f = tweakpane.addFolder({
        title: 'Draw Elements Object'
      })
      _f.addInput(this._params, 'size', { min: 0, max: 5 })
      _f.addInput(this._params, 'darkMode')
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

  async load(): Promise<void> {
    this._net = await posenet.load()
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
    requestAnimationFramer.add(this, this._update.bind(this))
    return this
  }

  stop(): MainObject {
    if (!this._state.isDrawing) {
      return
    }
    this._state.isDrawing = false
    requestAnimationFramer.remove(this)
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
      this._gl.uniform1f(uniLocs['time'], _time * 0.001)
      this._gl.uniform2f(uniLocs['resolution'], size.w, size.h)
      const [eyeLX, eyeLY, eyeRX, eyeRY] = this._poseState.eyes
      this._gl.uniform4f(uniLocs['eyes'], eyeLX, eyeLY, eyeRX, eyeRY)
      this._gl.uniform1f(uniLocs['size'], this._params.size)
      this._gl.uniform1f(uniLocs['darkMode'], this._params.darkMode ? -1 : 1)

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
    const _uniLocsDefault: string[] = []
    const _vartexAtts: number[] = []
    const _indexes: number[] /* int[0,inf) */ = []
    let _vertexLen: number /* int[0,inf) */ = 0

    // set attributes
    _attLocs[0] = 'position'
    _attStrides[0] = 3
    _attLocs[1] = 'uv'
    _attStrides[1] = 2

    // set uniform default location
    _uniLocsDefault.push(
      'mvpMatrix',
      'time',
      'resolution',
      'eyes',
      'size',
      'darkMode',
      'texture'
    )

    // default program
    _programData.default = createProgramData(
      this._gl,
      _attLocs,
      _uniLocsDefault,
      _attStrides,
      mainDefaultVertexShader,
      mainDefaultFragmentShader
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

  async _update() {
    const { width, height } = this._videos[0]
    if (0 < width && 0 < height) {
      const pose: posenet.Pose = await this._net.estimateSinglePose(
        this._videos[0],
        {
          flipHorizontal: false
        }
      )
      const _leftEye: posenet.Keypoint = pose.keypoints.find(
        ({ part }) => part === 'leftEye'
      )
      const _rightEye: posenet.Keypoint = pose.keypoints.find(
        ({ part }) => part === 'rightEye'
      )
      const { x: leftX, y: leftY } = _leftEye.position
      const { x: rightX, y: rightY } = _rightEye.position
      const _min = Math.min(width, height)
      const _leftX = -(leftX * 2 - width) / _min
      const _leftY = -(leftY * 2 - height) / _min
      const _rightX = -(rightX * 2 - width) / _min
      const _rightY = -(rightY * 2 - height) / _min
      this._poseState.eyes = [_leftX, _leftY, _rightX, _rightY]
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
