import { Klass, View } from "k-util";
import { $ } from "k-dom";

import "./Navbar.scss";

const navbarProto = {
    name: "navbar",

    /**
     * @param {Object} options
     * @param {String} options.leftBtn
     * @param {String} options.rightBtn
     */
    constructor(options) {
        this.Super();
        this.element = $(".-navbar");
        this.listen();

        if (options && options.leftBtn) {
            const btn = this.refs[options.leftBtn + "Btn"];
            if (btn) btn.hidden = false;
        }

        if (options && options.rightBtn) {
            const btn = this.refs[options.rightBtn + "Btn"];
            if (btn) btn.hidden = false;
        }
    },

    stepBack() {
        this.dispatch(".stepBack");
    },

    share() {
        this.dispatch(".share");
    },

    close() {
        this.dispatch(".close");
    },

    settings() {
        this.dispatch(".settings");
    },

    publish() {
        this.dispatch(".publish");
    }
};

export default Klass(navbarProto, View);
