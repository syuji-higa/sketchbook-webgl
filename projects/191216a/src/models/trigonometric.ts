export const hypotenuseFromBaseRadian = (
  base: number,
  radian: number
): number => {
  return base / Math.sin(radian)
}

export const hypotenuseFromHeightRadian = (
  height: number,
  radian: number
): number => {
  return height / Math.sin(radian)
}

export const hypotenuseFromBaseHeight = (
  base: number,
  height: number
): number => {
  return Math.sqrt(Math.pow(base, 2) + Math.pow(height, 2))
}

export const heightFromBaseRadian = (base: number, radian: number): number => {
  return base * Math.tan(radian)
}

export const heightFromHypotenuseRadian = (
  hypotenuse: number,
  radian: number
): number => {
  return hypotenuse * Math.sin(radian)
}

export const heightFromBaseHypotenuse = (
  base: number,
  hypotenuse: number
): number => {
  return Math.sqrt(Math.pow(hypotenuse, 2) - Math.pow(base, 2))
}

export const baseFromHeightRadian = (
  height: number,
  radian: number
): number => {
  return height / Math.tan(radian)
}

export const baseFromHypotenuseRadian = (
  hypotenuse: number,
  radian: number
): number => {
  return hypotenuse * Math.cos(radian)
}

export const baseFromHeightHypotenuse = (
  height: number,
  hypotenuse: number
): number => {
  return Math.sqrt(Math.pow(hypotenuse, 2) - Math.pow(height, 2))
}

export const radianFromBaseHeight = (base: number, height: number): number => {
  return Math.atan2(height, base)
}

export const radianFromBaseHypotenuse = (
  base: number,
  hypotenuse: number
): number => {
  return Math.acos(base / hypotenuse)
}

export const radianFromHeightHypotenuse = (
  height: number,
  hypotenuse: number
): number => {
  return Math.asin(height / hypotenuse)
}
