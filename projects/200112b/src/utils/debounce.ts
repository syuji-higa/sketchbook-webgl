type Options = {
  interval?: number /* int[0,inf) */
  isFirstRun?: boolean
}

export const debounce = (options: Options = {}): Function => {
  const { interval, isFirstRun } = {
    interval: 100,
    isFirstRun: false,
    ...options
  }
  let _timer: number /* int[0,inf) */ = 0
  let _firstRun: boolean = true

  return (fn: Function) => {
    if (isFirstRun && _firstRun) {
      fn()
      _firstRun = false
    }
    clearTimeout(_timer)
    _timer = window.setTimeout(() => {
      fn()
      _timer = 0
      if (isFirstRun) {
        _firstRun = true
      }
    }, interval)
  }
}
