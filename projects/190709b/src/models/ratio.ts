type Cover = {
  width: number /* [0,inf) */
  height: number /* [0,inf) */
  x: number
  y: number
}

export const cover = (
  width: number /* [0,inf) */,
  height: number /* [0,inf) */,
  widthWidthRate: /* [0,inf) viewport width rate width / height */ number
): Cover => {
  const _orignRate: number /* [0,inf) */ = width / height

  if (widthWidthRate < _orignRate) {
    const _height: number /* [0,inf) */ = width / widthWidthRate
    return {
      width: width,
      height: _height,
      x: 0,
      y: (height - _height) / 2
    }
  } else {
    const _width: number /* [0,inf) */ = height * widthWidthRate
    return {
      width: _width,
      height: height,
      x: (width - _width) / 2,
      y: 0
    }
  }
}

type Ratio = {
  raito: number /* [1,inf) */
  width: number /* [1,inf) */
  height: number /* [1,inf) */
}

export const maxRatio = (
  w: number /* [0,inf) */,
  h: number /* [0,inf) */
): Ratio => {
  const _maxRatio: number /* [1,inf) */ = Math.max(w / h, h / w)
  return {
    raito: _maxRatio,
    width: w > h ? _maxRatio : 1,
    height: h > w ? _maxRatio : 1
  }
}

export const minRatio = (
  w: number /* [0,inf) */,
  h: number /* [0,inf) */
): Ratio => {
  const _minRatio: number /* [0,1] */ = Math.min(w / h, h / w)
  return {
    raito: _minRatio,
    width: w > h ? 1 : _minRatio,
    height: h > w ? 1 : _minRatio
  }
}
