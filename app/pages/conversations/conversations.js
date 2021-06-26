// External modules
import { $, DocFrag } from "k-dom";
import { find } from "lodash";
import { Klass, parseJSON } from "k-util";

// Local modules
import "./conversations.scss";
import "../../components/tabbar.scss";
import ConversationItem from "../../components/ConversationItem/ConversationItem";
import Navbar from "../../components/Navbar/Navbar";
import Page from "../../components/Page";

const Conversations = Klass(
    {
        constructor() {
            this.Super();
            this.element = $("#root");

            // Local conversations
            this.data.conversations =
                parseJSON(localStorage.getItem("conversations")) || [];

            if (this.data.conversations.length > 0) {
                this.element.appendChild(
                    DocFrag(
                        ...this.data.conversations.map(
                            (conv) => new ConversationItem(null, conv).item
                        )
                    )
                );
            }

            // Child components
            this.$navbar = new Navbar($(".-navbar"));

            // WebSocket
            if (this.ws) {
                this.ws.onMessage = this.onWsMessage.bind(this);
            }
        },

        onWsMessage(msg) {
            console.log("Conversations.onWsMessage: ", msg);
        },

        onNewConversation(conv) {
            const newConv = new ConversationItem(null, conv);
            newConv.setData("dotHidden", false);
            container.insertBefore(newConv.element, container.firstChild);
        },

        onWsMessage(msg) {
            console.log("Conversations onWsMessage: ", msg);

            if (msg.offline_messages) {
                // Offline messages
                return;
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
                    "conversations",
                    JSON.stringify(this.data.conversations)
                );
            } else {
                this.getJSON(
                    `/api/conversations/${msg.conversation_id}/brief`
                ).then((res) => {
                    this.data.conversations.unshift(res);
                    this.onNewConversation(res);
                    localStorage.setItem(
                        "conversations",
                        JSON.stringify(this.data.conversations)
                    );
                });
            }
        }
    },
    Page
);

new Conversations();
