import { createStyleElement, filterVisibleElements } from "k-dom";
import isSameOrigin from "@helpers/isSameOrigin";
import createDocument from "@helpers/createDocument";

export default class PageContainer extends View {
    defaultStyle = `.-page-container > * {
      transition: all 200ms ease;
    }

    .-page-container > .invisible {
      opacity: 0;
      transform: translate3d(0, 1rem, 0);
    }`;

    cache = {};
    lastUrl = null;
    currentUrl = location.href.replace(/#.*/, "");
    destUrl = null;
    transitingElementsCount = 0;
    shouldPushState = false;
    emptyCb = () => {};
    next = this.emptyCb;

    constructor(namespace) {
        super(namespace);
        this._name = "pageContainer";

        if (!$("style.-page-container", document.head)) {
            this.insertDefaultStyle();
        }

        if (!window._pageContainer) {
            this.cache[location.href] = {
                documentElement: document.documentElement,
                loaded: true
            };
            history.replaceState({ url: this.currentUrl, from: null }, "");
            window.on("popstate", this.onPopState);
            window._pageContainer = this;
        }

        const container = window._pageContainer || this;

        $$("a").forEach((a) => {
            a.on("click", (e) => container.onLinkClick(e), { passive: false });
        });
    }

    insertDefaultStyle = (doc = document) => {
        const style = createStyleElement(this.defaultStyle);
        addClass(style, ".-page-container");
        const head = $("head", doc);
        head.insertBefore(style, head.firstChild);
    };

    onLinkClick = (e) => {
        const link = e.currentTarget;
        const url = link.href.replace(/#.*/, "");

        if (!isSameOrigin(url)) return;

        e.preventDefault();
        e.stopPropagation();

        if (this.currentUrl == url || this.destUrl == url) return;

        this.destUrl = url;
        this.shouldPushState = !link.hasAttribute("data-nopush");
        this.switchPage();
    };

    onPopState = (e) => {
        this.destUrl = e.state.url;
        this.shouldPushState = false;
        this.switchPage();
    };

    toPage = (url, shouldPushState = true) => {
        // Transform relative path to absolute path
        const link = document.createElement("a");
        link.href = url;
        const parsedUrl = link.href.replace(/#.*/, "");

        if (!isSameOrigin(parsedUrl) || this.currentUrl == parsedUrl) return;

        this.destUrl = parsedUrl;
        this.shouldPushState = shouldPushState;
        this.switchPage();
    };

    switchPage = () => {
        const elementsToHide = filterVisibleElements(
            $$(".-page-container > :not(.invisible)")
        );

        if (elementsToHide.length > 0 && this.transitingElementsCount == 0) {
            // Hide current page
            elementsToHide.forEach((el) => {
                ++this.transitingElementsCount;
                el._onceHandler = (e) => this.onElementTransitionEnd(e);
                el.on("transitionend", el._onceHandler);
                addClass(el, "invisible");
            });
        } else {
            setTimeout(this.next);
        }

        // Load new page
        if (!(this.destUrl in this.cache)) {
            this.loadPage();
        }

        this.next = this.showDestPage;
    };

    onElementTransitionEnd = (e) => {
        const el = e.currentTarget;
        el.off("transitionend", el._onceHandler);
        delete el._onceHandler;

        if (--this.transitingElementsCount == 0) {
            this.next();
        }
    };

    loadPage = () => {
        const xhr = new XMLHttpRequest();
        xhr._url = this.destUrl;
        xhr.open("GET", this.destUrl, true);
        xhr.onload = () => {
            const responseUrl = xhr.responseURL || xhr._url;

            if (xhr.status >= 200 && xhr.status < 400) {
                const docModel = createDocument(xhr.responseText);
                this.insertDefaultStyle(docModel.documentElement);
                this.cache[responseUrl] = docModel;

                // In case of redirection
                if (this.destUrl == xhr._url) {
                    this.destUrl = responseUrl;
                    this.next();
                }
            } else {
                this.onXHRError(xhr);
            }
        };
        xhr.onerror = () => this.onXHRError(xhr);
        xhr.onprogress = (e) => this.onXHRProgress(e);
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

    showDestPage = () => {
        if (this.transitingElementsCount != 0) return;

        const doc = this.cache[this.destUrl];

        if (!doc) return;

        const elementsToShow = $$(".-page-container > *", doc.documentElement);

        if (elementsToShow.length > 0) {
            elementsToShow.forEach((el) => addClass(el, "invisible"));

            if (document.documentElement != doc.documentElement) {
                this.loadDocument(doc);
            }

            setTimeout(() => {
                const transitingElements = filterVisibleElements(
                    $$(".-page-container > .invisible")
                );

                transitingElements.forEach((el) => {
                    ++this.transitingElementsCount;
                    el._onceHandler = (e) => this.onElementTransitionEnd(e);
                    el.on("transitionend", el._onceHandler);
                    removeClass(el, "invisible");
                });
            }, 20);
        } else {
            setTimeout(this.next);
        }

        if (this.shouldPushState) {
            history.pushState(
                { url: this.destUrl, from: this.currentUrl },
                "",
                this.destUrl
            );
        }

        this.next = this.cleanUp;
    };

    loadDocument = (doc) => {
        document.replaceChild(doc.documentElement, document.documentElement);

        if (!doc.loaded) {
            for (let i = 0; i < doc.scriptsInHead.length; ++i) {
                document.head.appendChild(doc.scriptsInHead[i]);
            }

            for (let i = 0; i < doc.scriptsInBody.length; ++i) {
                document.body.appendChild(doc.scriptsInBody[i]);
            }

            doc.loaded = true;
        }
    };

    cleanUp = () => {
        this.lastUrl = this.currentUrl;
        this.currentUrl = this.destUrl;
        this.destUrl = null;
        this.next = this.emptyCb;
    };
}