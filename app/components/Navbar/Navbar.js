// External modules
import { $ } from "k-dom";
import { Klass, View } from "k-util";

// Local modules
import "./Navbar.scss";

const Navbar = Klass(
    {
        name: "navbar",

        /**
         * @param {HTMLElement} element
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
    },
    View
);

export default Navbar;
