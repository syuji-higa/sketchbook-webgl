import MatIV from '../../utils-webgl/matrix'
import {
  useProgram,
  createVao,
  createTransformFeedbackVao,
  createEnableAttributeOptionsList,
  createEnableAttributeDataList,
  createProgramData,
  addInterleaveVertexAttr,
  createInterleaveData
} from '../../utils-webgl/util'
import { square } from '../../utils-webgl/model-2d'

// DEBUG
const { tweakpane }: any = 'DEBUG' in window ? window.DEBUG : {}

// import shader
const defaultVertexShader = require('./shaders/draw-arrays-default.vert')
const defaultFragmentShader = require('./shaders/draw-arrays-default.frag')
const transformFeedbackVertexShader = require('./shaders/draw-arrays-transform-feedback.vert')
const transformFeedbackFragmentShader = require('./shaders/draw-arrays-transform-feedback.frag')

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
  transformFeedback?: {
    prg: WebGLProgram
    attLocs: GLint[]
    attStrides: number[]
    uniLocs: { [key: string]: WebGLUniformLocation }
  }
  default?: {
    prg: WebGLProgram
    attLocs: GLint[]
    attStrides: number[]
    uniLocs: { [key: string]: WebGLUniformLocation }
  }
}

type TransfromFeedbackVao = {
  vao: WebGLVertexArrayObject
  transformFeedback: WebGLTransformFeedback
  bindBufferBaseVboList: Function
  unbindBufferBaseVboList: Function
}

type DrawArraysObjectData = {
  vao: WebGLVertexArrayObject
  transformFeedbackVao: TransfromFeedbackVao
  programData: ProgramData
  vertexLen: number
}

type ObjectData = {
  main?: DrawArraysObjectData
}

type Params = {
  speed: number /* [0,inf) */
}

class DrawArraysObject {
  private _dpr: number /* [0,inf) */ = 0
  private _gl: WebGL2RenderingContext | null = null
  private _matIV: MatIV | null = null
  private _state: State = {}
  private _data: ObjectData = {}
  private _params: Params = {
    speed: 1
  }

  constructor(dpr: number /* [0,inf) */) {
    this._dpr = dpr

    // DEBUG
    if (tweakpane) {
      tweakpane
        .addFolder({
          title: 'Draw Arrays Object'
        })
        .addInput(this._params, 'speed', { min: 0, max: 2 })
    }
  }

  create(gl: WebGL2RenderingContext, matIV: MatIV): DrawArraysObject {
    this._gl = gl
    this._matIV = matIV

    this._state = {
      isDrawing: false,
      startTime: 0
    }

    // object
    this._data.main = this._createDrawArraysObject()

    return this
  }

  destroy(): DrawArraysObject {
    this._gl = null
    this._matIV = null
    this._state = {}
    this._data = {}
    return this
  }

  start(): DrawArraysObject {
    if (this._state.isDrawing) {
      return
    }
    this._state.isDrawing = true
    this._state.startTime = Date.now()
    return this
  }

  stop(): DrawArraysObject {
    if (!this._state.isDrawing) {
      return
    }
    this._state.isDrawing = false
    return this
  }

