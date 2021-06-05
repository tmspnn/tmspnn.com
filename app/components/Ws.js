export default class Ws {
    origin = "https://tmspnn.com";

    url = "wss://tmspnn.com/ws/";

    // Local connection
    conn = null;

    // Global state: offline | online | connecting | syncing
    state = null;

    lastMessage = null;

    timeoutId = null;

    intervalId = null;

    createdAt = Date.now();

    retryTimes = 3;

    triedTimes = 0;

    constructor() {
        window.addEventListener("storage", () => {
            if (document.hasFocus()) return;

            const state = localStorage.getItem("ws.state");
            const msg = parseJSON(localStorage.getItem("ws.message"));

            if (state != this.state) {
                this.onStateChange(state);
            }

            if (
                msg != this.lastMessage &&
                typeof this.onMessage == "function"
            ) {
                this.onMessage(parseJSON(msg));
            }
        });

        localStorage.setItem("ws.state", "syncing");

        this.timeoutId = setTimeout(this.onClose, 1000);

        setInterval(() => {
            localStorage.setItem("ws.state", "syncing");
        }, 60000);
    }

    onStateChange = (state) => {
        switch (state) {
            case "syncing":
                if (this.conn) {
                    this.state = "online";
                    localStorage.setItem("ws.state", "online");
                }
                break;
            case "offline":
                this.timeoutId = setTimeout(
                    this.connect,
                    this.createdAt % 1000 // In case of race condition
                );
                break;
            case "connecting":
                this.state = "connecting";
                clearTimeout(this.timeoutId);
                break;
            case "online":
                this.state = "online";
                clearTimeout(this.timeoutId);
                break;
            default:
                break;
        }
    };

    connect = () => {
        this.state = "connecting";
        localStorage.setItem("ws.state", "connecting");

        this.conn = new WebSocket(this.url);
        this.conn.onopen = () => {
            this.send({ type: "ping" });
            this.intervalId = setInterval(() => {
                this.send({ type: "ping" });
            }, 50000);
            this.state = "online";
            localStorage.setItem("ws.state", "online");
        };
        this.conn.onmessage = (e) => {
            const msg = e.data;
            this.lastMessage = msg;
            if (typeof this.onMessage == "function") {
                this.onMessage(parseJSON(e.data));
            }
            localStorage.setItem("ws.message", e.data);
        };
        this.conn.onerror = this.conn.onclose = this.onClose;
    };

    disconnect = () => {
        if (this.conn) {
            this.conn.onclose = null;
            this.conn.close();
        }
        clearTimeout(this.timeoutId);
        clearInterval(this.intervalId);
    };

    send = (msg) => {
        if (this.conn) {
            this.conn.send(msg instanceof Object ? JSON.stringify(msg) : msg);
        }
    };

    onClose = _.debounce(() => {
        if (this.triedTimes < this.retryTimes) {
            ++this.triedTimes;
            this.conn = null;
            this.state = "offline";
            this.onStateChange("offline");
            localStorage.setItem("ws.state", "offline");
        } else {
            this.triedTimes = 0;
        }
    }, 2000);
}
