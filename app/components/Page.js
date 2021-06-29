// External modules
import { $ } from "k-dom";
import { at, parseJSON, Klass, View } from "k-util";
import kxhr from "k-xhr";

// Local modules
import immediatelyScrollTo from "../helpers/immediatelyScrollTo";
import PageContainer from "../components/PageContainer";
import Ws from "../components/Ws";
import Toast from "../components/Toast/Toast";
import CustomSpinner from "../components/CustomSpinner";

const assign = Object.assign;

const Page = Klass(
    {
        blocked: false,

        scrollTop: 9,

        ws: null,

        data:
            parseJSON(at($('script[type="application/json"'), "textContent")) ||
            {},

        constructor() {
            this.Super();

            if (this.data.uid) {
                this.ws = new Ws();
            }

            setTimeout(() => {
                new Toast();
                new CustomSpinner();
                new PageContainer();

                window._container.preloadStyles(document);
                window._container.captureLinks();

                this.refs.rootDiv = $("#root");
                this.refs.rootDiv.on("scroll", (e) => {
                    this.scrollTop = e.currentTarget.scrollTop;
                });

                document.documentElement.on("pageshow", () => {
                    if (this.scrollTop > 0) {
                        immediatelyScrollTo(
                            this.refs.rootDiv,
                            this.scrollTop | 0
                        );
                    }
                });
            });
        },

        toast(text) {
            this.dispatch("toast.show", text);
        },

        block() {
            this.blocked = true;
            this.dispatch("customSpinner.show");
        },

        unblock() {
            this.blocked = false;
            this.dispatch("customSpinner.hide");
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
        }
    },
    View
);

export default Page;
