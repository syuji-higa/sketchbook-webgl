type Box = {
  position: number[],
  normal: number[],
  uv: number[], /* float[0,1] */
  index: number[] /* int[0,inf) */
}

export const box = (size: number /* int[0,inf) */): Box => {
  const _hs = size * 0.5;
  // prettier-ignore
  const _position: number[] = [
    -_hs, -_hs,  _hs,  _hs, -_hs,  _hs,  _hs,  _hs,  _hs, -_hs,  _hs,  _hs,
    -_hs, -_hs, -_hs, -_hs,  _hs, -_hs,  _hs,  _hs, -_hs,  _hs, -_hs, -_hs,
    -_hs,  _hs, -_hs, -_hs,  _hs,  _hs,  _hs,  _hs,  _hs,  _hs,  _hs, -_hs,
    -_hs, -_hs, -_hs,  _hs, -_hs, -_hs,  _hs, -_hs,  _hs, -_hs, -_hs,  _hs,
     _hs, -_hs, -_hs,  _hs,  _hs, -_hs,  _hs,  _hs,  _hs,  _hs, -_hs,  _hs,
    -_hs, -_hs, -_hs, -_hs, -_hs,  _hs, -_hs,  _hs,  _hs, -_hs,  _hs, -_hs,
  ]

  // prettier-ignore
  const _normal: number[] = [
    -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,  1.0,
    -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0, -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0,
    -1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
     1.0, -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,
    -1.0, -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0,
  ]

  // prettier-ignore
  const _uv: number[] /* float[0,1] */ = [
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  ]

  // prettier-ignore
  const _index: number[] /* int[0,inf) */ = [
     0,  1,  2,  0,  2,  3,
     4,  5,  6,  4,  6,  7,
     8,  9, 10,  8, 10, 11,
    12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19,
    20, 21, 22, 20, 22, 23,
  ]
  
  return {
    position: _position,
    normal: _normal,
    uv: _uv,
    index: _index
  };
};
