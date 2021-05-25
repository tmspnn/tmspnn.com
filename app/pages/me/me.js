import "./me.scss";
import immediatelyScrollTo from "@helpers/immediatelyScrollTo";
import PageContainer from "@components/PageContainer";
import navbar from "@components/navbar/navbar";
import tabbar from "@components/tabbar/tabbar";

const namespace = "me";

/**
 * @property {Number} data.scrollTop
 */
const data = parseJSON($('script[type="application/json"').textContent);

function view() {
    const root = new View(namespace, document.body, data);
    root._name = "root";
    root.pageContainer = new PageContainer(namespace);
    root.navbar = navbar(namespace, $(".-navbar"), {});
    root.tabbar = tabbar(namespace, $(".-tabbar"), { activeTab: "me" });

    // Event listeners
    const container = $(".-page-container");

    document.documentElement.on("pageshow", () => {
        if (data.scrollTop > 0) {
            immediatelyScrollTo(container, data.scrollTop | 0);
        }
    });

    container.on("scroll", () => {
        data.scrollTop = container.scrollTop;
    });
}

function controller() {
    const meCtrl = new Controller(namespace);
}

view();
controller();
