// External modules
import { $$, clearNode, replaceNode } from "k-dom";
import { each, Klass } from "k-util";
import kxhr from "k-xhr";

function isSameOrigin(url1, url2) {
    return (
        new URL(url1, location.href).origin ==
        new URL(url2, location.href).origin
    );
}

function cloneScript(script) {
    const cloned = document.createElement("script");
    if (script.type) {
        cloned.type = script.type;
    }
    if (script.src) {
        cloned.src = script.src;
    } else {
        cloned.textContent = script.textContent;
    }
    return cloned;
}

function createDocument(html) {
    // Script tags in htmlDoc won't execute
    const htmlDoc = document.implementation.createHTMLDocument("");
    htmlDoc.documentElement.innerHTML = html;

    const doc = document.implementation.createHTMLDocument("");
    const scriptsInHead = [];
    const scriptsInBody = [];

    // Head
    clearNode(doc.head); // Remove <title></title> in head
    const elementsInHead = htmlDoc.head.children;

    for (let i = 0; i < elementsInHead.length; ++i) {
        const el = elementsInHead[i];
        if (el instanceof HTMLScriptElement) {
            scriptsInHead.push(cloneScript(el));
        } else {
            const clonedEl = doc.importNode(el, true);
            doc.head.appendChild(clonedEl);
        }
    }

    // body
    clearNode(doc.body);
    const elementsInBody = htmlDoc.body.children;

    for (let i = 0; i < elementsInBody.length; ++i) {
        const el = elementsInBody[i];
        if (el instanceof HTMLScriptElement) {
            scriptsInBody.push(cloneScript(el));
        } else {
            const clonedEl = doc.importNode(el, true);
            doc.body.appendChild(clonedEl);
        }
    }

    return {
        documentElement: doc.documentElement,
        loaded: false,
        scriptsInHead,
        scriptsInBody
    };
}

const PageContainer = Klass({
    name: "pageContainer",

    cache: {},

    prevUrl: null,

    currentUrl: "",

    nextUrl: null,

    pushState: false,

    ee: window._ee,

    observer: null,

    constructor() {
        if (!window._container) {
            this.cache[location.href] = {
                documentElement: document.documentElement,
                loaded: true
            };
            history.replaceState(
                {
                    url: this.currentUrl,
                    prev: null
                },
                ""
            );
            window.on("popstate", this._onPopState.bind(this));
            window._container = this;
        }

        this.observer = new MutationObserver((mutationsList) => {
            each(mutationsList, (mutation) => {
                each(mutation.addedNodes, (node) => {
                    if (
                        node instanceof HTMLAnchorElement &&
                        node.hasAttribute("href")
                    ) {
                        window._container.captureLinks(node);
                    }
                });
            });
        });

        this.observer.observe(document.body, { childList: true });
    },

    captureLinks(el) {
        const container = window._container;
        const links = $$("a[href]", el || document.body);

        if (el instanceof HTMLAnchorElement && el.hasAttribute("href"))
            links.push(el);

        each(links, (link) => {
            link.setAttribute("data-href", link.href);
            link.removeAttribute("href");
            link.on("click", container._onLinkClick.bind(container));
        });
    },

    preloadStyles(doc) {
        const stylesToLoad = $$('link[rel="stylesheet"]', doc.documentElement);

        return Promise.all(
            stylesToLoad.map((link) => {
                return kxhr(link.href).then((response) => {
                    const styleTag = document.createElement("style");
                    styleTag.textContent = response;
                    replaceNode(styleTag, link);
                });
            })
        ).then(() => doc);
    },

    go(path, pushState = true) {
        const url = new URL(path, location.href).href;

        if (!isSameOrigin(url, location.href)) {
            return location.assign(url);
        }

        if (url == this.currentUrl || this.nextUrl == url) return;

        this.nextUrl = url;
        this.pushState = pushState;
        this._switchPage();
    },

    _onLinkClick(e) {
        const link = e.currentTarget;
        const url = link.getAttribute("data-href");
        const pushState = !link.hasAttribute("data-nopush");
        this.go(url, pushState);
    },

    _onPopState(e) {
        this.nextUrl = e.state.url;
        this.pushState = false;
        this._switchPage();
    },

    _switchPage() {
        if (this.nextUrl in this.cache) {
            this._replaceDocument();
        } else {
            this._loadPage(this.nextUrl).then(() => {
                this._replaceDocument();
            });
        }
    },

    _loadPage(url) {
        this.ee.emit("global", this.name + ".loading", url);

        return kxhr(url, "get", null, {
            onProgress: (e) => {
                const loaded = e.loaded;
                const total = e.total;
                const progress = loaded < total ? loaded / total : 1;
                this.ee.emit("global", this.name + ".progress", progress);
            }
        })
            .then((response) => {
                const doc = createDocument(response);
                return this.preloadStyles(doc);
            })
            .then((doc) => {
                this.cache[url] = doc;
                this.ee.emit("global", this.name + ".loaded");
            })
            .catch((e) => {
                this.ee.emit("global", this.name + ".failed", e);
                this.nextUrl = null;
            })
            .finally(() => {
                this.ee.emit("global", this.name + ".completed");
            });
    },

    _replaceDocument() {
        const doc = this.cache[this.nextUrl];

        if (doc && doc.documentElement != document.documentElement) {
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
                { url: this.nextUrl, prev: this.currentUrl },
                "",
                this.nextUrl
            );

            if (!doc.loaded) {
                each(doc.scriptsInHead, (script) => {
                    document.head.appendChild(script);
                });

                each(doc.scriptsInBody, (script) => {
                    document.body.appendChild(script);
                });

                doc.loaded = true;
            }

            docToHide.dispatchEvent(ePageHide);
            docToShow.dispatchEvent(ePageShow);

            this._cleanUp();
        }
    },

    _cleanUp() {
        this.prevUrl = this.currentUrl;
        this.currentUrl = this.nextUrl;
        this.nextUrl = null;
    }
});

export default PageContainer;
