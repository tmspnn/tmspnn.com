// External modules
import { $, DocFrag } from "k-dom";
import { Klass } from "k-util";
import { isEmpty, debounce } from "lodash";
import qs from "qs";

// Local modules
import "./index.scss";
import "../../components/tabbar.scss";
import "../../components/tag.scss";
import "../../components/feed.scss";
import Page from "../../components/Page";
import Navbar from "../../components/Navbar/Navbar";
import ArticleItem from "./ArticleItem/ArticleItem";
import UserItem from "./UserItem";

const Index = Klass(
    {
        cachedResult: {},

        lastSearchText: null,

        constructor() {
            this.Super();
            this.listen();

            new Navbar();

            this.refs.clearBtn = $(".search > .container > svg:last-child");
            this.refs.clearBtn.on("click", () => this.clickClearBtn());

            window._container.observer.observe(this.refs.ul, {
                childList: true
            });

            if (this.ws) {
                this.ws.onMessage = this.onWsMessage.bind(this);
            }
        },

        onWsMessage(msg) {
            console.log("Index.onWsMessage: ", msg);
        },

        input: debounce(function () {
            const text = this.refs.input.value.trim();

            if (text.length > 0) {
                this.refs.clearBtn.addClass("visible");
                this.search(text);
            } else {
                this.refs.clearBtn.removeClass("visible");
                this.refs.result.hidden = true;
                this.refs.tipsEmpty.hidden = true;
                this.refs.tipsAllLoaded.hidden = true;
                this.refs.moreBtn.hidden = true;
                this.refs.main.hidden = false;
            }
        }, 500),

        onSearchResult(res) {
            this.dispatch("articleItem.destroy");
            this.dispatch("userItem.destroy");

            this.refs.main.hidden = true;
            this.refs.result.hidden = false;
            this.refs.tipsEmpty.hidden = true;
            this.refs.tipsAllLoaded.hidden = true;
            this.refs.moreBtn.hidden = true;

            if (isEmpty(res.articles) && isEmpty(res.users)) {
                this.refs.tipsEmpty.hidden = false;
            } else {
                this.refs.ul.appendChild(
                    DocFrag(
                        ...res.articles.map((a) => new ArticleItem(a).element),
                        ...res.users.map((u) => new UserItem(u).element)
                    )
                );

                if (res.articles.length < 10 && res.users.length < 10) {
                    this.refs.tipsAllLoaded.hidden = false;
                } else {
                    this.refs.moreBtn.hidden = false;
                }
            }
        },

        clickMoreBtn() {
            if (this.lastSearchText) {
                this.go("/q?" + qs.stringify({ text: this.lastSearchText }));
            }
        },

        clickClearBtn() {
            this.refs.input.value = "";
            this.refs.input.dispatchEvent(new Event("input"));
        },

        search(text) {
            if (this.cachedResult[text]) {
                return this.onSearchResult(this.cachedResult[text]);
            }

            return this.getJSON("/api/search?" + qs.stringify({ text })).then(
                (res) => {
                    if (isEmpty(res.articles)) {
                        res.articles = [];
                    }
                    if (isEmpty(res.users)) {
                        res.users = [];
                    }
                    if (!this.cachedResult[text]) {
                        this.cachedResult[text] = res;
                    }
                    this.lastSearchText = text;
                    this.onSearchResult(res);
                }
            );
        }
    },
    Page
);

new Index();
