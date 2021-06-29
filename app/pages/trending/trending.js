// External modules
import { $ } from "k-dom";
import { Klass } from "k-util";

// Local modules
import "./trending.scss";
import "../../components/tabbar.scss";
import "../../components/feed.scss";
import "../../components/authorCard.scss";
import Page from "../../components/Page";
import Navbar from "../../components/Navbar/Navbar";

const Trending = Klass(
    {
        constructor() {
            this.Super();
            this.element = $("#root");
            this.setData();
            this.listen();

            // Child components
            new Navbar($(".-navbar"));

            // WebSocket
            if (this.ws) {
                this.ws.onMessage = this.onWsMessage.bind(this);
            }
        },

        onWsMessage(msg) {
            console.log("Trending.onWsMessage: ", msg);
        }
    },
    Page
);

new Trending();
