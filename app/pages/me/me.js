import "./me.scss";
import Page from "@components/Page";
import navbar from "@components/navbar/navbar";
import tabbar from "@components/tabbar/tabbar";

const namespace = "me";

/**
 * @property {Number} root._data.scrollTop
 */
const root = new Page(namespace);
root.prefetch = ["/", "trending", "/messages"];
root.$navbar = navbar(namespace, $(".-navbar"), {});
root.$tabbar = tabbar(namespace, $(".-tabbar"), { activeTab: namespace });

const ctrl = new Controller(namespace);
