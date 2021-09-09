import { $ } from "k-dom";
import { Klass } from "k-util";

import "./search.scss";
import "../../components/tabbar.scss";
import "../../components/author.scss";
import "../../components/feed.scss";
import Page from "../../components/Page";
import Navbar from "../../components/Navbar/Navbar";

const searchProto = {
    navbar: new Navbar(),

    constructor() {
        this.Super();
        this.listen();
        this.refs.searchIcon = $(".search-bar > svg:nth-child(2)");
        this.refs.searchIcon.addClass("visible");
        this.refs.xIcon = $(".search-bar > svg:last-child");
        this.refs.xIcon.on("click", () => this.clearInput());
    },

    onInput(e) {
        const text = e.currentTarget.value.trim();
        if (text.length > 0) {
            this.refs.searchIcon.removeClass("visible");
            this.refs.xIcon.addClass("visible");
            console.log("search keyword: " + text);
        } else {
            this.refs.searchIcon.addClass("visible");
            this.refs.xIcon.removeClass("visible");
        }
    },

    clearInput() {
        this.refs.searchInput.value = "";
        this.onInput({ currentTarget: this.refs.searchInput });
    }
};

new (Klass(searchProto, Page))();
