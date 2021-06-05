import "./index.scss";
import Page from "@components/Page";
import PageController from "@components/PageController";
import navbar from "@components/navbar/navbar";
import tabbar from "@components/tabbar/tabbar";
import "@components/feed.scss";
import Ws from "@components/Ws";

const namespace = "index";

/**
 * @property {Number} root._data.scrollTop
 */
const root = new Page(namespace);
root.prefetch = ["/trending", "/messages", "/me"];
root.$navbar = navbar(namespace, $(".-navbar"), {});
root.$tabbar = tabbar(namespace, $(".-tabbar"), { activeTab: namespace });

const ctrl = new PageController(namespace);

ctrl.ws = new Ws();
ctrl.ws.onMessage = (json) => {
    console.log("onMessage: ", json);
};

window.ws = ctrl.ws;
