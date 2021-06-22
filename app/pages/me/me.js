import "./me.scss";
import Page from "@components/Page";
import navbar from "@components/navbar/navbar";
import tabbar from "@components/tabbar/tabbar";

function me() {
    const pageName = "me";

    const root = new Page(pageName);
    root.$navbar = navbar(pageName, $(".-navbar"), {});
    root.$tabbar = tabbar(pageName, $(".-tabbar"), { activeTab: pageName });
}

me();
