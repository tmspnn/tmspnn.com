// External modules
import { $ } from "k-dom";
import { includes } from "lodash";
import { Klass } from "k-util";

// Local modules
import "./author.scss";
import "../../components/feed.scss";
import Page from "../../components/Page";
import Navbar from "../../components/Navbar/Navbar";

const Author = Klass(
    {
        constructor() {
            this.Super();
            this.element = $("#root");
            this.setData({
                followBtnText: this.data.author.followed ? "已关注" : "关注"
            });
            this.listen();

            // Child components
            new Navbar($(".-navbar"), { leftBtn: "back" });

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
            this.setData({
                followBtnText: fl.followed ? "已关注" : "关注"
            });
        },

        startConversation() {
            if (!this.data.uid) {
                return window._container.go("/sign-in");
            }

            const localConvs = localStorage.getItem("conversations");

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
                    return window._container.go(
                        "/conversations/" + reuseableConv.id
                    );
                }
            }

            this.postJSON("/api/conversations", {
                with: this.data.author.id
            }).then((res) => window._container.go("/conversations/" + res.id));
        }
    },
    Page
);

new Author();
