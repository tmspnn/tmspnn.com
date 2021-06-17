// External modules

// Local modules
import "@components/feed.scss";
import "./author.scss";
import Page from "@components/Page";
import navbar from "@components/navbar/navbar";
import comment from "../article/comment";

function author() {
    const pageName = location.pathname;

    const root = new Page(pageName);

    // Child components
    root.$navbar = navbar(pageName, $(".-navbar"), {});
    root.$navbar.showBackBtn();

    root.$comments = $$(".-comment").map((el, idx) => {
        return comment(pageName, el, root.data.comments[idx]);
    });

    // UI logic
    const { _refs } = root;

    root.onFollowshipChange = ({ followed }) => {
        if (followed) {
            _refs.followingState.textContent = "已关注";
        } else {
            _refs.followingState.textContent = "关注";
        }
    };

    _refs.followBtn.on("click", () => root.dispatch("clickFollowBtn"));

    _refs.messageBtn.on("click", () => root.dispatch("startConversation"));

    // Business logic
    const { ctrl } = root;

    ctrl.onWsMessage = (msg) => {
        console.log("author onWsMessage: ", msg);
    };

    ctrl.clickBackBtn = () => {
        const from = at(history, "state.from");
        if (from) {
            history.back();
        } else {
            location.replace("/");
        }
    };

    ctrl.clickFollowBtn = () => {
        ctrl.putJson(`/api/users/${ctrl.data.author.id}/followers`)
            .then((res) => {
                ctrl.ui("root::onFollowshipChange", res);
            })
            .catch(ctrl.handleException);
    };

    ctrl.startConversation = () => {
        if (!ctrl.data.uid) {
            return root.go("/sign-in");
        }

        const localConversations = localStorage.getItem("conversations");

        if (localConversations) {
            const reuseableConversation = parseJSON(localConversations).filter(
                (c) => {
                    if (
                        c.created_by == ctrl.data.uid &&
                        c.members.length == 1 &&
                        c.members[0] == ctrl.data.author.id
                    ) {
                        return true;
                    }

                    if (
                        c.created_by == ctrl.data.author.id &&
                        c.members.length == 1 &&
                        c.members[0] == ctrl.data.uid
                    ) {
                        return true;
                    }

                    return false;
                }
            )[0];

            if (reuseableConversation) {
                return root.go("/conversations/" + reuseableConversation.id);
            }
        }

        ctrl.postJson("/api/conversations", { with: ctrl.data.author.id })
            .then((res) => root.go("/conversations/" + res.id))
            .catch(ctrl.handleException);
    };
}

author();
