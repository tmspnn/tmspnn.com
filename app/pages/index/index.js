// External modules
import qs from "qs";

// Local modules
import "./index.scss";
import Page from "@components/Page";
import navbar from "@components/navbar/navbar";
import tabbar from "@components/tabbar/tabbar";
import "@components/tag.scss";
import "@components/feed.scss";

const pageName = "index";

const root = new Page(pageName);
root.prefetch = ["/", "/trending", "/messages", "/me"];

// Child Components
root.$navbar = navbar(pageName, $(".-navbar"), {});
root.$tabbar = tabbar(pageName, $(".-tabbar"), { activeTab: pageName });

// UI logic
const { _refs } = root;
const clearInputBtn = $(".search > div > svg:last-child");

root.onSearchResult = (result) => {
    if (_.isEmpty(result.articles) && _.isEmpty(result.users)) {
        _refs.tipsEmpty.hidden = false;
        _refs.result.hidden = true;
        _refs.tipsAllLoaded.hidden = true;
        _refs.moreResultBtn.hidden = true;
    } else {
        const docFrag = document.createDocumentFragment();
        each(result.articles, (a) => docFrag.appendChild(html2DOM(a.html)));
        each(result.users, (u) => docFrag.appendChild(html2DOM(u.html)));
        clearNode(_refs.result);
        _refs.result.appendChild(docFrag);
        _refs.tipsEmpty.hidden = true;
        _refs.result.hidden = false;
        if (result.articles.length == 10 || result.users.length == 10) {
            _refs.tipsAllLoaded.hidden = true;
            _refs.moreResultBtn.hidden = false;
        } else {
            _refs.tipsAllLoaded.hidden = false;
            _refs.moreResultBtn.hidden = true;
        }
    }
};

_refs.input.on("input", () => {
    const text = _refs.input.value.trim();
    if (text.length > 0) {
        addClass(clearInputBtn, "visible");
        root.dispatch("search", text);
    } else {
        removeClass(clearInputBtn, "visible");
        _refs.tipsEmpty.hidden = true;
        _refs.result.hidden = true;
        _refs.tipsAllLoaded.hidden = true;
        _refs.moreResultBtn.hidden = true;
    }
});

_refs.moreResultBtn.on("click", () => {
    if (root.data.lastSearchText) {
        root.go("/q?" + qs.stringify({ text: root.data.lastSearchText }));
    }
});

clearInputBtn.on("click", () => {
    _refs.input.value = "";
    _refs.input.dispatchEvent(new Event("input"));
});

// Business logic
const { ctrl } = root;

ctrl.search = _.debounce((text) => {
    const cachedResult = at(ctrl, `data.searchCache[${text}]`);

    if (cachedResult) {
        return ctrl.ui("root:onSearchResult", cachedResult);
    }

    ctrl.getJson("/api/search?" + qs.stringify({ text }))
        .then((res) => {
            if (_.isEmpty(res.articles)) {
                res.articles = [];
            }
            if (_.isEmpty(res.users)) {
                res.users = [];
            }
            if (ctrl.data.searchCache) {
                ctrl.data.searchCache[text] = res;
            } else {
                ctrl.data.searchCache = { [text]: res };
            }
            ctrl.data.lastSearchText = text;
            ctrl.ui("root::onSearchResult", res);
        })
        .catch(ctrl.handleException);
}, 1000);

ctrl.onWsMessage = (msg) => {
    console.log("index onWsMessage: ", msg);
};
