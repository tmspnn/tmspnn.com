// External modules
import { includes } from "lodash";
import { Klass, parseJSON } from "k-util";

// Local modules
import "./author.scss";
import "../../components/feed.scss";
import Page from "../../components/Page";
import Navbar from "../../components/Navbar/Navbar";

const Author = Klass(
    {
        constructor() {
            this.Super();
            this.listen();
            this.storagePrefix = `uid(${this.data.uid}):`;

            // Child components
            new Navbar({ leftBtn: "back" });

            // WebSocket
            if (this.ws) {
                this.ws.onMessage = this.onWsMessage.bind(this);
            }
        },

        onWsMessage(msg) {
            console.log("Author.onWsMessage: ", msg);
        },

        clickFollowBtn() {
            this.putJSON(`/api/users/${this.data.author.id}/followers`).then(
                (res) => {
                    this.onFollowshipChange(res);
                }
            );
        },

        onFollowshipChange(fl) {
            this.data.author.followed = fl.followed;
            this.refs.followBtnText.textContent = fl.followed
                ? "已关注"
                : "关注";
        },

        conversation() {
            if (!this.data.uid) {
                return this.go("/sign-in");
            }

            const localConvs = localStorage.getItem(
                this.storagePrefix + "conversations"
            );

            if (localConvs) {
                const reuseableConv = parseJSON(localConvs).filter((c) => {
                    return (
                        (c.created_by == this.data.uid ||
                            c.created_by == this.data.author.id) &&
                        c.members.length == 2 &&
                        includes(c.members, this.data.uid) &&
                        includes(c.members, this.data.author.id)
                    );
                })[0];

                if (reuseableConv) {
                    return this.go("/conversations/" + reuseableConv.id);
                }
            }

            this.postJSON("/api/conversations", {
                with: this.data.author.id
            }).then((conv) => {
                const convs = parseJSON(localConvs) || [];
                convs.unshift(conv);
                localStorage.setItem(
                    this.storagePrefix + "conversations",
                    JSON.stringify(convs)
                );
                this.go("/conversations/" + conv.id);
            });
        }
    },
    Page
);

new Author();
