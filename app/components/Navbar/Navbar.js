// External modules
import { Klass, View } from "k-util";

// Local modules
import "./Navbar.scss";

const Navbar = Klass(
    {
        name: "navbar",

        data: { backBtnHidden: true, shareBtnHidden: true },

        element: null,

        /**
         * @param {HTMLElement} element
         * @param {Object?} options
         * @param {String?} options.leftBtn
         * @param {String?} options.rightBtn
         */
        constructor(element, options) {
            this.Super();
            this.element = element;
            this.setData(this.data);

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
        }
    },
    View
);

export default Navbar;
