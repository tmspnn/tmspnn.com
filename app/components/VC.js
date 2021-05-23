import ee from "@helpers/ee";
class Listener {
    _namespace = "";
    _type = "";

    constructor(namespace = "", type = "") {
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
    _data = null;
    _classReg = /(^-\w)|(\s+-\w)/i;

    constructor(namespace, element, data) {
        super(namespace, "view");
        this._element = element;
        this._data = data;

        if (element) {
            this.getRefs(element);
        }

        setTimeout(() => {
            ee.on(
                [this._namespace, this._type, this._name].join("::"),
                this._eventHandler
            );
        });
    }

    getRefs = (el) => {
        for (let i = 0; i < el.children.length; ++i) {
            const ch = el.children[i];
            if (!this._classReg.test(ch.className)) {
                const refName = ch.getAttribute("data-ref");
                if (refName) {
                    this._refs[refName] = ch;
                }
                if (el.children.length > 0) {
                    this.getRefs(ch);
                }
            }
        }
    };

    ui = (pattern, ...args) => {
        const [componentName, method] = pattern.split("::");
        setTimeout(() => {
            ee.emit(
                this._namespace + "::view::" + componentName,
                method,
                ...args
            );
        });
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
        ee.off(
            [this._namespace, this._type, this._name].join("::"),
            this._eventHandler
        );
        ee.off(this._namespace + "::" + this._type, this._eventHandler);
    };
}

export class Controller extends Listener {
    constructor(namespace) {
        super(namespace, "controller");
    }

    ui = (pattern, ...args) => {
        const [componentName, method] = pattern.split("::");
        setTimeout(() => {
            ee.emit(
                this._namespace + "::view::" + componentName,
                method,
                ...args
            );
        });
        return this;
    };

    notify = (pattern, ...args) => {
        const [namespace, method] = pattern.split("::");
        ee.emit(namespace + "::controller", method, ...args);
        return this;
    };
}

export default { View, Controller };
