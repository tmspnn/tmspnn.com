import { $ } from "k-dom";
import { at, parseJSON, Klass, View } from "k-util";
import kxhr from "k-xhr";

import immediatelyScrollTo from "../helpers/immediatelyScrollTo";
import Container from "./Container";
import Spinner from "./Spinner";
import Toast from "../components/Toast/Toast";
import Ws from "../components/Ws";

const assign = Object.assign;

const pageProto = {
    blocked: false,

    scrollTop: 0,

    ws: null,

    data:
        parseJSON(at($('script[type="application/json"'), "textContent")) || {},

    constructor() {
        this.Super();

        new Spinner();
        new Toast();
        new Container();

        window._container.preloadStyles(document);
        window._container.captureLinks(document.body);

        this.element = document.body;
        this.refs.root = $("#root");

        document.on("scroll", () => {
            this.scrollTop = document.scrollingElement.scrollTop;
        });

        document.documentElement.on("pageshow", () => {
            if (this.scrollTop > 0) {
                immediatelyScrollTo(this.refs.root, this.scrollTop | 0);
            }
        });

        if (this.data.uid) {
            this.ws = new Ws();
        }
    },

    toast(text) {
        this.dispatch("toast.show", text);
    },

    block() {
        this.blocked = true;
        this.dispatch("spinner.show");
    },

    unblock() {
        this.blocked = false;
        this.dispatch("spinner.hide");
    },

    getJSON(url) {
        if (this.blocked) return;
        this.block();
        return kxhr(url)
            .then((res) => parseJSON(res))
            .catch((e) => this.handleException(e))
            .finally(() => this.unblock());
    },

    postJSON(url, data, options) {
        if (this.blocked) return;
        this.block();
        return kxhr(
            url,
            "post",
            JSON.stringify(data),
            assign({ contentType: "application/json" }, options)
        )
            .then((res) => parseJSON(res))
            .catch((e) => this.handleException(e))
            .finally(() => this.unblock());
    },

    putJSON(url, data, options) {
        if (this.blocked) return;
        this.block();
        return kxhr(
            url,
            "put",
            JSON.stringify(data),
            assign({ contentType: "application/json" }, options)
        )
            .then((res) => parseJSON(res))
            .catch((e) => this.handleException(e))
            .finally(() => this.unblock());
    },

    del(url) {
        if (this.blocked) return;
        this.block();
        return kxhr(url, "delete")
            .then((res) => parseJSON(res))
            .catch((e) => this.handleException(e))
            .finally(() => this.unblock());
    },

    handleException(e) {
        const msg = at(parseJSON(e.message), "err") || e.message;
        this.toast(msg || "服务器繁忙, 请稍后再试.");
    },

    stepBack() {
        if (history.state.prev) {
            history.back();
        } else {
            location.replace("/");
        }
    },

    go(url) {
        window._container.go(url);
    }
};

export default Klass(pageProto, View);
