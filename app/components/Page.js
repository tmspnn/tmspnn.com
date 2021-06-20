import immediatelyScrollTo from "@helpers/immediatelyScrollTo";
import PageContainer from "@components/PageContainer";
import PageController from "@components/PageController";
import toast from "@components/toast/toast";
import customSpinner from "@components/customSpinner";

/**
 * @property {string[]} prefetch
 * @property {object} data
 * @property {number} data.scrollTop
 * @property {PageController} ctrl
 * @method {(string|int) => void} go
 */
export default class Page extends View {
    prefetch = [];

    data =
        parseJSON(at($('script[type="application/json"'), "textContent")) || {};

    ctrl = null;

    docElement = document.documentElement;

    constructor(name) {
        super(name, document.body);
        this._name = "root";

        // Child components
        this.$toast = toast(name);
        this.$customSpinner = customSpinner(name);
        this.$pageContainer = window._pageContainer || new PageContainer();

        // UI logic
        setTimeout(() => {
            this.$pageContainer.captureLinks();

            // Fetch styles of the current page
            this.$pageContainer.preloadStyles(document);

            // Prefetch related pages
            each(this.prefetch, (p) => this.$pageContainer.loadPage(p));

            // Event listeners
            const container = $(".page-container");

            document.documentElement.on("pageshow", () => {
                if (this.data.scrollTop > 0) {
                    immediatelyScrollTo(container, this.data.scrollTop | 0);
                }
            });

            container.on("scroll", () => {
                this.data.scrollTop = container.scrollTop;
            });
        });

        // Business logic
        this.ctrl = new PageController(name, this.data);

        this.ctrl.onWsMessage = console.log;
    }

    go = (urlOrStep) => {
        if (typeof urlOrStep == "string") {
            this.$pageContainer.toPage(urlOrStep);
        } else if (typeof urlOrStep == "number") {
            history.go(urlOrStep);
        }
    };
}
