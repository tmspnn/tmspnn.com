import { $$, clearNode, replaceNode } from "k-dom";
import { each, View } from "k-util";
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

export default class Container extends View {
    constructor() {
        super();
        this.namespace = "global";
        this.name = "container";
        this.cache = {};
        this.prevUrl = null;
        this.currentUrl = location.pathname;
        this.nextUrl = null;
        this.pushState = false;

        if (!window._container) {
            this.observer = new MutationObserver((mutationsList) => {
                each(mutationsList, (mutation) => {
                    each(mutation.addedNodes, this.captureLinks);
                });
            });

            this.observer.observe(document, {
                childList: true,
                subtree: true
            });

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

            window.on("popstate", this.onPopState.bind(this));
            window._container = this;
        }
    }

    captureLinks(el) {
        const container = window._container;
        const links = $$("a[href]", el || document.body);

        if (el instanceof HTMLAnchorElement && el.hasAttribute("href")) {
            links.push(el);
        }

        each(links, (link) => {
            link.setAttribute("data-href", link.href);
            link.removeAttribute("href");
            link.on("click", container.onLinkClick.bind(container));
        });
    }

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
    }

    go(path, pushState = true) {
        const url = new URL(path, location.href).href;

        if (!isSameOrigin(url, location.href)) {
            return location.assign(url);
        }

        if (url == this.currentUrl || this.nextUrl == url) return;

        this.nextUrl = url;
        this.pushState = pushState;
        this.switchPage();
    }

    onLinkClick(e) {
        const link = e.currentTarget;
        const url = link.getAttribute("data-href");
        const pushState = !link.hasAttribute("data-nopush");
        this.go(url, pushState);
    }

    onPopState(e) {
        this.nextUrl = e.state.url;
        this.pushState = false;
        this.switchPage();
    }

    switchPage() {
        if (this.nextUrl in this.cache) {
            this.replaceDocument();
        } else {
            this.loadPage(this.nextUrl).then(() => {
                this.replaceDocument();
            });
        }
    }

    loadPage(url) {
        return kxhr(url)
            .then((response) => {
                const doc = createDocument(response);
                return this.preloadStyles(doc);
            })
            .then((doc) => {
                this.cache[url] = doc;
            })
            .catch((e) => {
                this.nextUrl = null;
            });
    }

    replaceDocument() {
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

            this.cleanUp();
        }
    }

    cleanUp() {
        this.prevUrl = this.currentUrl;
        this.currentUrl = this.nextUrl;
        this.nextUrl = null;
    }
}
