type ThrottleOptions = {
  interval?: number /* int[0,inf) */
  isLastRun?: boolean
}

export const throttle = (options: ThrottleOptions = {}): Function => {
  const { interval, isLastRun } = {
    interval: 100,
    isLastRun: true,
    ...options
  }

  let _lastTime: number /* int[0,inf) */ = new Date().getTime() - interval
  let _timer: number /* int[0,inf) */ = 0

  return (fn: Function) => {
    if (_lastTime + interval <= new Date().getTime()) {
      _lastTime = new Date().getTime()
      fn()
    }
    if (isLastRun) {
      clearTimeout(_timer)
      _timer = window.setTimeout(() => {
        fn()
        _timer = 0
      }, interval)
    }
  }
}
