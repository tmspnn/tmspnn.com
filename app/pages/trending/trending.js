import { Klass } from "k-util";
//
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
            this.listen();

            new Navbar();

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
