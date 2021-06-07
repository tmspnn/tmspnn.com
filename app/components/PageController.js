// External
import kxhr from "k-xhr";

// Local
import Ws from "@components/Ws";

export default class PageController extends Controller {
    blocked = false;

    ws = new Ws();

    constructor(namespace) {
        const dataTag = $('script[type="application/json"');
        const data = parseJSON(at(dataTag, "textContent")) || {};
        super(namespace);
        this.data = data;
        this.ws.onMessage = (msg) => {
            if (typeof this.onWsMessage == "function") {
                this.onWsMessage(msg);
            }
        };
    }

    toast = (texts) => {
        this.ui("toast::show", texts);
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
