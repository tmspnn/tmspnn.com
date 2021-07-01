// External modules
import { DOM } from "k-dom";
import { Klass, View } from "k-util";

// Local modules
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
            this.refs.title.textContent = data.title;
            this.refs.author.textContent = data.author;
            this.refs.pageview.textContent = data.pageview;
        }
    },
    View
);

export default ArticleItem;
