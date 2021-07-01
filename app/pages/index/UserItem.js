// External modules
import { DOM } from "k-dom";
import { Klass, View } from "k-util";

// Local modules
import T from "./UserItem.html";

const UserItem = Klass(
    {
        /**
         * @param {Number} data.id
         * @param {String} data.profile
         * @param {String} data.nickname
         * @param {String} data.description
         */
        constructor(data) {
            this.Super();
            this.name = "userItem";
            this.element = DOM(T);
            this.listen();
            this.sync(data);
        },

        sync(data) {
            this.refs.anchor.href = "/users/" + data.id;
            this.refs.profile.style.backgroundImage = data.profile
                ? `url(${data.profile})`
                : "linear-gradient(135deg, var(--grey), var(--black))";
            this.refs.nickname.textContent = data.nickname;
            this.refs.description.textContent =
                data.description || "这个人很懒, 什么也没有写...";
        }
    },
    View
);

export default UserItem;
