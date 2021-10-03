import { $ } from "k-dom";
import { at, View } from "k-util";
import kxhr from "k-xhr";
import immediatelyScrollTo from "../helpers/immediatelyScrollTo";
import Container from "./Container";
import Spinner from "./Spinner";
import Toast from "../components/Toast/Toast";
import Ws from "../components/Ws";

const assign = Object.assign;

export default class Page extends View {
    constructor() {
        super();
        this.blocked = false;
        this.documentElement = document.documentElement;
        this.scrollingElement = document.scrollingElement;
        this.scrollTop = document.scrollingElement.scrollTop;
        this.data = $('script[type="application/json"', document.body)
            ? JSON.parse(
                  $('script[type="application/json"', document.body).textContent
              )
            : {};
        this.ws = this.data.uid ? new Ws() : null;

        this.element = document.body;
        this.refs.root = $("#root");

        new Spinner();
        new Toast();
        new Container();

        document.on("scroll", () => {
            if (document.scrollingElement == this.scrollingElement) {
                this.scrollTop = this.scrollingElement.scrollTop;
            }
        });

        this.documentElement.on("pageshow", () => {
            immediatelyScrollTo(this.scrollingElement, this.scrollTop | 0);
        });
    }

    toast(text) {
        this.dispatch("toast.show", text);
    }

    block() {
        this.blocked = true;
        this.dispatch("spinner.show");
    }

    unblock() {
        this.blocked = false;
        this.dispatch("spinner.hide");
    }

    getJSON(url) {
        if (this.blocked) {
            return Promise.reject("blocked");
        }

        this.block();

        return kxhr(url)
            .then((res) => parseJSON(res))
            .catch((e) => this.handleException(e))
            .finally(() => this.unblock());
    }

    postJSON(url, data, options) {
        if (this.blocked) {
            return Promise.reject("blocked");
        }

        this.block();

        return kxhr(
            url,
            "post",
            JSON.stringify(data),
            assign({ contentType: "application/json" }, options)
        )
            .then((res) => JSON.parse(res))
            .catch((e) => this.handleException(e))
            .finally(() => this.unblock());
    }

    putJSON(url, data, options) {
        if (this.blocked) {
            return Promise.reject("blocked");
        }

        this.block();

        return kxhr(
            url,
            "put",
            JSON.stringify(data),
            assign({ contentType: "application/json" }, options)
        )
            .then((res) => JSON.parse(res))
            .catch((e) => this.handleException(e))
            .finally(() => this.unblock());
    }

    del(url) {
        if (this.blocked) {
            return Promise.reject("blocked");
        }

        this.block();

        return kxhr(url, "delete")
            .then((res) => JSON.parse(res))
            .catch((e) => this.handleException(e))
            .finally(() => this.unblock());
    }

    handleException(e) {
        let msg;

        try {
            msg = JSON.parse(e.message).err;
        } catch (e) {
            msg = e.message || "服务器繁忙, 请稍后再试.";
        }

        this.toast(msg);
    }

    stepBack() {
        if (history.state.prev) {
            history.back();
        } else {
            location.replace("/");
        }
    }

    go(url) {
        window._container.go(url);
    }
}
