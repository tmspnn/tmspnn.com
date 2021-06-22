import ConversationItem from "@components/ConversationItem/ConversationItem";
import Page from "@components/Page";
import navbar from "@components/navbar/navbar";
import tabbar from "@components/tabbar/tabbar";

function conversations() {
    const pageName = "conversations";

    const root = new Page(pageName);
    root.data.conversations =
        parseJSON(localStorage.getItem("conversations")) || [];

    const container = $(".page-container");

    if (root.data.conversations.length > 0) {
        const docFrag = document.createDocumentFragment();
        each(root.data.conversations, (conv) => {
            docFrag.appendChild(
                new ConversationItem(pageName, null, conv).element
            );
        });
        container.appendChild(docFrag);
        setTimeout(() => {
            root.$pageContainer.captureLinks();
        });
    }

    root.$navbar = navbar(pageName, $(".-navbar"), {});
    root.$tabbar = tabbar(pageName, $(".-tabbar"), { activeTab: pageName });

    // UI logic
    root.onNewConversation = (conv) => {
        const newConv = new ConversationItem(pageName, null, conv).element;
        newConv.setData("dotHidden", false);
        container.insertBefore(newConv.element, container.firstChild);
        root.$pageContainer.captureLinks();
    };

    // Business logic
    const ctrl = root.ctrl;

    ctrl.clickBackBtn = () => {
        console.log("clickBackBtn");
    };

    ctrl.onWsMessage = (msg) => {
        console.log("conversationS onWsMessage: ", msg);

        if (!Array.isArray(msg)) return;

        const [type, channel, messageBody] = msg;

        const json = parseJSON(messageBody);

        const existedConv = _.find(
            ctrl.data.conversations,
            (c) => c.id == json.conversation_id
        );

        if (existedConv) {
            ctrl.ui(`conversation(${json.conversation_id})::onMessage`, json);
            localStorage.setItem(
                "conversations",
                JSON.stringify(ctrl.data.conversations)
            );
        } else {
            ctrl.getJson(`/api/conversations/${json.conversation_id}/brief`)
                .then((res) => {
                    ctrl.data.conversations.unshift(res);
                    ctrl.ui("root::onNewConversation", res);
                    localStorage.setItem(
                        "conversations",
                        JSON.stringify(ctrl.data.conversations)
                    );
                })
                .catch(ctrl.handleException);
        }
    };
}

conversations();
