import "./index.scss";
import Page from "@components/Page";
import navbar from "@components/navbar/navbar";
import tabbar from "@components/tabbar/tabbar";
import "@components/feed.scss";

const pageName = "index";

const root = new Page(pageName);
root.prefetch = ["/", "/trending", "/messages", "/me"];

// Child Components
root.$navbar = navbar(pageName, $(".-navbar"), {});
root.$tabbar = tabbar(pageName, $(".-tabbar"), { activeTab: pageName });

// Business logic
root.ctrl.onWsMessage = (msg) => {
    console.log("index onWsMessage: ", msg);
};
