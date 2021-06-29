// External modules
import { DOM } from "k-dom";
import { Klass, View } from "k-util";

// Local modules
import T from "./Message.html";

const assign = Object.assign;

const Message = Klass(
    {
        constructor(data) {
            this.Super();
            this.element = DOM(T);

            this.setData(
                assign(data, {
                    profile: data.profile
                        ? `url(${data.profile})`
                        : "linear-gradient(135deg, var(--grey), var(--black))",
                    textClassName:
                        "text " + (data.sentBySelf ? "to-left" : "to-right"),
                    timeText: dayjs(data.created_at).format("MM-DD HH:mm:ss"),
                    text: data.text
                })
            );

            if (!data.sentBySelf) {
                this.element.appendChild(this.element.firstElementChild);
            }

            this.listen();
        }
    },
    View
);

export default Message;
