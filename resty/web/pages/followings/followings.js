import { Klass } from "k-util";
//
import "./followings.scss";
import Page from "../../components/Page";
import Navbar from "../../components/Navbar/Navbar";
//
const Followings = Klass(
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
            console.log("followings.onWsMessage: ", msg);
        }
    },

    Page
);

new Followings();
