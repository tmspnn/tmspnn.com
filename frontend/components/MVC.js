/**
 * models won"t dispatch events.
 * views will dispatch events that handled by controllers.
 * controllers will dispatch events that handled by models or views.
 */
import { removeNode } from "@util/DOM"
import ee from "@util/ee"

class Listener {
  _namespace = ""
  _type = ""

  constructor(namespace, type) {
    this._namespace = namespace
    this._type = type
    ee.on(this._namespace + "::" + this._type, this._eventHandler)
  }

  _eventHandler = args => {
    const { _method } = args

    if (typeof this[_method] == "function") {
      delete args._method
      this[_method](args)
    }
  }
}

export class Model extends Listener {
  constructor(namespace = "global") {
    super(namespace, "model")
  }
}

export class View extends Listener {
  _name = ""

  constructor(namespace = "global") {
    super(namespace, "view")

    setTimeout(() => {
      ee.on([this._namespace, this._type, this._name].join("::"), this._eventHandler)
    })
  }

  dispatch = (method, args = {}) => {
    args._method = method
    ee.emit(this._namespace + "::controller", args)
  }

  destroy = () => {
    if (this._element) {
      removeNode(this._element)
    }

    ee.off([this._namespace, this._type, this._name].join("::"), this._eventHandler)
    ee.off(this._namespace + "::" + this._type, this._eventHandler)
  }
}

export class Controller extends Listener {
  constructor(namespace = "global") {
    super(namespace, "controller")
  }

  mutate = (method, args = {}) => {
    args._method = method
    ee.emit(this._namespace + "::model", args)
  }

  broadcast = (args = {}) => {
    args._method = "onBroadcast"
    ee.emit(this._namespace + "::view", args)
  }

  ui = (pattern, args = {}) => {
    const [componentName, method] = pattern.split("::")
    args._method = method
    ee.emit(this._namespace + "::view::" + componentName, args)
  }
}

export default { Model, View, Controller }