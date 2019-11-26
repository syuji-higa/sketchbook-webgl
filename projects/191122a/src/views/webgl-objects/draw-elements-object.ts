import { loadImage } from '../../utils/load'
import MatIV from '../../utils-webgl/matrix'
import {
  useProgram,
  createVao,
  createEnableAttributeOptionsList,
  createEnableAttributeDataList,
  createTexture,
  createProgramData,
  addInterleaveVertexAttr,
  createInterleaveData
} from '../../utils-webgl/util'
import { square } from '../../utils-webgl/model-2d'

// DEBUG
const { tweakpane }: any = 'DEBUG' in window ? window.DEBUG : {}

// import shader
const defaultVertexShader = require('./shaders/draw-elements-default.vert')
const defaultFragmentShader = require('./shaders/draw-elements-default.frag')

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

type DrawElementsObjectData = {
  vao: WebGLVertexArrayObject
  programData: ProgramData
  indexLen: number
  instanceLen: number
}

type ObjectData = {
  main?: DrawElementsObjectData
}

type Texture = {
  texture: WebGLTexture
  naturalWidth: number /* [0,inf) */
  naturalHeight: number /* [0,inf) */
}

type Params = {
  speed: number /* [0,inf) */
}

class DrawElementsObject {
  private _dpr: number /* [0,inf) */ = 0
  private _gl: WebGL2RenderingContext | null = null
  private _matIV: MatIV | null = null
  private _state: State = {}
  private _data: ObjectData = {}
  private _textures: Texture[] = []
  private _params: Params = {
    speed: 1
  }

  constructor(dpr: number /* [0,inf) */) {
    this._dpr = dpr

    // DEBUG
    if (tweakpane) {
      tweakpane
        .addFolder({
          title: 'Draw Elements Object'
        })
        .addInput(this._params, 'speed', { min: 0, max: 2 })
    }
  }

  create(gl: WebGL2RenderingContext, matIV: MatIV): DrawElementsObject {
    this._gl = gl
    this._matIV = matIV

    this._state = {
      isDrawing: false,
      startTime: 0
    }

    // object
    this._data.main = this._createDrawElementsObject()

    return this
  }

  destroy(): DrawElementsObject {
    this._gl = null
    this._matIV = null
    this._state = {}
    this._data = {}
    return this
  }

  async loadTexture(
    path: string,
    index: number /* int[0,inf) */
  ): Promise<boolean /* isSuccess */> {
    const { img, isSuccess } = await loadImage(path)

    if (!isSuccess) {
      return false
    }

    const { texture, naturalWidth, naturalHeight } = createTexture(
      this._gl,
      img,
      { dpr: this._dpr }
    )

    this._textures[index] = { texture, naturalWidth, naturalHeight }

    return true
  }

  start(): DrawElementsObject {
    if (this._state.isDrawing) {
      return
    }
    this._state.isDrawing = true
    this._state.startTime = Date.now()
    return this
  }

  stop(): DrawElementsObject {
    if (!this._state.isDrawing) {
      return
    }
    this._state.isDrawing = false
    return this
  }

  draw(
    time: number /* int[0,inf) */,
    mat: Mat,
    size: Size
  ): DrawElementsObject {
    if (!this._state.isDrawing) {
      return
    }

    const _time: number /* [0,inf] */ = time - this._state.startTime

    // main object
    {
      const { vao, programData, indexLen, instanceLen } = this._data.main
      const { prg, uniLocs } = programData.default

      // use program
      useProgram(this._gl, prg)

      // matrix transform
      this._matIV.identity(mat.m) // init
      this._matIV.multiply(mat.tmp, mat.m, mat.mvp)
      this._matIV.scale(mat.m, [size.maxR, size.maxR, 1], mat.m) // cover
      this._matIV.multiply(mat.tmp, mat.m, mat.mvp)

      // set uniform
      this._gl.uniformMatrix4fv(uniLocs['mvpMatrix'], false, mat.mvp)
      this._gl.uniform1f(uniLocs['time'], _time * 0.001 * this._params.speed)
      this._gl.uniform2f(uniLocs['resolution'], size.w, size.h)

      // set texture uniform
      this._gl.activeTexture(this._gl.TEXTURE0)
      this._gl.bindTexture(this._gl.TEXTURE_2D, this._textures[0].texture)
      this._gl.uniform1i(uniLocs['texture2dSampler'], 0)

      // bind VAO
      this._gl.bindVertexArray(vao)

      // draw
      this._gl.drawElementsInstanced(
        this._gl.TRIANGLES,
        indexLen,
        this._gl.UNSIGNED_SHORT,
        0,
        instanceLen
      )

      // unbind VAO
      this._gl.bindVertexArray(null)
    }

    return this
  }

  private _createDrawElementsObject(): DrawElementsObjectData {
    const _programData: ProgramData = {}
    const _attLocs: string[] = []
    const _attStrides: number[] /* int[0,inf) */ = []
    const _attDivisors: number[] /* int[0,inf) */ = []
    const _uniLocs: string[] = []
    const _vartexAtts: number[] = []
    const _indexes: number[] /* int[0,inf) */ = []
    let _vertexLen: number /* int[0,inf) */ = 0
    let _instanceLen: number /* int[0,inf) */ = 0

    // set attributes
    _attLocs[0] = 'position'
    _attStrides[0] = 3
    _attDivisors[0] = 0
    _attLocs[1] = 'uv'
    _attStrides[1] = 2
    _attDivisors[1] = 0
    _attLocs[2] = 'offset'
    _attStrides[2] = 3
    _attDivisors[2] = 1

    // create interleave strides
    const _interleaveStrides = _attStrides.filter((val, index) => {
      return _attDivisors[index] === 0
    })

    // create attribute length list
    const _attrLenList = []
    for (let i = 0; _attLocs.length - _interleaveStrides.length + 1 > i; i++) {
      i === 0
        ? _attrLenList.push(_interleaveStrides.length)
        : _attrLenList.push(1)
    }

    // set uniform location
    _uniLocs.push('mvpMatrix', 'time', 'resolution', 'texture2dSampler')

    // default program
    _programData.default = createProgramData(
      this._gl,
      _attLocs,
      _uniLocs,
      _attStrides,
      defaultVertexShader,
      defaultFragmentShader
    )

    // create attribute
    {
      // create model
      const { position, uv, index } = square(0.15, 0.15, 1, 1, {
        offsetIndex: _vertexLen
      })
      const _len: number /* int[0,inf) */ = position.length / _attStrides[0]
      _indexes.push(...index)
      _vertexLen += _len

      // add vartex attribute for interleave
      addInterleaveVertexAttr(_vartexAtts, _interleaveStrides, _len, [
        position,
        uv
      ])
    }

    // create interleave data
    const { offsets, byte } = createInterleaveData(_interleaveStrides)

    // create instance attribute offset
    const _instanceAttrOffset: number[] = []
    {
      for (let y = -1; y <= 1; y++) {
        for (let x = -1; x <= 1; x++) {
          _instanceAttrOffset.push(x, y, 0)
        }
      }
      _instanceLen += _instanceAttrOffset.length / _attStrides[2]
    }

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

    return {
      vao: createVao(
        this._gl,
        [_vartexAtts, _instanceAttrOffset],
        _enableAttributeDataList,
        { indexes: _indexes }
      ),
      programData: _programData,
      indexLen: _indexes.length,
      instanceLen: _instanceLen
    }
  }
}

export { DrawElementsObject as default }
