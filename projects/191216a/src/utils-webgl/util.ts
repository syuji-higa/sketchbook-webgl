/**
 * Features inspired by https://wgld.org/
 */

import { toTowPower } from '../models/math'

export const createShader = (
  gl: WebGL2RenderingContext,
  type: 'vertex' | 'fragment',
  shader: string
): WebGLShader => {
  let _shader: WebGLShader | null = null
  switch (type) {
    case 'vertex': {
      _shader = gl.createShader(gl.VERTEX_SHADER)
      break
    }
    case 'fragment': {
      _shader = gl.createShader(gl.FRAGMENT_SHADER)
      break
    }
  }

  gl.shaderSource(_shader, shader)
  gl.compileShader(_shader)

  if (gl.getShaderParameter(_shader, gl.COMPILE_STATUS)) {
    return _shader
  } else {
    throw new Error(gl.getShaderInfoLog(_shader))
  }
}

type CreateProgramOptions = {
  bufferMode?: GLenum
}

export const createProgram = (
  gl: WebGL2RenderingContext,
  vs: WebGLShader,
  fs: WebGLShader,
  varyings: string[] = [],
  options: CreateProgramOptions = {}
): WebGLProgram => {
  const { bufferMode } = {
    bufferMode: gl.SEPARATE_ATTRIBS,
    ...options
  }

  const _program: WebGLProgram = gl.createProgram()

  gl.attachShader(_program, vs)
  gl.attachShader(_program, fs)

  if (varyings.length) {
    gl.transformFeedbackVaryings(_program, varyings, bufferMode)
  }

  gl.linkProgram(_program)

  return _program
}

export const useProgram = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram
) => {
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.useProgram(program)
    return program
  } else {
    throw new Error(gl.getProgramInfoLog(program))
  }
}

type EnableAttributeOptions = {
  type?: GLenum
  normalized?: GLboolean
  stride?: GLsizei
  offset?: GLintptr
  divisor?: GLuint
}

export const enableAttribute = (
  gl: WebGL2RenderingContext,
  index: GLuint,
  size: GLint,
  options: EnableAttributeOptions = {}
) => {
  const { type, normalized, stride, offset, divisor } = {
    type: gl.FLOAT,
    normalized: false,
    stride: 0,
    offset: 0,
    divisor: 0,
    ...options
  }

  gl.enableVertexAttribArray(index)
  gl.vertexAttribPointer(index, size, type, normalized, stride, offset)

  if (divisor) {
    gl.vertexAttribDivisor(index, divisor)
  }
}

export const createEnableAttributeOptionsList = (
  attLocs: GLuint[],
  byte: GLsizei,
  offsets: GLintptr[],
  divisors: GLuint[]
): EnableAttributeOptions[] => {
  const _optionsList = []
  for (let i = 0; attLocs.length > i; i++) {
    const _options: EnableAttributeOptions = divisors[i]
      ? { divisor: divisors[i] }
      : { stride: byte, offset: offsets[i] }
    _optionsList.push(_options)
  }
  return _optionsList
}

type EnableAttributeData = [GLuint, GLint, EnableAttributeOptions]

export const createEnableAttributeDataList = (
  attLocs: GLuint[],
  attStrides: GLsizei[],
  interleaveStrides: GLsizei[],
  enableAttributeOptionsList: EnableAttributeOptions[]
): EnableAttributeData[][] => {
  const _attrLenList = []

  for (let i = 0; attLocs.length - interleaveStrides.length + 1 > i; i++) {
    i === 0 ? _attrLenList.push(interleaveStrides.length) : _attrLenList.push(1)
  }

  return _attrLenList.map((val, index) => {
    const _dataList = []
    for (let i = 0; val > i; i++) {
      const _count = index === 0 ? i : _attrLenList[0] + index - 1
      _dataList.push([
        attLocs[_count],
        attStrides[_count],
        enableAttributeOptionsList[_count]
      ])
    }
    return _dataList
  })
}

export const createVbo = (
  gl: WebGL2RenderingContext,
  data: number[],
  draw: GLenum | null = null
): WebGLBuffer => {
  const _vbo: WebGLBuffer = gl.createBuffer()
  const _draw: number = draw || gl.STATIC_DRAW

  gl.bindBuffer(gl.ARRAY_BUFFER, _vbo)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), _draw)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  return _vbo
}

export const createIbo = (
  gl: WebGL2RenderingContext,
  data: number[]
): WebGLBuffer => {
  const _ibo: WebGLBuffer = gl.createBuffer()

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _ibo)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

  return _ibo
}

type CreateVao = {
  vao: WebGLVertexArrayObject
  vboList: WebGLBuffer[]
}

type CreateVaoOptions = {
  draw?: GLenum | null
  indexes?: number[] | null
}

