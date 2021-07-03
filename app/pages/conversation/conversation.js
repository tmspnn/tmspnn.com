// External modules
// External modules
import { isEmpty } from "lodash";
import { $ } from "k-dom";
import { Klass } from "k-util";

// Local modules
import "./conversation.scss";
import uploadConversationFile from "../../helpers/uploadConversationFile";
import Page from "../../components/Page";
import Message from "./Message";
import Navbar from "../../components/Navbar/Navbar";

const Conversation = Klass(
    {
        text: "",

        constructor() {
            this.Super();
            this.element = $("body");
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

        shortcut() {
            this.refs.shortcuts.toggleClass("visible");
            this.refs.shortcutBtn.toggleClass("active");
            this.refs.input.focus();
        },

        clip() {
            this.refs.fileInput.click();
        },

        onFile() {
            const file = this.refs.fileInput.files[0];
            if (!file) return;

            if (file.size > 2e8) return this.toast("请选择200M以内的文件.");

            return uploadConversationFile(file, {
                convId: this.data.conversation.id,
                ossPolicy: this.data.oss_policy,
                ossSignature: this.data.oss_signature
            }).then((url) => console.log(url));
        },

        onInput(e) {
            this.text = e.currentTarget.value.trim();
            const inputEmpty = this.text.length == 0;

            this.refs.clipBtn.hidden = !inputEmpty;
            this.refs.sendBtn.hidden = inputEmpty;

            e.currentTarget.style.height = "2.2rem";
            e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
        },

        clickShortcut(e) {
            const emoji = e.currentTarget.textContent;
            const input = this.refs.input;

            const selectionStart = input.selectionStart;
            const text = input.value;

            input.value =
                text.slice(0, selectionStart) +
                emoji +
                text.slice(selectionStart);
            input.selectionStart = selectionStart + 2;
            input.selectionEnd = selectionStart + 2;
            input.focus();
            input.dispatchEvent(new Event("input"));
            this.shortcut();
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
                    this.refs.clipBtn.hidden = false;
                    this.refs.sendBtn.hidden = true;
                    this.refs.input.value = "";
                    input.dispatchEvent(new Event("input"));
                });
            }
        }
    },
    Page
);

new Conversation();
