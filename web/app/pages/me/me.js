import { Klass } from "k-util";

import "./me.scss";
import "../../components/tabbar.scss";
import "../../components/feed.scss";
import Page from "../../components/Page";
import Navbar from "../../components/Navbar/Navbar";

const meProto = {
    navbar: new Navbar(),

    constructor() {
        this.Super();
        this.listen();

        if (this.ws) {
            this.ws.onMessage = this.onWsMessage.bind(this);
        }
    },

    onWsMessage(msg) {
        console.log("me.onWsMessage: ", msg);
    }
};

new (Klass(meProto, Page))();
