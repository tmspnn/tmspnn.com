// External modules
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
        constructor(element, options) {
            this.Super();
            this.element = element;
            this.setData({
                backBtnHidden: true,
                shareBtnHidden: true,
                closeBtnHidden: true,
                publishBtnHidden: true
            });
            this.listen();

            if (options && options.leftBtn) {
                this.setData(options.leftBtn + "BtnHidden", false);
            }

            if (options && options.rightBtn) {
                this.setData(options.rightBtn + "BtnHidden", false);
            }
        },

        clickBackBtn() {
            this.dispatch(".stepBack");
        },

        clickShareBtn() {
            this.dispatch(".share");
        },

        clickCloseBtn() {
            this.dispatch(".close");
        },

        clickPublishBtn() {
            this.dispatch(".publish");
        }
    },
    View
);

export default Navbar;
