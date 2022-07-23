import { map, isEmpty } from "lodash";
import { $, DocFrag } from "k-dom";
import { find } from "lodash";
import { Klass, parseJSON } from "k-util";
//
import "./conversations.scss";
import "../../components/tabbar.scss";
import ConversationItem from "../../components/ConversationItem/ConversationItem";
import Navbar from "../../components/Navbar/Navbar";
import Page from "../../components/Page";
//
const assign = Object.assign;
//
const Conversations = Klass(
    {
        constructor() {
            this.Super();
            this.listen();
            this.storagePrefix = `uid(${this.data.uid}):`;

            window._container.observer.observe(this.refs.root, {
                childList: true
            });

            // Local conversations
            this.data.conversations =
                parseJSON(
                    localStorage.getItem(this.storagePrefix + "conversations")
                ) || [];

            if (!isEmpty(this.data.conversations)) {
                this.refs.root.appendChild(
                    DocFrag(
                        ...this.data.conversations.map(
                            (conv) =>
                                new ConversationItem(
                                    null,
                                    assign(conv, { uid: this.data.uid })
                                ).element
                        )
                    )
                );
            }

            new Navbar($(".-navbar"));

            // WebSocket
            if (this.ws) {
                this.ws.onMessage = this.onWsMessage.bind(this);
            }
        },

        onNewConversation(conv) {
            const newConv = new ConversationItem(
                null,
                assign(conv, { uid: this.data.uid })
            );
            this.refs.root.insertBefore(
                newConv.element,
                this.refs.root.firstChild
            );
        },

        onWsMessage(msg) {
            console.log("Conversations onWsMessage: ", msg);

            if (!msg) return;

            if (msg.offline_messages) {
                return map(msg.offline_messages, (m) => parseJSON(m)).forEach(
                    (m) => this.onWsMessage(m)
                );
            }

            const existedConv = find(
                this.data.conversations,
                (c) => c.id == msg.conversation_id
            );

            if (existedConv) {
                this.dispatch(
                    `conversation(${msg.conversation_id}).onMessage`,
                    msg
                );
                localStorage.setItem(
                    this.storagePrefix + "conversations",
                    JSON.stringify(this.data.conversations)
                );
            } else {
                this.getJSON(`/api/conversations/${msg.conversation_id}`).then(
                    (res) => {
                        this.data.conversations.unshift(res);
                        this.onNewConversation(res);
                        localStorage.setItem(
                            this.storagePrefix + "conversations",
                            JSON.stringify(this.data.conversations)
                        );
                    }
                );
            }
        }
    },
    Page
);

new Conversations();
