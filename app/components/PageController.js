// External modules
import kxhr from "k-xhr";

// Local modules
import Ws from "@components/Ws";

/**
 * @property {boolean} blocked
 * @property {object} data
 * @property {Ws} ws
 * @method {(string) => void} toast
 * @method {() => void} block
 * @method {() => void} unblock
 * @method {(string) => Promise<object>} getJson
 * @method {(string, object, object) => Promise<object>} postJson
 * @method {(string, object, object) => Promise<object>} putJson
 * @method {(string) => Promise<object>} del
 * @method {(Error) => void} handleException
 */
export default class PageController extends Controller {
    blocked = false;

    data = null;

    ws = new Ws();

    constructor(name, data) {
        super(name);
        this.data = data;
        this.ws.onMessage = (msg) => {
            if (typeof this.onWsMessage == "function") {
                this.onWsMessage(msg);
            }
        };
    }

    toast = (text) => {
        this.ui("toast::show", text);
    };

    block = () => {
        this.blocked = true;
        this.ui("customSpinner::show");
    };

    unblock = () => {
        this.blocked = false;
        this.ui("customSpinner::hide");
    };

    getJson = (url) => {
        if (this.blocked) return;
        this.block();
        return kxhr(url)
            .then((res) => parseJSON(res))
            .finally(() => this.unblock());
    };

    postJson = (url, data, options = {}) => {
        if (this.blocked) return;
        this.block();
        return kxhr(url, "post", JSON.stringify(data), {
            contentType: "application/json",
            ...options
        })
            .then((res) => parseJSON(res))
            .finally(() => this.unblock());
    };

    putJson = (url, data, options = {}) => {
        if (this.blocked) return;
        this.block();
        return kxhr(url, "put", JSON.stringify(data), {
            contentType: "application/json",
            ...options
        })
            .then((res) => parseJSON(res))
            .finally(() => this.unblock());
    };

    del = (url) => {
        if (this.blocked) return;
        this.block();
        return kxhr(url, "delete")
            .then((res) => parseJSON(res))
            .finally(() => this.unblock());
    };

    handleException = (e) => {
        if (isJSON(e.message)) {
            const { err } = parseJSON(e.message);
            this.toast(err || "服务器繁忙, 请稍后再试.");
        }
    };
}
