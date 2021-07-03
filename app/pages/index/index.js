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
import ArticleItem from "./ArticleItem";
import UserItem from "./UserItem";

const Index = Klass(
    {
        cachedResult: {},

        lastSearchText: null,

        constructor() {
            this.Super();
            this.element = document.body;
            this.listen();

            new Navbar($(".-navbar"));

            this.refs.clearBtn = $(".search > .container > svg:last-child");
            this.refs.clearBtn.on("click", () => this.onClearBtnClick());

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

        onInput: debounce(function () {
            const {
                input,
                clearBtn,
                result,
                tipsEmpty,
                moreResultBtn,
                tipsAllLoaded,
                main
            } = this.refs;

            const text = input.value.trim();

            if (text.length > 0) {
                clearBtn.addClass("visible");
                this.search(text);
            } else {
                clearBtn.removeClass("visible");
                result.hidden = true;
                tipsEmpty.hidden = true;
                tipsAllLoaded.hidden = true;
                moreResultBtn.hidden = true;
                main.hidden = false;
            }
        }, 500),

        onSearchResult(res) {
            this.dispatch("articleItem.destroy");
            this.dispatch("userItem.destroy");

            this.refs.main.hidden = true;
            this.refs.result.hidden = false;
            this.refs.tipsEmpty.hidden = true;
            this.refs.tipsAllLoaded.hidden = true;
            this.refs.moreResultBtn.hidden = true;

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
                    this.refs.moreResultBtn.hidden = false;
                }
            }
        },

        onMoreResultBtnClick() {
            if (this.lastSearchText) {
                this.go("/q?" + qs.stringify({ text: this.lastSearchText }));
            }
        },

        onClearBtnClick() {
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
