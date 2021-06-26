// External modules
import { $ } from "k-dom";
import { Klass } from "k-util";
import { isEmpty } from "lodash";
import qs from "qs";

// Local modules
import "./index.scss";
import "../../components/tabbar.scss";
import "../../components/tag.scss";
import "../../components/feed.scss";
import Page from "../../components/Page";
import Navbar from "../../components/Navbar/Navbar";

const Index = Klass(
    {
        cachedResult: {},

        lastSearchText: null,

        constructor() {
            this.Super();

            // Data binding
            this.element = $("#root");
            this.bindData({
                tipsEmptyHidden: true,
                resultListHidden: true,
                tipsAllLoadedHidden: true,
                moreResultBtnHidden: true
            });

            // Child components
            this.$navbar = new Navbar($(".-navbar"));

            // Event listeners
            this.refs.clearBtn = $(".search > .container > svg:last-child");
            this.refs.clearBtn.on("click", () => this.onClearBtnClick());

            // WebSocket
            if (this.ws) {
                this.ws.onMessage = this.onWsMessage.bind(this);
            }
        },

        onWsMessage(msg) {
            console.log("Index.onWsMessage: ", msg);
        },

        onInput(e) {
            const text = e.currentTarget.value.trim();
            if (text.length > 0) {
                this.refs.clearBtn.addClass("visible");
                this.search(text);
            } else {
                this.refs.clearBtn.removeClass("visible");
                this.setData({
                    tipsEmptyHidden: true,
                    resultListHidden: true,
                    tipsAllLoadedHidden: true,
                    moreResultBtnHidden: true
                });
            }
        },

        onSearchResult(result) {
            if (isEmpty(result.articles) && isEmpty(result.users)) {
                this.setData({
                    tipsEmptyHidden: false,
                    resultListHidden: true,
                    tipsAllLoadedHidden: true,
                    moreResultBtnHidden: true
                });
            } else {
                // TODO: Create searchResultItems on client side
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

            this.getJSON("/api/search?" + qs.stringify({ text })).then(
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
