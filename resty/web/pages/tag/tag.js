import { Klass } from "k-util";
//
import "./tag.scss";
import Page from "../../components/Page";
import Navbar from "../../components/Navbar/Navbar";

const Tag = Klass(
    {
        constructor() {
            this.Super();
            this.listen();

            new Navbar({ leftBtn: "back" });

            if (this.ws) {
                this.ws.onMessage = this.onWsMessage.bind(this);
            }
        },

        onWsMessage(msg) {
            console.log("Tag.onWsMessage: ", msg);
        }
    },

    Page
);

new Tag();
