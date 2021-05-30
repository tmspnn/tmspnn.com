import "./index.scss";
import Page from "@components/Page";
import PageController from "@components/PageController";
import navbar from "@components/navbar/navbar";
import tabbar from "@components/tabbar/tabbar";
import "@components/feed.scss";

const namespace = "index";

/**
 * @property {Number} root._data.scrollTop
 */
const root = new Page(namespace);
root.prefetch = ["/trending", "/messages", "/me"];
root.$navbar = navbar(namespace, $(".-navbar"), {});
root.$tabbar = tabbar(namespace, $(".-tabbar"), { activeTab: namespace });

const ctrl = new PageController(namespace);

ctrl.handleException = (e) => {
    if (isJSON(e.message)) {
        const { err } = parseJSON(e.message);
        ctrl.toast(err || "服务器繁忙, 请稍后再试.");
    }
};
