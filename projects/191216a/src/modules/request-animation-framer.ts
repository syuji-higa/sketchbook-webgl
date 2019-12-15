class RequestAnimationFramer {
  _animes: Map<Object, Function> = new Map()
  _animateHandle: number /* int[0,inf) */ = 0

  add(key: Object, func: Function): RequestAnimationFramer {
    this._animes.set(key, func)

    if (!this._animateHandle) {
      this._start()
    }
    return this
  }

  remove(key: Object): RequestAnimationFramer {
    this._animes.delete(key)
    if (!this._animes.size) {
      this._stop()
    }

    return this
  }

  private _start() {
    if (this._animateHandle) {
      return
    }
    this._animate()
  }

  private _stop() {
    cancelAnimationFrame(this._animateHandle)
    this._animateHandle = 0
  }

  private _animate() {
    this._animateHandle = requestAnimationFrame(this._animate.bind(this))

    this._animes.forEach((func, key) => {
      func(key)
    })
  }
}

export { RequestAnimationFramer as default }
