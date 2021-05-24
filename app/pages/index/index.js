import "./index.scss";
import PageContainer from "@components/PageContainer";
import navbar from "@components/navbar/navbar";
import tabbar from "@components/tabbar/tabbar";
import "@components/feed.scss"; // Static component

const namespace = "index";

/**
 * @property {Number} data.scrollTop
 */
const data = parseJSON($('script[type="application/json"').textContent);

function view() {
    const root = new View(namespace, document.body, data);
    root._name = "root";
    root.pageContainer = new PageContainer(namespace);
    root.navbar = navbar(namespace, $(".-navbar"), {});
    root.tabbar = tabbar(namespace, $(".-tabbar"), { activeTab: "home" });

    // Event listeners
    const container = $(".-page-container");
    container.on("scroll", (e) => {
        data.scrollTop = container.scrollTop;
    });
}

function controller() {
    const indexCtrl = new Controller(namespace);
}

view();
controller();
