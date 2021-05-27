import isSameOrigin from "@helpers/isSameOrigin";
import createDocument from "@helpers/createDocument";

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
            link.on("click", (e) => container.onLinkClick(e), {
                passive: false
            });
        });
    };

    onLinkClick = (e) => {
        const link = e.currentTarget;
        const url = link.href.replace(/#.*/, "");

        if (!isSameOrigin(url)) return;

        e.preventDefault();
        e.stopPropagation();

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

    loadPage = (url, onLoad, force = false) => {
        const parsedUrl = this.toAbsolutePath(url);

        if (!isSameOrigin(url)) return;

        if (parsedUrl in this.cache && !force) return;

        const xhr = new XMLHttpRequest();
        xhr.open("GET", parsedUrl, true);
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 400) {
                this.cache[xhr.responseURL] = createDocument(xhr.responseText);
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

            docToHide.dispatchEvent(ePageHide);

            if (doc.loaded) {
                docToShow.dispatchEvent(ePageShow);
            } else {
                for (let i = 0; i < doc.scriptsInHead.length; ++i) {
                    document.head.appendChild(doc.scriptsInHead[i]);
                }

                for (let i = 0; i < doc.scriptsInBody.length; ++i) {
                    document.body.appendChild(doc.scriptsInBody[i]);
                }

                doc.loaded = true;

                setTimeout(() => {
                    docToShow.dispatchEvent(ePageShow);
                }, 52); // Three frames, 17 * 3 = 51
            }
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
