// External
import "highlight.js/styles/github.css";
import hljs from "highlight.js";

// Local
import "./article.scss";
import Page from "@components/Page";
import PageController from "@components/PageController";

const namespace = "article";

function article() {
    const root = new Page(namespace);

    hljs.highlightAll();

    const ctrl = new PageController(namespace);

    ctrl.onWsMessage = (msg) => {
        console.log("article onWsMessage: ", json);
    };
}

article();
