import { createEvent } from '../utils/event'

type Event = {
  target: EventTarget
  eventType: string
  option: boolean | Object
  listeners: Function[]
  event: EventFunction
}

type EventFunction = {
  add: Function
  remove: Function
}

class Eventer {
  _events: Event[] = []

  create(
    target: EventTarget,
    eventType: string,
    listener: Function,
    option: boolean | Object = false
  ): EventFunction {
    return {
      add: () => {
        this.add(target, eventType, listener, option)
      },
      remove: () => {
        this.remove(target, eventType, listener)
      }
    }
  }

  add(
    target: EventTarget,
    eventType: string,
    listener: Function,
    option: boolean | Object = false
  ): Eventer {
    let _hasEvent: boolean = false

    for (const e of this._events) {
      if (
        target === e.target &&
        eventType === e.eventType &&
        option === e.option &&
        !e.listeners.includes(listener)
      ) {
        e.listeners.push(listener)
        _hasEvent = true
        return
      }
    }

    if (!_hasEvent) {
      const _listeners: Function[] = [listener]
      this._events.push({
        target,
        eventType,
        option,
        listeners: _listeners,
        event: this._addEvent(target, eventType, _listeners, option)
      })
    }

    return this
  }

  remove(target: EventTarget, eventType: string, listener: Function): Eventer {
    this._events.forEach((e, i) => {
      if (
        target === e.target &&
        eventType === e.eventType &&
        e.listeners.includes(listener)
      ) {
        e.listeners.splice(e.listeners.indexOf(listener), 1)
        if (!e.listeners.length) {
          this._removeEvent(i)
        }
        return
      }
    })

    return this
  }

  private _addEvent(
    target: EventTarget,
    eventType: string,
    listeners: Function[],
    option: boolean | Object
  ): EventFunction {
    const _event = createEvent(
      target,
      eventType,
      (e: Event) => {
        for (const listener of listeners) {
          listener(e)
        }
      },
      option
    )
    _event.add()
    return _event
  }

  private _removeEvent(index: number /* int[0,inf] */) {
    this._events.splice(index, 1)
  }
}

export { Eventer as default }
