export const toAngle = (rad: number): number => {
  return (rad * 180) / Math.PI
}

export const toRadian = (ang: number): number => {
  return (ang * Math.PI) / 180
}

export const decimal = (num: number): number => {
  return parseFloat('0.' + String(num).split('.')[1])
}

export const round = (num: number, digit: number /* int */ = 6): number => {
  const _digit: number /* int */ = Math.pow(10, digit)
  return Math.round(num * _digit) / _digit
}

export const floor = (num: number, digit: number /* int */ = 6) => {
  const _digit: number /* int */ = Math.pow(10, digit)
  return Math.floor(num * _digit) / _digit
}

export const ceil = (num: number, digit: number /* int */ = 6) => {
  const _digit: number /* int */ = Math.pow(10, digit)
  return Math.ceil(num * _digit) / _digit
}

export const clamp = (num: number, min: number, max: number): number => {
  return min > num ? min : max < num ? max : num
}

export const hoop = (
  num: number /* int */,
  min: number /* int */,
  max: number /* int */
): number /* int */ => {
  const _range: number /* int[0,inf) */ = max - min + 1
  let _num /* :number - int */ = (num - min) % _range
  if (0 > _num) {
    _num = _range + _num
  }
  return _num + min
}

export const toTowPower = (
  num: number /* int[0,inf) */
): number /* int[0,inf) */ => {
  return Math.pow(2, (Math.log(num) / Math.LN2) | 0)
}

export const frameToTime = (
  frame: number /* int[0,inf) */,
  fps: number /* [0,inf) */ = 60
): number /* [0,inf) */ => {
  return (1000 / fps) * frame
}

export const timeToFrame = (
  time: number /* int[0,inf) */,
  fps: number /* [0,inf) */ = 60
): number /* [0,inf) */ => {
  return (time * fps) / 1000
}
