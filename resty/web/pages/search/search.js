import { $ } from "k-dom";
import { debounce, isEmpty, last } from "lodash";
import qs from "qs";
import "./search.scss";
import "../../components/tabbar.scss";
import "../../components/Author/Author.scss";
import "../../components/Feed/Feed.scss";
import Author from "../../components/Author/Author";
import Feed from "../../components/Feed/Feed";
import Page from "../../components/Page";
import Navbar from "../../components/Navbar/Navbar";
import appendBatch from "../../helpers/appendBatch";

class Search extends Page {
    constructor() {
        super();
        this.allFeedsLoaded = false;
        this.allResultLoaded = false;
        this.data.search_users = [];
        this.data.search_articles = [];
        this.refs.searchIcon = $(".search-bar > svg:nth-child(2)");
        this.refs.searchIcon.addClass("visible");
        this.refs.xIcon = $(".search-bar > svg:last-child");
        this.refs.xIcon.on("click", this.clearInput.bind(this));
        new Navbar();

        window.on("scroll", this.onScroll.bind(this));
        window.on("touchmove", this.onScroll.bind(this));
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

    search(text, options) {
        this.allResultLoaded = false;
        const { start_user_id, start_article_id } = options;
        const queryString = qs.stringify({
            text,
            start_user_id,
            start_article_id
        });

        this.getJSON("/api/search?" + queryString).then((res) => {
            this.refs.followings.hidden = true;
            this.refs.feeds.hidden = true;

            if (isEmpty(res.users) && isEmpty(res.articles)) {
                this.refs.users.hidden = true;
                this.refs.articles.hidden = true;
                this.refs.empty.hidden = false;
            } else {
                this.data.search_users.push(...res.users);
                this.data.search_articles.push(...res.articles);
                this.clearSearchResult();
                const authors = res.users.map((a) => new Author(a).element);
                const articles = res.articles.map((a) => new Feed(a).element);
                appendBatch(this.refs.users, authors);
                appendBatch(this.refs.articles, articles);
                this.refs.users.hidden = false;
                this.refs.articles.hidden = false;
                this.refs.empty.hidden = true;
                if (res.users.length < 10 && res.articles.length < 10) {
                    this.allResultLoaded = true;
                }
            }
        });
    }

    clearSearchResult() {
        for (let ch of this.refs.users.children) {
            this.removeElement(ch);
        }

        for (let ch of this.refs.articles.children) {
            this.removeElement(ch);
        }
    }

    removeElement(el) {
        if (typeof el.destroy == "function") {
            el.destroy();
        } else if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }

    onScroll() {
        if (document.scrollingElement != this.documentElement) return;

        const text = this.refs.searchInput.value.trim();

        if (text.length > 0 && !this.allResultLoaded) {
            const lastAuthor = last(this.data.search_users);
            const lastArticle = last(this.data.search_articles);
            this.search(text, {
                start_user_id: lastAuthor.id,
                start_article_id: lastArticle.id
            });
        } else if (this.data.uid && !this.allFeedsLoaded) {
            const offset = this.data.latest_feeds.length;
            this.getJSON(`/api/users/${this.data.uid}/feeds?offset=` + offset)
                .then((res) => {
                    if (isEmpty(res)) {
                        this.allFeedsLoaded = true;
                    } else {
                        this.data.latest_feeds.push(...res);
                        const feeds = res.map((a) => new Feed(a).element);
                        appendBatch(this.refs.feeds, feeds);
                    }
                })
                .catch((e) => {
                    if (e.message == "blocked") return;
                });
        }
    }
}

const search = new Search();
search.search = debounce(search.search, 500);
