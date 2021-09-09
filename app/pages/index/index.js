import { Klass } from "k-util";
import Swiper from "swiper/bundle";
import "swiper/css/bundle";

import "./index.scss";
import "../../components/tabbar.scss";
import "../../components/author.scss";
import "../../components/feed.scss";
import Page from "../../components/Page";
import Navbar from "../../components/Navbar/Navbar";

const indexProto = {
    navbar: new Navbar(),

    swiper: null, // Swiper has recursive reference to self

    constructor() {
        this.Super();
        this.swiper = new Swiper(".swiper", {
            effect: "coverflow",
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: "auto",
            coverflowEffect: {
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true
            },
            autoplay: true,
            pagination: {
                el: ".swiper-pagination"
            }
        });
        this.swiper.on("click", (s) => this.onSlideClick(s.clickedIndex));
    },

    onSlideClick(idx) {}
};

new (Klass(indexProto, Page))();
