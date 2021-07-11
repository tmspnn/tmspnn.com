import { Klass } from "k-util";
//
import "./followers.scss";
import Page from "../../components/Page";
import Navbar from "../../components/Navbar/Navbar";
//
const Followers = Klass(
    {
        constructor() {
            this.Super();
            this.listen();

            new Navbar({ leftBtn: "back" });

            // WebSocket
            if (this.ws) {
                this.ws.onMessage = this.onWsMessage.bind(this);
            }
        },

        onWsMessage(msg) {
            console.log("Followers.onWsMessage: ", msg);
        }
    },

    Page
);

new Followers();
