import "./trending.scss";
import Page from "@components/Page";
import navbar from "@components/navbar/navbar";
import tabbar from "@components/tabbar/tabbar";
import "@components/feed.scss";
import "@components/authorCard.scss";

const namespace = "trending";

/**
 * @property {Number} root._data.scrollTop
 */
const root = new Page(namespace);
root.prefetch = ["/", "/messages", "/me"];
root.$navbar = navbar(namespace, $(".-navbar"), {});
root.$tabbar = tabbar(namespace, $(".-tabbar"), { activeTab: namespace });

const ctrl = new Controller(namespace);
