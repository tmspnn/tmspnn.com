import isSameOrigin from "@helpers/isSameOrigin";
import createDocument from "@helpers/createDocument";

export default class PageContainer extends View {
    cache = {};
    lastUrl = null;
    currentUrl = location.href.replace(/#.*/, "");
    destUrl = null;
    pushState = false;

    constructor(namespace) {
        super(namespace);
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

        const container = window._pageContainer;

        $$("a").forEach((link) => {
            link.on("click", (e) => container.onLinkClick(e), {
                passive: false
            });
        });
    }

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
        // Transform relative path to absolute path
        const link = document.createElement("a");
        link.href = url;
        const parsedUrl = link.href.replace(/#.*/, "");

        if (!isSameOrigin(parsedUrl) || this.currentUrl == parsedUrl) return;

        this.destUrl = parsedUrl;
        this.pushState = pushState;
        this.switchPage();
    };

    switchPage = () => {
        if (this.destUrl in this.cache) {
            this.showDestPage();
        } else {
            this.loadPage(this.showDestPage);
        }
    };

    loadPage = (onLoad) => {
        const xhr = new XMLHttpRequest();
        xhr._url = this.destUrl;
        xhr.open("GET", this.destUrl, true);
        xhr.onload = () => {
            this.destUrl = xhr.responseURL;
            if (xhr.status >= 200 && xhr.status < 400) {
                this.cache[this.destUrl] = createDocument(xhr.responseText);
                onLoad();
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

            if (!doc.loaded) {
                for (let i = 0; i < doc.scriptsInHead.length; ++i) {
                    document.head.appendChild(doc.scriptsInHead[i]);
                }

                for (let i = 0; i < doc.scriptsInBody.length; ++i) {
                    document.body.appendChild(doc.scriptsInBody[i]);
                }

                doc.loaded = true;
            }

            history[this.pushState ? "pushState" : "replaceState"](
                { url: this.destUrl, from: this.currentUrl },
                "",
                this.destUrl
            );

            docToHide.dispatchEvent(ePageHide);
            docToShow.dispatchEvent(ePageShow);
        }

        this.cleanUp();
    };

    cleanUp = () => {
        this.lastUrl = this.currentUrl;
        this.currentUrl = this.destUrl;
        this.destUrl = null;
    };
}
