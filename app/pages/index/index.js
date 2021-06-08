import "./index.scss";
import Page from "@components/Page";
import PageController from "@components/PageController";
import navbar from "@components/navbar/navbar";
import tabbar from "@components/tabbar/tabbar";
import "@components/feed.scss";

const namespace = "index";

const root = new Page(namespace);
root.prefetch = ["/", "/trending", "/messages", "/me"];

// Components
root.$navbar = navbar(namespace, $(".-navbar"), {});
root.$tabbar = tabbar(namespace, $(".-tabbar"), { activeTab: namespace });

// Controller
const ctrl = new PageController(namespace);

ctrl.onWsMessage = (msg) => {
    console.log("index onWsMessage: ", msg);
};
