export const coordinateLength = (
  p1X: number /* position 1 x */,
  p1Y: number /* position 1 y */,
  p2X: number /* position 2 x */,
  p2Y: number /* position 2 y */
): number => {
  return Math.sqrt(Math.pow(p1X - p2X, 2) + Math.pow(p1Y - p2Y, 2))
}

export const coordinatePickupColor = (
  cTL: number[] /* [0,1] color top left */,
  cTR: number[] /* [0,1] color top right */,
  cBL: number[] /* [0,1] color bottom left */,
  cBR: number[] /* [0,1] color bottom right */,
  pRX: number /* [-1,1] position ratio x */,
  pRY: number /* [-1,1] position ratio y */
): number[] /* [0,1] pickup color */ => {
  // color top
  const _cT: number[] /* [0,1] */ = cTL.map(
    (c, i): number => {
      return cTL[i] + (cTR[i] - cTL[i]) * pRX
    }
  )
  // color bottom
  const _cB: number[] /* [0,1] */ = cBL.map(
    (c, i): number => {
      return cBL[i] + (cBR[i] - cBL[i]) * pRX
    }
  )
  return _cT.map((c, i) => {
    return _cT[i] + (_cB[i] - _cT[i]) * pRY
  })
}
