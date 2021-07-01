// External modules
// External modules
import { $ } from "k-dom";
import { Klass } from "k-util";
import dayjs from "dayjs";

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
            this.element = $("#root");
            // this.setData({
            //     shortcutBtnHidden: false,
            //     clipBtnHidden: false,
            //     audioBtnHidden: true,
            //     sendBtnHidden: true
            // });
            this.listen();

            setTimeout(() => this.scrollToBottom());

            // Child components
            new Navbar($(".-navbar"), { leftBtn: "back" });

            // Event listeners
            document.documentElement.on("pageshow", () => {
                setTimeout(() => this.scrollToBottom(), 50);
            });

            // WebSocket
            if (this.ws) {
                this.ws.onMessage = this.onWsMessage.bind(this);
            }
        },

        onWsMessage(msg) {
            console.log("Conversation.onWsMessage: ", msg);

            if (msg.offline_messages) {
                msg.offline_messages.forEach((m) => {
                    m.sentBySelf = m.created_by == this.data.uid;
                    this.element.appendChild(new Message(m).element);
                });
            } else if (msg.type == "text") {
                msg.sentBySelf = msg.created_by == this.data.uid;
                this.element.appendChild(new Message(msg).element);
            }
        },

        scrollToBottom() {
            this.element.scrollTop = Math.max(
                0,
                this.element.scrollHeight - window.innerHeight
            );
        },

        shortcut() {},

        clip() {},

        onInput(e) {
            this.text = e.currentTarget.value.trim();
            const inputEmpty = text.length == 0;

            this.setData({
                clipBtnHidden: !inputEmpty,
                sendBtnHidden: inputEmpty
            });

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
                        type: "text",
                        text: this.text
                    }
                );
            }
        }
    },
    Page
);

new Conversation();

function conversation() {
    const pageName = location.pathname;

    const root = new Page(pageName);

    // Child components
    root.$navbar = navbar(pageName, $(".-navbar"), {});
    root.$navbar.showBackBtn();

    // UI logic
    const { _refs } = root;
    const container = $(".page-container");

    setTimeout(() => {
        container.scrollTop = Math.max(
            0,
            container.scrollHeight - window.innerHeight
        );
    });

    root.appendMessage = (msg) => {
        const { created_by, type, text, created_at, obj } = msg;
        const sentBySelf = created_by == root.data.uid;
        const profileUrl = obj.profile
            ? `url(${obj.profile})`
            : "linear-gradient(135deg, var(--grey), var(--black))";
        container.appendChild(
            html2DOM(`
            <div class="message">
                ${
                    sentBySelf
                        ? `<div class="profile" style="background-image: ${profileUrl}"></div>`
                        : ""
                }
                <div class="content">
                    <div class="text ${
                        sentBySelf ? "to-left" : "to-right"
                    }">${text}</div>
                    <div class="timestamp">${dayjs(created_at).format(
                        "MM-DD HH:mm:ss"
                    )}</div>
                </div>
                ${
                    sentBySelf
                        ? ""
                        : `<div class="profile" style="background-image: ${profileUrl}"></div>`
                }
            </div>
        `)
        );
        container.scrollTop = Math.max(
            0,
            container.scrollHeight - window.innerHeight
        );
    };

    document.documentElement.on("pageshow", () => {
        setTimeout(() => {
            container.scrollTop = Math.max(
                0,
                container.scrollHeight - window.innerHeight
            );
        });
    });

    _refs.input.on("input", () => {
        const v = _refs.input.value.trim();

        if (v.length > 0) {
            _refs.sendBtn.hidden = false;
            _refs.clipBtn.hidden = true;
        } else {
            _refs.sendBtn.hidden = true;
            _refs.clipBtn.hidden = false;
        }

        // Auto height
        _refs.input.style.height = "2.2rem";
        _refs.input.style.height = _refs.input.scrollHeight + "px";
    });

    _refs.sendBtn.on("click", () => {
        const v = _refs.input.value.trim();

        if (v.length > 0) {
            root.dispatch("sendMessage", v);
        }
    });

    // Business logic
    const { ctrl } = root;

    ctrl.sendMessage = (text) => {
        ctrl.postJson(
            `/api/conversations/${ctrl.data.conversation.id}/messages`,
            {
                type: "text",
                text
            }
        )
            .then(() => {
                // Message sent
            })
            .catch((xhr) => {
                if (xhr.status == 401) {
                    location.href = "/sign-in";
                }
            })
            .catch(ctrl.handleException);
    };

    ctrl.onWsMessage = (msg) => {
        console.log("conversation onWsMessage: ", msg);

        if (!Array.isArray(msg)) return;

        const [type, channel, messageBody] = msg;

        if (type != "message") return;

        const json = parseJSON(messageBody);

        if (json.conversation_id == ctrl.data.conversation.id) {
            ctrl.ui("root::appendMessage", json);
        }
    };

    ctrl.clickBackBtn = () => {
        const from = at(history, "state.from");
        if (from) {
            history.back();
        } else {
            location.replace("/");
        }
    };
}
