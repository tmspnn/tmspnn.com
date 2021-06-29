import { $ } from "k-dom";
import { each, Klass, View } from "k-util";

const assign = Object.assign;

const RatingBar = Klass(
    {
        name: "ratingBar",

        text: ["很差", "差", "一般", "好", "很好"],

        constructor(element, data) {
            this.Super();
            this.element = element;
            this.setData(
                assign(data, {
                    rated: data.rating > 0,
                    spanText: ""
                })
            );
        },

        onStarClick(e) {
            const div = e.currentTarget;
            const rating = 1 + div.dataset.idx;
            this.setData({
                rating: rating == this.data.rating ? 0 : rating,
                spanText: this.text[rating - 1]
            });
        },

        onRatingChange() {
            each($$("div", this.element), (div, idx) => {
                +idx < this.data.rating
                    ? div.addClass("active")
                    : div.removeClass("active");
            });
        },

        rateArticle() {
            this.dispatch(".rateArticle", this.data.rating);
        },

        onRated(rating) {
            this.setData({ rating, rated: true });
        }
    },
    View
);

export default RatingBar;