export const createVao = (
  gl: WebGL2RenderingContext,
  dataList: number[][],
  enableAttributeDataList: EnableAttributeData[][],
  options: CreateVaoOptions = {}
): CreateVao => {
  const { draw, indexes } = {
    draw: gl.STATIC_DRAW,
    indexes: null,
    ...options
  }

  const _vao: WebGLVertexArrayObject = gl.createVertexArray()
  const _vboList = []

  gl.bindVertexArray(_vao)

  for (let i = 0; dataList.length > i; i++) {
    const _vbo: WebGLBuffer = gl.createBuffer()
    _vboList[i] = _vbo
    gl.bindBuffer(gl.ARRAY_BUFFER, _vbo)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dataList[i]), draw)

    for (const data of enableAttributeDataList[i]) {
      enableAttribute(gl, ...data)
    }
  }

  if (indexes) {
    const _ibo: WebGLBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _ibo)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(indexes), draw)
  }

  gl.bindVertexArray(null)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  if (indexes) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
  }

  return {
    vao: _vao,
    vboList: _vboList
  }
}

export const createTransformFeedbackVao = (
  gl: WebGL2RenderingContext,
  dataList: number[][],
  enableAttributeDataList: EnableAttributeData[][],
  vboList: WebGLBuffer[],
  options: CreateVaoOptions = {}
): CreateVao => {
  const { draw } = {
    draw: gl.STATIC_DRAW,
    ...options
  }

  const _vao: WebGLVertexArrayObject = gl.createVertexArray()

  gl.bindVertexArray(_vao)

  for (let i = 0; dataList.length > i; i++) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vboList[i])
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dataList[i]), draw)

    for (const data of enableAttributeDataList[i]) {
      enableAttribute(gl, ...data)
    }
  }

  gl.bindVertexArray(null)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  return {
    vao: _vao,
    vboList: vboList
  }
}

export const bindBufferBaseVboList = (
  gl: WebGL2RenderingContext,
  vboList: WebGLBuffer[]
): void => {
  for (let i = 0; vboList.length > i; i++) {
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, i, vboList[i])
  }
}

export const unbindBufferBaseVboList = (
  gl: WebGL2RenderingContext,
  vboList: WebGLBuffer[]
): void => {
  for (let i = 0; vboList.length > i; i++) {
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, i, null)
  }
}

type CreateTextureOptions = {
  dpr?: number
  maxSize?: number /* int */
  flipY?: boolean
  minFilter?: string
  magFilter?: string
  wrapS?: string
  wrapT?: string
}

type Texture = {
  texture: WebGLTexture
  naturalWidth: number
  naturalHeight: number
}

export const createTexture = (
  gl: WebGL2RenderingContext,
  $el: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
  options: CreateTextureOptions
): Texture => {
  const { dpr, maxSize, flipY, minFilter, magFilter, wrapS, wrapT } = {
    dpr: 1,
    maxSize: null,
    flipY: false,
    minFilter: 'LINEAR',
    magFilter: 'LINEAR',
    wrapS: 'CLAMP_TO_EDGE',
    wrapT: 'CLAMP_TO_EDGE',
    ...options
  }

  const _w: number /* [0,inf) */ =
    'naturalWidth' in $el ? $el.naturalWidth : $el.clientWidth
  const _h: number /* [0,inf) */ =
    'naturalHeight' in $el ? $el.naturalHeight : $el.clientHeight
  const _canvasW: number /* [0,inf) */ = _w * dpr
  const _canvasH: number /* [0,inf) */ = _h * dpr
  const _maxTexSize: number /* [0,inf) */ = gl.getParameter(gl.MAX_TEXTURE_SIZE)
  const _maxSize: number /* [0,inf) */ = maxSize
    ? Math.min(maxSize * dpr, _maxTexSize)
    : _maxTexSize
  const _size: number /* int[0,inf) */ = toTowPower(
    Math.min(Math.max(_canvasW, _canvasH), _maxSize)
  )
  if (_canvasW !== _canvasH || _canvasW !== _size) {
    const _$canvas: HTMLCanvasElement = document.createElement('canvas')
    _$canvas.height = _$canvas.width = _size
    _$canvas.getContext('2d').drawImage($el, 0, 0, _w, _h, 0, 0, _size, _size)
    $el = _$canvas
  }

  const _tex: WebGLTexture = gl.createTexture()

  gl.bindTexture(gl.TEXTURE_2D, _tex)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, $el)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[minFilter])
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[magFilter])
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[wrapS])
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[wrapT])
  gl.generateMipmap(gl.TEXTURE_2D)
  gl.bindTexture(gl.TEXTURE_2D, null)

  return {
    texture: _tex,
    naturalWidth: _w,
    naturalHeight: _h
  }
}

