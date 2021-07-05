// External modules
import { DOM } from "k-dom";
import { Klass, View } from "k-util";
import dayjs from "dayjs";

// Local modules
import "./ArticleItem.scss";
import T from "./ArticleItem.html";

const ArticleItem = Klass(
    {
        /**
         * @param {Number} data.id
         * @param {String} data.author
         * @param {String} data.author_profile
         * @param {String} data.cover
         * @param {String} data.created_at
         * @param {Number} data.created_by
         * @param {Number} data.pageview
         * @param {Number} data.rating
         * @param {String} data.summary
         * @param {String} data.title
         * @param {Number} data.wordcount
         */
        constructor(data) {
            this.Super();
            this.name = "articleItem";
            this.element = DOM(T);
            this.listen();
            this.sync(data);
        },

        sync(data) {
            this.refs.anchor.href = "/articles/" + data.id;
            this.refs.profile.style.backgroundImage = `url(${data.author_profile})`;
            this.refs.title.textContent = data.title;
            this.refs.author.textContent = data.author;
            this.refs.date.textContent = dayjs(data.created_at).format(
                "MM-DD HH:mm"
            );
        }
    },
    View
);

export default ArticleItem;
