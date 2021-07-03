// External modules
import { clearNode, DOM } from "k-dom";
import { each, Klass, View } from "k-util";
import dayjs from "dayjs";

// Local modules
import T from "./ConversationItem.html";
import "./ConversationItem.scss";

const ConversationItem = Klass(
    {
        constructor(element, data) {
            this.Super();
            this.name = `conversation(${data.id})`;
            this.element = element || DOM(T);
            this.data = data;
            this.listen();
            this.sync(data);
        },

        sync(data) {
            this.element.href = "/conversations/" + data.id;
            clearNode(this.refs.profiles);
            each(data.profiles, (p) => {
                const img = DOM(`<img src="${p.profile}">`);
                this.refs.profiles.appendChild(img);
            });
            this.refs.title.textContent = data.title;
            this.refs.lastMessage.textContent =
                data.latest_messages[data.latest_messages.length - 1].text ||
                "...";
            this.refs.lastUpdated.textContent = dayjs(data.created_at).format(
                "MM-DD HH:mm"
            );
        },

        onMessage(msg) {
            this.data.latest_messages[this.data.latest_messages.length - 1] =
                msg;
            this.refs.dot.hidden = false;
            this.refs.lastMessage.textContent = msg.text;
            this.refs.lastUpdated.textContent = dayjs(msg.created_at).format(
                "MM-DD HH:mm"
            );
        },

        onClick() {
            this.refs.dot.hidden = true;
        },

        onBroadcast(name, method) {
            if (this.name == name) {
                this[method].call(this);
            }
        },

        hideDot() {
            this.refs.dot.hidden = true;
        }
    },
    View
);

export default ConversationItem;
