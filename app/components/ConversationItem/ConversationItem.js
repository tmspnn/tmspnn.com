// External modules
import { clearNode, DOM } from "k-dom";
import { Klass, View } from "k-util";
import dayjs from "dayjs";

// Local modules
import T from "./ConversationItem.html";
import "./ConversationItem.scss";

const assign = Object.assign;

const ConversationItem = Klass(
    {
        constructor(element, data) {
            this.Super();
            this.name = `conversation(${data.id})`;
            this.element = element || DOM(T);
            this.data = assign(data, {
                dotHidden: true,
                mutedHidden: true,
                lastUpdated: dayjs(data.last_message.created_at).format(
                    "MM-DD HH:mm"
                ),
                link: "/conversations/" + data.id
            });
            this.bindData();
            this.listen();
        },

        setProfiles() {
            clearNode(this.refs.profilesDiv);

            for (const p of this.data.profiles) {
                const img = DOM(`<img src="${p.profile}">`);
                this.refs.profilesDiv.appendChild(img);
            }
        },

        onMessage(msg) {
            this.setData({
                dotHidden: false,
                last_message: msg,
                lastUpdated: dayjs(msg.created_at).format("MM-DD HH:mm")
            });
        },

        onClick() {
            this.setData("dotHidden", true);
        }
    },
    View
);

export default ConversationItem;
