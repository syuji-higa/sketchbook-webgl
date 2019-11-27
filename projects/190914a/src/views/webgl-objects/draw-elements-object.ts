import { load } from '@loaders.gl/core'
import { GLTFLoader, postProcessGLTF } from '@loaders.gl/gltf'
import MatIV from '../../utils-webgl/matrix'
import {
  useProgram,
  createVbo,
  createIbo,
  enableAttribute,
  createProgramData,
  addInterleaveVertexAttr,
  createInterleaveData
} from '../../utils-webgl/util'

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
  inv: Float32Array /* mvp inverse */
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
  vbo: WebGLBuffer
  ibo: WebGLBuffer
  programData: ProgramData
  offsets: number[]
  byte: number
  indexLen: number
}

type ObjectData = {
  main?: DrawElementsObjectData
}

type Params = {
  speed: number /* [0,inf) */
}

class DrawElementsObject {
  private _dpr: number /* [0,inf) */ = 0
  private _gl: WebGLRenderingContext | null = null
  private _matIV: MatIV | null = null
  private _state: State = {}
  private _data: ObjectData = {}
  private _modelData: any = {}
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

  create(gl: WebGLRenderingContext, matIV: MatIV): DrawElementsObject {
    this._gl = gl
    this._matIV = matIV

    this._state = {
      isDrawing: false,
      startTime: 0
    }

    return this
  }

  destroy(): DrawElementsObject {
    this._gl = null
    this._matIV = null
    this._state = {}
    this._data = {}
    this._modelData = {}
    return this
  }

  async loadModel(uri: string, path: string): Promise<boolean /* isSuccess */> {
    try {
      const gltfData = await load(path, GLTFLoader, {
        uri,
        gltf: {
          parserVersion: 2
        }
      })
      console.log(gltfData)
      const processedGLTF = postProcessGLTF(gltfData)
      this._modelData = processedGLTF
    } catch (err) {
      console.error(err)
      return false
    }
    return true
  }

  createObject(): DrawElementsObject {
    this._data.main = this._createDrawElementsObject()
    return this
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
      this._matIV.rotate(
        mat.m,
        time * 0.001 * this._params.speed,
        [1, 0, 0],
        mat.m
      )
      this._matIV.rotate(
        mat.m,
        time * 0.001 * this._params.speed,
        [0, 1, 0],
        mat.m
      )
      this._matIV.multiply(mat.tmp, mat.m, mat.mvp)

      // matrix inverse
      this._matIV.inverse(mat.m, mat.inv)

      // set uniform
      this._gl.uniformMatrix4fv(uniLocs['mvpMatrix'], false, mat.mvp)
      this._gl.uniformMatrix4fv(uniLocs['invMatrix'], false, mat.inv)
      this._gl.uniform1f(uniLocs['time'], _time * 0.001 * this._params.speed)
      this._gl.uniform2f(uniLocs['resolution'], size.w, size.h)
      this._gl.uniform3fv(uniLocs['lightDirection'], [-1, 1, 1])

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

  private _createDrawElementsObject(): DrawElementsObjectData {
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
    _attLocs[1] = 'normal'
    _attStrides[1] = 3

    // set uniform location
    _uniLocs.push(
      'mvpMatrix',
      'invMatrix',
      'time',
      'resolution',
      'lightDirection'
    )

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
      const {
        attributes,
        indices,
        material
      } = this._modelData.meshes[0].primitives[0]
      const { POSITION, NORMAL, TEXCOORD_0 } = attributes

      const _positionData = POSITION.bufferView
      const _normalData = NORMAL.bufferView
      const _indexData = indices.bufferView

      const _position: Float32Array = new Float32Array(
        _positionData.data.buffer
      )
      const _normal: Float32Array = new Float32Array(_normalData.data.buffer)
      const _index: Uint8Array = _indexData.data

      console.log(this._modelData)
      console.log(this._modelData.buffers)
      console.log(_position)
      console.log(_index)

      const _len: number /* int[0,inf) */ = _position.length / 3

      // add vartex attribute for interleave
      addInterleaveVertexAttr(_vartexAtts, _attStrides, _len, [
        Array.from(_position),
        Array.from(_normal)
      ])

      // set & update index
      _indexes.push(...Array.from(_index))
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
}

export { DrawElementsObject as default }
