// External modules
import { $ } from "k-dom";
import { Klass } from "k-util";

// Local modules
import "./me.scss";
import "../../components/tabbar.scss";
import "../../components/feed.scss";
import Page from "../../components/Page";
import Navbar from "../../components/Navbar/Navbar";

const Me = Klass(
    {
        constructor() {
            this.Super();
            this.element = document.body;
            this.listen();

            // Child components
            new Navbar($(".-navbar"), { rightBtn: "settings" });

            // WebSocket
            if (this.ws) {
                this.ws.onMessage = this.onWsMessage.bind(this);
            }
        },

        onWsMessage(msg) {
            console.log("Me.onWsMessage: ", msg);
        },

        settings() {
            this.go("/settings");
        }
    },
    Page
);

new Me();
