import { removeNode } from "@util/DOM";
import ee from "@util/ee";

class Listener {
  _namespace = "";
  _type = "";

  constructor(namespace, type) {
    this._namespace = namespace;
    this._type = type;
    ee.on(this._namespace + "::" + this._type, this._eventHandler);
  }

  _eventHandler = (method, ...args) => {
    if (typeof this[method] == "function") {
      this[method](...args);
    }
  };
}

export class View extends Listener {
  _name = "";
  _element = null;
  _refs = {};
  _data = null

  constructor(namespace, element, data) {
    super(namespace || "global", "view");
      this._element = element
      this._data = data

      if (element) {
        const els = $$("[data-ref]", element);
        for (let i = 0; i < els.length; ++i) {
            const refName = els[i].getAttribute("data-ref");
            this._refs[refName] = els[i];
        }
      }
     
    setTimeout(() => {
      ee.on([this._namespace, this._type, this._name].join("::"), this._eventHandler);
    });
  }

  ui = (pattern, ...args) => {
    const [componentName, method] = pattern.split("::");
    setTimeout(() => {
      ee.emit(this._namespace + "::view::" + componentName, method, ...args);
    }, 0);
    return this;
  };

  dispatch = (method, ...args) => {
    ee.emit(this._namespace + "::controller", method, ...args);
    return this;
  };

  destroy = () => {
    if (this._element) {
      removeNode(this._element);
    }
    ee.off([this._namespace, this._type, this._name].join("::"), this._eventHandler);
    ee.off(this._namespace + "::" + this._type, this._eventHandler);
  };
}

export class Controller extends Listener {
  constructor(namespace = "global") {
    super(namespace, "controller");
  }

  ui = (pattern, ...args) => {
    const [componentName, method] = pattern.split("::");
    setTimeout(() => {
      ee.emit(this._namespace + "::view::" + componentName, method, ...args);
    }, 0);
    return this;
  };

  notify = (pattern, ...args) => {
    const [namespace, method] = pattern.split("::");
    ee.emit(namespace + "::controller", method, ...args);
    return this;
  };
}

export default { View, Controller };