type CreateFramebufferOptions = {
  minFilter: GLint
  magFilter: GLint
  wrapS: GLint
  wrapT: GLint
}

type Framebuffer = {
  d: WebGLRenderbuffer
  f: WebGLFramebuffer
  t: WebGLTexture
}

export const createFramebuffer = (
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
  options: CreateFramebufferOptions
): Framebuffer => {
  const { minFilter, magFilter, wrapS, wrapT } = {
    minFilter: 'LINEAR',
    magFilter: 'LINEAR',
    wrapS: 'CLAMP_TO_EDGE',
    wrapT: 'CLAMP_TO_EDGE',
    ...options
  }

  const _frameBuffer: WebGLFramebuffer = gl.createFramebuffer()

  gl.bindFramebuffer(gl.FRAMEBUFFER, _frameBuffer)

  const _depthRenderBuffer: WebGLRenderbuffer = gl.createRenderbuffer()

  gl.bindRenderbuffer(gl.RENDERBUFFER, _depthRenderBuffer)
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
  gl.framebufferRenderbuffer(
    gl.FRAMEBUFFER,
    gl.DEPTH_ATTACHMENT,
    gl.RENDERBUFFER,
    _depthRenderBuffer
  )

  const _fTexture: WebGLTexture = gl.createTexture()

  gl.bindTexture(gl.TEXTURE_2D, _fTexture)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null
  )
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[minFilter])
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[magFilter])
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[wrapS])
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[wrapT])
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    _fTexture,
    0
  )
  gl.bindTexture(gl.TEXTURE_2D, null)
  gl.bindRenderbuffer(gl.RENDERBUFFER, null)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)

  return {
    f: _frameBuffer,
    d: _depthRenderBuffer,
    t: _fTexture
  }
}

type ProgramData = {
  prg: WebGLProgram
  attLocs: GLint[]
  attStrides: number[]
  uniLocs: { [key: string]: WebGLUniformLocation }
}

export const createProgramData = (
  gl: WebGL2RenderingContext,
  attLocs: string[],
  uniLocs: string[],
  attStrides: number[],
  vShader: string,
  fShader: string,
  varyings: string[] = [],
  createProgramOptions: CreateProgramOptions = {}
): ProgramData => {
  // create program
  const _vs: WebGLShader = createShader(gl, 'vertex', vShader)
  const _fs: WebGLShader = createShader(gl, 'fragment', fShader)
  const _prg: WebGLProgram = createProgram(
    gl,
    _vs,
    _fs,
    varyings,
    createProgramOptions
  )

  // set attribute location
  const _attLocs: GLint[] = attLocs.map((item) => {
    return gl.getAttribLocation(_prg, item)
  })

  // set uniform location
  const _uniLocs: { [key: string]: WebGLUniformLocation } = uniLocs.reduce(
    (memo, val) => {
      memo[val] = gl.getUniformLocation(_prg, val)
      return memo
    },
    {}
  )

  return {
    prg: _prg,
    attLocs: _attLocs,
    attStrides: attStrides,
    uniLocs: _uniLocs
  }
}

export const addInterleaveVertexAttr = (
  vartexAtts: number[],
  attStrides: GLint[],
  vartexLen: number /* int[0,inf) */,
  data: number[][]
) => {
  const _offset: number = vartexAtts.length
  const _attLength: number /* int[0,inf) */ = attStrides.reduce((p, c) => p + c)

  for (let i: number /* int[0,inf] */ = 0; vartexLen > i; i++) {
    const _attTotalCount: number /* int[0,inf) */ = _offset + _attLength * i
    let _itemCount: number /* int[0,inf) */ = 0

    for (let j: number /* int[0,inf] */ = 0; attStrides.length > j; j++) {
      const _data: number[] = data[j]
      const _att: number /* int[0,inf) */ = attStrides[j]

      for (let k: number /* int[0,inf] */ = 0; _att > k; k++) {
        vartexAtts[_attTotalCount + _itemCount] = _data[_att * i + k]
        _itemCount++
      }
    }
  }
}

type InterleaveData = {
  offsets: GLintptr[] /* int[0,inf) */
  byte: GLsizei /* int[0,inf) */
}

export const createInterleaveData = (
  attStrides: number[] /* int[0,inf) */
): InterleaveData => {
  const _offsets: GLintptr[] /* int[0,inf) */ = []
  let _totalByte: GLsizei /* int[0,inf) */ = 0

  // set offset & byte
  for (const stride of attStrides) {
    const _byte: GLsizei /* intt[0,inf) */ = stride * 4 // gl.FLOAT -> 32bit === 4byte
    _offsets.push(_totalByte)
    _totalByte += _byte
  }

  return {
    offsets: _offsets,
    byte: _totalByte
  }
}
