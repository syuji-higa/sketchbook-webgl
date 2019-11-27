/**
 * Features inspired by https://wgld.org/
 */

import { toTowPower } from '../models/math'

export const createShader = (
  gl: WebGLRenderingContext,
  type: string,
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

export const createProgram = (
  gl: WebGLRenderingContext,
  vs: WebGLShader,
  fs: WebGLShader
): WebGLProgram => {
  const _program: WebGLProgram = gl.createProgram()

  gl.attachShader(_program, vs)
  gl.attachShader(_program, fs)

  gl.linkProgram(_program)

  return _program
}

export const useProgram = (
  gl: WebGLRenderingContext,
  program: WebGLProgram
) => {
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.useProgram(program)
    return program
  } else {
    throw new Error(gl.getProgramInfoLog(program))
  }
}

export const createVbo = (
  gl: WebGLRenderingContext,
  data: Float32Array,
  drow: number | null = null
): WebGLBuffer => {
  const _vbo: WebGLBuffer = gl.createBuffer()
  const _drow: number = drow || gl.STATIC_DRAW

  gl.bindBuffer(gl.ARRAY_BUFFER, _vbo)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), _drow)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  return _vbo
}

export const createIbo = (
  gl: WebGLRenderingContext,
  data: number[]
): WebGLBuffer => {
  const _ibo /* :WebGLBuffer */ = gl.createBuffer()

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _ibo)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

  return _ibo
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
  gl: WebGLRenderingContext,
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
  minFilter: string
  magFilter: string
  wrapS: string
  wrapT: string
}

type Framebuffer = {
  d: WebGLRenderbuffer
  f: WebGLFramebuffer
  t: WebGLTexture
}

export const createFramebuffer = (
  gl: WebGLRenderingContext,
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

type EnableAttributeOptions = {
  type?: GLenum
  normalized?: boolean
  stride?: number
  offset?: number
}

export const enableAttribute = (
  gl: WebGLRenderingContext,
  index: number,
  size: number,
  options: EnableAttributeOptions = {}
) => {
  const { type, normalized, stride, offset } = {
    type: gl.FLOAT,
    normalized: false,
    stride: 0,
    offset: 0,
    ...options
  }

  gl.enableVertexAttribArray(index)
  gl.vertexAttribPointer(index, size, type, normalized, stride, offset)
}

type ProgramData = {
  prg: WebGLProgram
  attLocs: GLint[]
  attStrides: number[]
  uniLocs: { [key: string]: WebGLUniformLocation }
}

export const createProgramData = (
  gl: WebGLRenderingContext,
  attLocs: string[],
  uniLocs: string[],
  attStrides: number[],
  vShader: string,
  fShader: string
): ProgramData => {
  // create program
  const _vs: WebGLShader = createShader(gl, 'vertex', vShader)
  const _fs: WebGLShader = createShader(gl, 'fragment', fShader)
  const _prg: WebGLProgram = createProgram(gl, _vs, _fs)

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
  attStrides: number[] /* int[0,inf) */,
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
  offsets: number[] /* int[0,inf) */
  byte: number /* int[0,inf) */
}

export const createInterleaveData = (
  attStrides: number[] /* int[0,inf) */
): InterleaveData => {
  const _offsets: number[] /* int[0,inf) */ = []
  let _totalByte: number /* int[0,inf) */ = 0

  // set offset & byte
  for (const stride of attStrides) {
    const _byte: number /* intt[0,inf) */ = stride * 4 // gl.FLOAT -> 32bit === 4byte
    _offsets.push(_totalByte)
    _totalByte += _byte
  }

  return {
    offsets: _offsets,
    byte: _totalByte
  }
}
