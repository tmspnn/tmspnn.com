// External modules
import { clearNode } from "k-dom";
import { set as _set, forEach as _forEach } from "lodash";
import dayjs from "dayjs";

// Local modules
import T from "./ConversationItem.html";
import "./ConversationItem.scss";

const assign = Object.assign;
const keys = Object.keys;
const isArray = Array.isArray;

export default class ConversationItem extends View {
    element = null;

    data = {};

    bindings = {};

    refs = {};

    /**
     * @param {string|object} k
     * @param {any} v
     */
    setData = (k, v) => {
        if (typeof k == "string") {
            if (typeof v == "function") {
                v(this.data[k]);
            } else {
                this.data[k] = v;
            }
            this._postSetData(k);
        } else if (k instanceof Object) {
            assign(this.data, k);
            this._postSetData(keys(k));
        }
    };

    setProfiles = () => {
        clearNode(this.refs.profilesDiv);
        each(this.data.profiles, (p) => {
            const img = html2DOM(`<img src="${p.profile}">`);
            this.refs.profilesDiv.appendChild(img);
        });
    };

    onMessage = (msg) => {
        this.setData({
            dotHidden: false,
            last_message: msg,
            lastUpdated: dayjs(msg.created_at).format("MM-DD HH:mm")
        });
    };

    onClick = () => {
        this.setData("dotHidden", true);
    };

    constructor(namespace, element, data) {
        super(namespace);
        this._name = `conversation(${data.id})`;
        this.element = element || html2DOM(T);
        this.data = assign(data, {
            dotHidden: true,
            mutedHidden: true,
            lastUpdated: dayjs(data.last_message.created_at).format(
                "MM-DD HH:mm"
            ),
            link: "/conversations/" + data.id
        });
        this.bindings = {};
        this.refs = {};
        this._createBindings(this.element);
        setTimeout(() => {
            _forEach(this.bindings, (_, k) => {
                this._mutate(k);
            });
        });
    }

    _createBindings = (el) => {
        for (let k in el.dataset) {
            if (el.dataset.hasOwnProperty(k)) {
                switch (k) {
                    case "ref":
                        this.refs[el.dataset.ref] = el;
                        break;
                    case ":":
                        el.dataset[":"].split(";").forEach((p) => {
                            const [attr, prop] = p
                                .split(":")
                                .map((txt) => txt.trim());

                            if (!prop) return;

                            let f;

                            if (attr[0] == "*") {
                                f = () => this[attr.slice(1)]();
                            } else {
                                f = () => _set(el, attr, at(this.data, prop));
                            }

                            const bindingKey = prop.match(/[^\.[]+/)[0];

                            if (!this.bindings[bindingKey]) {
                                this.bindings[bindingKey] = [f];
                            } else {
                                this.bindings[bindingKey].push(f);
                            }
                        });
                        break;
                    case "on":
                        el.dataset.on.split(";").forEach((p) => {
                            const [e, h] = p
                                .split(":")
                                .map((txt) => txt.trim());

                            if (!h) return;

                            el.on(e, this[h]);
                        });
                        break;
                    default:
                        break;
                }
            }
        }

        for (let i = 0; i < el.children.length; ++i) {
            this._createBindings(el.children[i]);
        }
    };

    _postSetData = (args) => {
        if (typeof args == "string") {
            this._mutate(args);
        } else if (isArray(args)) {
            args.forEach((a) => this._mutate(a));
        }
    };

    _mutate = (k) => {
        const binding = this.bindings[k];
        binding.forEach((f) => f());
    };
}
