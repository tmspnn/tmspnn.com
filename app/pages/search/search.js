import { $ } from "k-dom";
import { debounce, template, isEmpty } from "lodash";
import "./search.scss";
import "../../components/tabbar.scss";
import "../../components/Author/Author.scss";
import "../../components/Feed/Feed.scss";
import FeedT from "../../components/Feed/Feed.html";
import Page from "../../components/Page";
import Navbar from "../../components/Navbar/Navbar";

class Search extends Page {
    constructor() {
        super();
        this.allResultsLoaded = false;
        this.feedT = template(FeedT);
        this.refs.searchIcon = $(".search-bar > svg:nth-child(2)");
        this.refs.searchIcon.addClass("visible");
        this.refs.xIcon = $(".search-bar > svg:last-child");
        this.refs.xIcon.on("click", this.clearInput.bind(this));
        new Navbar();
    }

    onInput(e) {
        const text = e.currentTarget.value.trim();
        if (text.length > 0) {
            this.refs.searchIcon.removeClass("visible");
            this.refs.xIcon.addClass("visible");
            this.search(text);
        } else {
            this.refs.searchIcon.addClass("visible");
            this.refs.xIcon.removeClass("visible");
            this.refs.empty.hidden = true;
            this.refs.users.hidden = true;
            this.refs.articles.hidden = true;
            this.refs.followings.hidden = false;
            this.refs.feeds.hidden = false;
        }
    }

    clearInput() {
        this.refs.searchInput.value = "";
        this.onInput({ currentTarget: this.refs.searchInput });
    }

    search(text) {
        this.getJSON("/api/search?text=" + encodeURIComponent(text)).then(
            (res) => {
                if (isEmpty(res.users) && isEmpty(res.articles)) {
                    this.refs.users.hidden = true;
                    this.refs.articles.hidden = true;
                    this.refs.empty.hidden = false;
                }
            }
        );
    }
}

const search = new Search();
search.search = debounce(search.search, 500);
