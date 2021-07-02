// External modules
// External modules
import { isEmpty } from "lodash";
import { $ } from "k-dom";
import { Klass } from "k-util";

// Local modules
import "./conversation.scss";
import Page from "../../components/Page";
import Message from "./Message";
import Navbar from "../../components/Navbar/Navbar";

const Conversation = Klass(
    {
        text: "",

        constructor() {
            this.Super();
            this.element = $("body");
            // this.setData({
            //     shortcutBtnHidden: false,
            //     clipBtnHidden: false,
            //     audioBtnHidden: true,
            //     sendBtnHidden: true
            // });
            this.listen();

            if (this.ws) {
                this.ws.onMessage = this.onWsMessage.bind(this);
            }

            new Navbar($(".-navbar"), { leftBtn: "back" });

            setTimeout(() => this.scrollToBottom());

            document.documentElement.on("pageshow", () => {
                setTimeout(() => this.scrollToBottom(), 50);
            });
        },

        onWsMessage(msg) {
            console.log("Conversation.onWsMessage: ", msg);

            if (!msg) return;

            if (!isEmpty(msg.offline_messages)) {
                msg.offline_messages.forEach((m) => {
                    m.sentBySelf = m.created_by == this.data.uid;
                    this.refs.root.appendChild(new Message(m).element);
                });
            } else if (msg.type == 0) {
                msg.sentBySelf = msg.created_by == this.data.uid;
                this.refs.root.appendChild(new Message(msg).element);
            }

            setTimeout(() => this.scrollToBottom(), 50);
        },

        scrollToBottom() {
            this.refs.root.scrollTop = Math.max(
                0,
                this.refs.root.scrollHeight - window.innerHeight
            );
        },

        shortcut() {},

        clip() {},

        onInput(e) {
            this.text = e.currentTarget.value.trim();
            const inputEmpty = this.text.length == 0;

            this.refs.clipBtn.hidden = !inputEmpty;
            this.refs.sendBtn.hidden = inputEmpty;

            e.currentTarget.style = "2.2rem";
            e.currentTarget.style = e.currentTarget.scrollHeight + "px";
        },

        startRecord() {},

        endRecord() {},

        send() {
            if (this.text.length > 0) {
                this.postJSON(
                    `/api/conversations/${this.data.conversation.id}/messages`,
                    {
                        type: 0,
                        text: this.text
                    }
                ).then(() => {
                    this.refs.input.value = "";
                    this.refs.clipBtn.hidden = false;
                    this.refs.sendBtn.hidden = true;
                });
            }
        }
    },
    Page
);

new Conversation();
