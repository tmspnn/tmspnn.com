import "./trending.scss";
import Page from "@components/Page";
import navbar from "@components/navbar/navbar";
import tabbar from "@components/tabbar/tabbar";
import "@components/feed.scss";
import "@components/authorCard.scss";

function trending() {
    const pageName = "trending";

    const root = new Page(pageName);
    root.prefetch = ["/", "/trending", "/messages", "/me"];

    // Child components
    root.$navbar = navbar(pageName, $(".-navbar"), {});
    root.$tabbar = tabbar(pageName, $(".-tabbar"), { activeTab: pageName });
}

trending();
