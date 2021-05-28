import immediatelyScrollTo from "@helpers/immediatelyScrollTo";
import PageContainer from "@components/PageContainer";

export default class Page extends View {
    prefetch = [];

    constructor(namespace) {
        const dataTag = $('script[type="application/json"');
        const data = parseJSON(at(dataTag, "textContent")) || {};
        super(namespace, document.body, data);
        this._name = "root";
        this.pageContainer = window._pageContainer || new PageContainer();
        this.pageContainer.captureLinks();

        setTimeout(() => {
            // Prefetch related pages
            each(this.prefetch, (p) => this.pageContainer.loadPage(p));

            // Event listeners
            const container = $(".page-container");

            document.documentElement.on("beforepageshow", (e) => {
                $("body", e.currentTarget).style.visibility = "hidden";
            });

            document.documentElement.on("pageshow", (e) => {
                document.body.style.visibility = "visible";
                if (data.scrollTop > 0) {
                    immediatelyScrollTo(container, data.scrollTop | 0);
                }
            });

            container.on("scroll", () => {
                data.scrollTop = container.scrollTop;
            });
        });
    }
}
