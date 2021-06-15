import ee from "@helpers/ee";

/**
 * @property {string} _namespace
 * @property {string} _type
 * @method {(string, ...any) => void} _eventHandler
 */
class Listener {
    _namespace = "";
    _type = "";

    /**
     * @param {string} namespace
     * @param {string} type
     */
    constructor(namespace = "", type = "") {
        this._namespace = namespace;
        this._type = type;
        ee.on(this._namespace + "::" + this._type, this._eventHandler);
    }

    /**
     * @param {string} method
     * @param  {...any} args
     */
    _eventHandler = (method, ...args) => {
        if (typeof this[method] == "function") {
            this[method](...args);
        }
    };
}

/**
 * @property {string} _name
 * @property {null|HTMLElement} _element
 * @property {[k: string]: HTMLElement} _refs
 * @property {any} _data
 * @property {RegExp} _classReg
 * @method {(HTMLElement) => void} getRefs
 * @method {(string, ...any) => void} ui
 * @method {(string, ...any) => void} dispatch
 * @method {() => void} destroy
 */
export class View extends Listener {
    _name = "";
    _element = null;
    _refs = {};
    _data = null;
    _classReg = /(^-\w)|(\s+-\w)/i;

    /**
     * @param {string} namespace
     * @param {HTMLElement} element
     * @param {any} data
     */
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

            if (this._classReg.test(ch.className)) continue;

            const refName = ch.getAttribute("data-ref");

            if (refName) {
                this._refs[refName] = ch;
            }

            if (el.children.length > 0) {
                this.getRefs(ch);
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
            this._element = null;
        }
        ee.off(
            [this._namespace, this._type, this._name].join("::"),
            this._eventHandler
        );
        ee.off(this._namespace + "::" + this._type, this._eventHandler);
    };
}

/**
 * @method {(string, ...any) => void} ui
 * @method {(string, ...any) => void} notify
 */
export class Controller extends Listener {
    /**
     * @param {string} namespace
     */
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
