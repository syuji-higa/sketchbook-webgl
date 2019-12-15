type EventFunction = {
  handleEvent: Function
  add: Function
  remove: Function
}

export const createEvent = (
  target: EventTarget,
  eventType: string,
  listener: Function,
  option: boolean | Object = false
): EventFunction => {
  return {
    handleEvent: (e: Event): void => {
      listener(e)
    },
    add: function(): void {
      target.addEventListener(eventType, this, option)
    },
    remove: function(): void {
      target.removeEventListener(eventType, this, option)
    }
  }
}

/**
 * @example
 *   onDispatchEvent.bind(this, window, 'resize', e);
 */
export const onDispatchEvent = (
  target: EventTarget,
  eventType: string,
  event: Event,
  detail: Object = {}
): void => {
  const _detail: Object = (() => {
    const _obj: Object = {
      status: event
    }
    if (detail) {
      Object.assign(_obj, detail)
    }
    return _obj
  })()

  target.dispatchEvent(
    new CustomEvent(eventType, {
      detail: _detail
    })
  )
}
