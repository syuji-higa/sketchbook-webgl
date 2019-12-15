import { coordinatePickupColor } from '../models/coordinate'
import {
  baseFromHypotenuseRadian,
  heightFromHypotenuseRadian
} from '../models/trigonometric'

type LineOption = {
  offsetIndex?: number /* int[0,inf) */
}

type Line = {
  position: number[]
  index: number[] /* int[0,inf) */
}

export const line = (
  x1: number /* [0,inf) */,
  y1: number /* [0,inf) */,
  x2: number /* [0,inf) */,
  y2: number /* [0,inf) */,
  num: number /* [1,inf) */,
  options: LineOption = {}
): Line => {
  const { offsetIndex } = {
    offsetIndex: 0,
    ...options
  }

  const _position: number[] = []
  const _index: number[] /* int[0,inf) */ = []

  const _w: number /* [0,inf) */ = x1 - x2
  const _h: number /* [0,inf) */ = y1 - y2
  const _wos: number /* [0,inf) */ = _w / num // width one size
  const _hos: number /* [0,inf) */ = _h / num // height one size

  for (let i: number /* int[0,inf) */ = 0; num >= i; i++) {
    // prettier-ignore
    _position.push(
      x1 - (_wos * i),
      y1 - (_hos * i),
      0
    )
    if (i) {
      _index.push(offsetIndex + i - 1)
    }
  }

  return {
    position: _position,
    index: _index
  }
}

type SquareOptions = {
  offset?: number[]
  color?:
    | [number, number, number, number] /* [0,1] RGBA */
    | [number, number, number, number][] /* [0,1] RGBA */
  offsetIndex?: number /* int[0,inf) */
}

type Square = {
  position: number[]
  uv: number[] /* [0,1] */
  color: number[] /* [0,1] */
  index: number[] /* int[0,inf)  */
}

export const square = (
  width: number /* [0,inf) */,
  height: number /* [0,inf) */,
  row: number /* int[0,inf) */,
  col: number /* int[0,inf) */,
  options: SquareOptions = {}
): Square => {
  const { offset, color, offsetIndex } = {
    offset: [0, 0],
    color: [1, 1, 1, 1],
    offsetIndex: 0,
    ...options
  }

  const _position: number[] = []
  const _uv: number[] /* [0,1] */ = []
  const _color: number[] /* [0,1] */ = []
  const _index: number[] /* int[0,inf) */ = []
  const _pw: number = (width * 2) / col
  const _ph: number = (height * 2) / row
  const _tw: number /* [0,1] */ = 1 / col
  const _th: number /* [0,1] */ = 1 / row
  for (let y: number /* int[0,inf) */ = 0; row >= y; y++) {
    for (let x: number /* int[0,inf) */ = 0; col >= x; x++) {
      // prettier-ignore
      _position.push(
        offset[0] + -width + _pw * x, // x
        offset[1] + height - _ph * y, // y
        0, // z
      );
      // prettier-ignore
      _uv.push(
        _tw * x, // x
        _th * y, // y
      );
      const _xr: number = x / col
      const _yr: number = y / row
      if (
        Array.isArray(color[0]) &&
        Array.isArray(color[1]) &&
        Array.isArray(color[2]) &&
        Array.isArray(color[3])
      ) {
        const _tl: number[] = color[0] // top left
        const _tr: number[] = color[1] // top right
        const _bl: number[] = color[2] // bottom left
        const _br: number[] = color[3] // bottom right
        _color.push(...coordinatePickupColor(_tl, _tr, _bl, _br, _xr, _yr))
      } else if (
        typeof color[0] === 'number' &&
        typeof color[1] === 'number' &&
        typeof color[2] === 'number' &&
        typeof color[3] === 'number'
      ) {
        const _r: number = color[0]
        const _g: number = color[0]
        const _b: number = color[0]
        const _a: number = color[0]
        _color.push(_r, _g, _b, _a)
      }
    }
  }
  for (let y: number /* int[0,inf) */ = 0; row > y; y++) {
    for (let x: number /* int[0,inf) */ = 0; col > x; x++) {
      // prettier-ignore
      const _p: number[] = [
        offsetIndex + (y    ) * (col + 1) + x,
        offsetIndex + (y + 1) * (col + 1) + x,
        offsetIndex + (y    ) * (col + 1) + x + 1,
        offsetIndex + (y + 1) * (col + 1) + x + 1,
      ];
      // prettier-ignore
      _index.push(
        _p[0], _p[1], _p[2],
        _p[1], _p[3], _p[2],
      );
    }
  }
  return {
    position: _position,
    uv: _uv,
    color: _color,
    index: _index
  }
}

type CircleOptions = {
  offset?: number[] /* [0,inf) */
  ratio?: number[] /* [0,inf) */
  color?: [number, number, number, number] /* [0,1] RGBA */
  offsetIndex?: number /* int[0,inf) */
}

type Circle = {
  position: number[]
  uv: number[] /* [0,1] */
  color: number[] /* [0,1] */
  index: number[] /* int[0,inf)  */
}

export const circle = (
  rad: number,
  num: number /* int */,
  options: CircleOptions = {}
): Circle => {
  const { rotate, offset, ratio, color, offsetIndex } = {
    rotate: 0,
    offset: [0, 0],
    ratio: [1, 1],
    color: [1, 1, 1, 1],
    offsetIndex: 0,
    ...options
  }

  const _position: number[] = []
  const _uv: number[] /* [0,1] */ = []
  const _color: number[] /* [0,1] */ = []
  const _index: number[] /* int[0,inf) */ = []

  const _ang: number /* [0,inf) */ = (Math.PI * 2) / num

  _position.push(offset[0], offset[1], 0)
  _uv.push(offset[0] + 0.5, offset[1] + 0.5)
  _color.push(...color)

  for (let i: number /* int[0,inf) */ = 0; num > i; i++) {
    const _a: number = _ang * i + ((Math.PI * 2) / 360) * rotate
    const _x: number = baseFromHypotenuseRadian(rad, _a)
    const _y: number = heightFromHypotenuseRadian(rad, _a)
    // prettier-ignore
    _position.push(
      offset[0] + _x * ratio[0],
      offset[1] + _y * ratio[1],
      0,
    );
    _color.push(...color)
    // prettier-ignore
    _uv.push(
      (_x + rad) * 0.5,
      (_y + rad) * 0.5,
    );
  }

  for (let i: number /* int[0,inf) */ = 0; num > i; i++) {
    if (num - 1 > i) {
      // prettier-ignore
      _index.push(
        offsetIndex,
        offsetIndex + 1 + i,
        offsetIndex + 2 + i,
      );
    } else {
      // prettier-ignore
      _index.push(
        offsetIndex,
        offsetIndex + 1 + i,
        offsetIndex + 1,
      );
    }
  }

  return {
    position: _position,
    uv: _uv,
    color: _color,
    index: _index
  }
}
