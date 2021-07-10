import { clearNode, DOM } from "k-dom";
import { each, Klass, View } from "k-util";
import dayjs from "dayjs";
//
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
            each(data.meta_members, (m) => {
                if (m.id == data.uid) return;
                const img = DOM(
                    `<img src="https://tmspnn.obs.cn-east-2.myhuaweicloud.com/${m.profile}">`
                );
                this.refs.profiles.appendChild(img);
            });
            this.refs.title.textContent =
                data.title ||
                data.meta_members.filter((x) => x.id != data.uid)[0].nickname;

            if (data.latest_message) {
                this.refs.latestMessage.textContent =
                    data.latest_message.nickname +
                    ": " +
                    data.latest_message.text;
            }

            this.refs.lastUpdated.textContent = dayjs(data.updated_at).format(
                "MM-DD HH:mm"
            );
        },

        onMessage(msg) {
            this.data.latest_message = msg;
            this.refs.dot.hidden = false;
            this.refs.latestMessage.textContent =
                msg.nickname + ": " + msg.text;
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
