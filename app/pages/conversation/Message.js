// External modules
import { DOM } from "k-dom";
import { Klass, View } from "k-util";
import dayjs from "dayjs";

// Local modules
import T from "./Message.html";

const Message = Klass(
    {
        constructor(data) {
            this.Super();
            this.element = DOM(T);
            this.listen();

            this.refs.profile.style.backgroundImage = data.profile
                ? `url(${data.profile})`
                : "linear-gradient(135deg, var(--grey), var(--black))";

            if (data.sentBySelf) {
                this.refs.text.addClass("to-left");
            } else {
                this.refs.text.addClass("to-right");
                this.element.appendChild(this.element.firstElementChild);
            }

            this.refs.text.textContent = data.text;
            this.refs.date.textContent = dayjs(data.created_at).format(
                "MM-DD HH:mm:ss"
            );
        }
    },
    View
);

export default Message;
