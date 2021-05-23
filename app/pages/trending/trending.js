import "./trending.scss";
import PageContainer from "@components/PageContainer";
import navbar from "@components/navbar/navbar";
import tabbar from "@components/tabbar/tabbar";

// Metadata
const namespace = "trending";
const data = parseJSON($('script[type="application/json"').textContent);

// View
const root = new View(namespace, document.body, data);
root._name = "root";
root.pageContainer = new PageContainer(namespace);
root.navbar = navbar(namespace, $(".-navbar"), {});
root.tabbar = tabbar(namespace, $(".-tabbar"), { activeTab: "trending" });

// Controller
const trendingCtrl = new Controller(namespace);
