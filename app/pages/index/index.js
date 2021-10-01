import { last, template } from "lodash";
import { DOM } from "k-dom";
import { Klass } from "k-util";
import Swiper from "swiper/bundle";
import "swiper/css/bundle";

import "./index.scss";
import "../../components/tabbar.scss";
import "../../components/author.scss";
import "../../components/feed.scss";
import Page from "../../components/Page";
import Navbar from "../../components/Navbar/Navbar";
import FeedHtml from "./Feed";

const indexProto = {
    navbar: new Navbar(),

    swiper: null, // Swiper has recursive reference to self

    allArticlesLoaded: false,

    feedT: template(FeedHtml),

    constructor() {
        this.Super();
        this.listen();
        this.swiper = new Swiper(".swiper", {
            effect: "coverflow",
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: "auto",
            loop: true,
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

        window.addEventListener("scroll", this.onScroll.bind(this));
        window.addEventListener("touchmove", this.onScroll.bind(this));
        window._container.observer.observe(this.refs.articlesSection, {
            childList: true
        });
    },

    onSlideClick(idx) {
        const items = this.data.carousel_items;
        const clickedItem = items[idx % items.length];

        switch (clickedItem.type) {
            case 1:
                this.go("/articles/" + clickedItem.id);
                break;
            case 2:
                this.go("/authors/" + clickedItem.id);
                break;
            default:
                location.href = clickedItem.url;
                break;
        }
    },

    onScroll() {
        if (
            document.scrollingElement == this.documentElement &&
            !this.allArticlesLoaded
        ) {
            const docEl = document.scrollingElement;
            if (
                docEl.offsetHeight - docEl.scrollTop <
                1.5 * window.innerHeight
            ) {
                const last_article = last(this.data.latest_articles);
                this.getJSON("/api/articles?lt=" + last_article.id).then(
                    (res) => {
                        if (!res) return;
                        if (res.length > 0) {
                            this.data.latest_articles.push(...res);
                            const nodes = res.map((a) => DOM(this.feedT(a)));
                            const docFrag = document.createDocumentFragment();
                            nodes.forEach((node) => docFrag.appendChild(node));
                            window.s = this.refs.articlesSection;
                            this.refs.articlesSection.appendChild(docFrag);
                        } else {
                            this.allArticlesLoaded = true;
                        }
                    }
                );
            }
        }
    }
};

new (Klass(indexProto, Page))();
