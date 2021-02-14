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

  _eventHandler = (args) => {
    const { _method } = args
    if (typeof this[_method] == "function") {
      this[_method](args)
    }
  }
}

export class View extends Listener {
  _name = ""
  _element = null

  constructor(namespace = "global") {
    super(namespace, "view")
    setTimeout(() => {
      ee.on([this._namespace, this._type, this._name].join("::"), this._eventHandler)
    })
  }

  ui = (pattern, args = {}) => {
    const [componentName, method] = pattern.split("::")
    args._method = method
    ee.emit(this._namespace + "::view::" + componentName, args)
    return this
  }

  dispatch = (method, args = {}) => {
    args._method = method
    ee.emit(this._namespace + "::controller", args)
    return this
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

  ui = (pattern, args = {}) => {
    const [componentName, method] = pattern.split("::")
    args._method = method
    ee.emit(this._namespace + "::view::" + componentName, args)
    return this
  }

  notify = (pattern, args = {}) => {
    const [namespace, method] = pattern.split("::")
    args._method = method
    ee.emit(namespace + "::controller", args)
    return this
  }
}

export default { View, Controller }