  draw(time: number /* int[0,inf) */, mat: Mat, size: Size): DrawArraysObject {
    if (!this._state.isDrawing) {
      return
    }

    const _time: number /* [0,inf] */ = time - this._state.startTime

    // main object
    {
      const {
        vao,
        transformFeedbackVao,
        programData,
        vertexLen
      } = this._data.main

      // transform feedback
      {
        const { prg } = programData.transformFeedback
        const {
          vao,
          transformFeedback,
          bindBufferBaseVboList,
          unbindBufferBaseVboList
        } = transformFeedbackVao

        // use program
        useProgram(this._gl, prg)

        // bind transform feedback VAO & transform feedback
        this._gl.bindVertexArray(vao)
        this._gl.bindTransformFeedback(
          this._gl.TRANSFORM_FEEDBACK,
          transformFeedback
        )
        bindBufferBaseVboList()

        // begin transform feedback
        this._gl.enable(this._gl.RASTERIZER_DISCARD)
        this._gl.beginTransformFeedback(this._gl.POINTS)

        // drow transform feedback
        this._gl.drawArrays(this._gl.POINTS, 0, vertexLen)

        // end transform feedback
        this._gl.endTransformFeedback()
        this._gl.disable(this._gl.RASTERIZER_DISCARD)

        // unbind transform feedback VAO & transform feedback
        unbindBufferBaseVboList()
        this._gl.bindTransformFeedback(this._gl.TRANSFORM_FEEDBACK, null)
        this._gl.bindVertexArray(null)
      }

      // default
      {
        const { prg, uniLocs } = programData.default

        // use program
        useProgram(this._gl, prg)

        // matrix transform
        this._matIV.identity(mat.m) // init
        this._matIV.multiply(mat.tmp, mat.m, mat.mvp)

        // set uniform
        this._gl.uniformMatrix4fv(uniLocs['mvpMatrix'], false, mat.mvp)
        this._gl.uniform1f(uniLocs['time'], _time * 0.001 * this._params.speed)

        // bind VAO
        this._gl.bindVertexArray(vao)

        // draw
        this._gl.drawArrays(this._gl.POINTS, 0, vertexLen)

        // unbind VAO
        this._gl.bindVertexArray(null)
      }
    }

    return this
  }

  private _createDrawArraysObject(): DrawArraysObjectData {
    const _programData: ProgramData = {}
    const _attLocs: string[] = []
    const _attStrides: number[] /* int[0,inf) */ = []
    const _attDivisors: number[] /* int[0,inf) */ = []
    const _uniLocs: string[] = []
    const _vartexAtts: number[] = []
    const _transformFeedbackAttLocs = []
    const _transformFeedbackUniLocs: string[] = []
    let _vertexLen: number /* int[0,inf) */ = 0

    // set attributes
    _attLocs[0] = 'position'
    _attStrides[0] = 3
    _attDivisors[0] = 0

    // create interleave strides
    const _interleaveStrides = _attStrides.filter((val, index) => {
      return _attDivisors[index] === 0
    })

    // set uniform location
    _uniLocs.push('mvpMatrix', 'time')

    // default program
    _programData.default = createProgramData(
      this._gl,
      _attLocs,
      _uniLocs,
      _attStrides,
      defaultVertexShader,
      defaultFragmentShader
    )

    // set transform feedback attributes
    _transformFeedbackAttLocs[0] = 'vPosition'

    // transform feedback program
    _programData.transformFeedback = createProgramData(
      this._gl,
      _attLocs,
      _transformFeedbackUniLocs,
      _attStrides,
      transformFeedbackVertexShader,
      transformFeedbackFragmentShader,
      _transformFeedbackAttLocs,
      { bufferMode: this._gl.INTERLEAVED_ATTRIBS }
    )

    // create attribute
    {
      // create model
      const { position } = square(1, 1, 100, 100)
      const _len: number /* int[0,inf) */ = position.length / _attStrides[0]
      _vertexLen += _len

      // add vartex attribute for interleave
      addInterleaveVertexAttr(_vartexAtts, _interleaveStrides, _len, [position])
    }

    // create interleave data
    const { offsets, byte } = createInterleaveData(_interleaveStrides)

    // create enable attribute options
    const _enableAttributeOptionsList = createEnableAttributeOptionsList(
      _programData.default.attLocs,
      byte,
      offsets,
      _attDivisors
    )

    // create enable attribute data list
    const _enableAttributeDataList = createEnableAttributeDataList(
      _programData.default.attLocs,
      _attStrides,
      _interleaveStrides,
      _enableAttributeOptionsList
    )

    const { vao, vboList } = createVao(
      this._gl,
      [_vartexAtts],
      _enableAttributeDataList
    )

    const _transformFeedbackVao = createTransformFeedbackVao(
      this._gl,
      [_vartexAtts],
      _enableAttributeDataList,
      vboList,
      { draw: this._gl.DYNAMIC_COPY }
    )

    return {
      vao,
      transformFeedbackVao: _transformFeedbackVao,
      programData: _programData,
      vertexLen: _vertexLen
    }
  }
}

export { DrawArraysObject as default }
