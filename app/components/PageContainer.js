import { replaceNode } from "k-dom";
import createDocument from "@helpers/createDocument";
import isSameOrigin from "@helpers/isSameOrigin";

export default class PageContainer extends View {
    cache = {};
    lastUrl = null;
    currentUrl = location.href.replace(/#.*/, "");
    destUrl = null;
    pushState = false;

    constructor() {
        super();
        this._name = "pageContainer";

        if (!window._pageContainer) {
            this.cache[location.href] = {
                documentElement: document.documentElement,
                loaded: true
            };
            history.replaceState({ url: this.currentUrl, from: null }, "");
            window.on("popstate", this.onPopState);
            window._pageContainer = this;
        }
    }

    captureLinks = () => {
        const container = window._pageContainer;
        $$("a").forEach((link) => {
            link.setAttribute("data-href", link.href);
            link.removeAttribute("href");
            link.on("click", (e) => container.onLinkClick(e));
        });
    };

    onLinkClick = (e) => {
        const link = e.currentTarget;
        const url = link.getAttribute("data-href");

        if (!isSameOrigin(url)) {
            return (location.href = link.href);
        }

        if (this.currentUrl == url || this.destUrl == url) return;

        this.destUrl = url;
        this.pushState = !link.hasAttribute("data-nopush");
        this.switchPage();
    };

    onPopState = (e) => {
        this.destUrl = e.state.url;
        this.pushState = false;
        this.switchPage();
    };

    toPage = (url, pushState = true) => {
        const parsedUrl = this.toAbsolutePath(url);
        if (!isSameOrigin(parsedUrl) || this.currentUrl == parsedUrl) return;
        this.destUrl = parsedUrl;
        this.pushState = pushState;
        this.switchPage();
    };

    switchPage = () => {
        if (this.destUrl in this.cache) {
            this.showDestPage();
        } else {
            this.loadPage(this.destUrl, (xhr) => {
                this.destUrl = xhr.responseURL;
                this.showDestPage();
            });
        }
    };

    loadPage = (url, onLoad) => {
        const parsedUrl = this.toAbsolutePath(url);

        if (parsedUrl in this.cache || !isSameOrigin(parsedUrl)) return;

        const xhr = new XMLHttpRequest();
        xhr.open("GET", parsedUrl, true);
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 400) {
                this.cache[xhr.responseURL] = createDocument(xhr.responseText);
                this.preloadStyles(this.cache[xhr.responseURL]);
                if (typeof onLoad == "function") {
                    onLoad(xhr);
                }
            } else {
                this.onXHRError(xhr);
            }
        };
        xhr.onerror = () => this.onXHRError(xhr);
        xhr.onprogress = this.onXHRProgress;
        xhr.send();
    };

    onXHRError = (xhr) => {
        const err = isJSON(xhr.responseText)
            ? JSON.parse(xhr.responseText).err
            : xhr.status;
        this.dispatch("onPageLoadingError", { err });
    };

    onXHRProgress = (e) => {
        const { loaded, total } = e;
        const progress = loaded < total ? e.loaded / e.total : 1;
        this.dispatch("onPageLoadingProgress", { progress });
    };

    preloadStyles = (doc) => {
        $$('link[rel="stylesheet"]', doc.documentElement).forEach((link) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", link.href, true);
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 400) {
                    const styleTag = document.createElement("style");
                    styleTag.textContent = xhr.responseText;
                    replaceNode(styleTag, link);
                } else {
                    this.onXHRError(xhr);
                }
            };
            xhr.onerror = () => this.onXHRError(xhr);
            xhr.send();
        });
    };

    showDestPage = () => {
        const doc = this.cache[this.destUrl];

        if (document.documentElement != doc.documentElement) {
            const eBeforePageHide = new Event("beforepagehide");
            const eBeforePageShow = new Event("beforepageshow");
            const ePageHide = new Event("pagehide");
            const ePageShow = new Event("pageshow");
            const docToHide = document.documentElement;
            const docToShow = doc.documentElement;

            docToHide.dispatchEvent(eBeforePageHide);
            docToShow.dispatchEvent(eBeforePageShow);

            document.replaceChild(docToShow, docToHide);

            history[this.pushState ? "pushState" : "replaceState"](
                { url: this.destUrl, from: this.currentUrl },
                "",
                this.destUrl
            );

            if (!doc.loaded) {
                for (let i = 0; i < doc.scriptsInHead.length; ++i) {
                    document.head.appendChild(doc.scriptsInHead[i]);
                }

                for (let i = 0; i < doc.scriptsInBody.length; ++i) {
                    document.body.appendChild(doc.scriptsInBody[i]);
                }

                doc.loaded = true;
            }

            docToHide.dispatchEvent(ePageHide);
            docToShow.dispatchEvent(ePageShow);
        }

        this.cleanUp();
    };

    toAbsolutePath = (url) => {
        let absPath;

        if (/^https?:\/\//i.test(url)) {
            absPath = url;
        } else {
            const link = document.createElement("a");
            link.href = url;
            absPath = link.href;
        }

        return absPath.replace(/#.*/, "");
    };

    cleanUp = () => {
        this.lastUrl = this.currentUrl;
        this.currentUrl = this.destUrl;
        this.destUrl = null;
    };
}
