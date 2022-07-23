import { DOM } from "k-dom";
import { Klass, View } from "k-util";
import dayjs from "dayjs";
//
import T from "./Message.html";
//
const Message = Klass(
    {
        constructor(data) {
            this.Super();
            this.element = DOM(T);
            this.listen();

            this.refs.profile.style.backgroundImage = `url(https://tmspnn.obs.cn-east-2.myhuaweicloud.com/${data.profile})`;

            if (data.sentBySelf) {
                this.refs.text.addClass("to-left");
            } else {
                this.refs.text.addClass("to-right");
                this.element.appendChild(this.element.firstElementChild);
            }

            this.refs.text.textContent = data.text;

            if (data.type == 1) {
                const url =
                    "https://oss.tmspnn.com/" +
                    data.file +
                    "?auth_key=" +
                    data.auth_key;
                this.refs.text.appendChild(DOM(`<img src="${url}">`));
            }

            this.refs.timestamp.textContent = dayjs(data.created_at).format(
                "MM-DD HH:mm:ss"
            );
        }
    },
    View
);

export default Message;
