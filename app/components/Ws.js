export default class Ws {
    origin = "https://tmspnn.com";

    url = "wss://tmspnn.com/ws/";

    // Local connection
    conn = null;

    // Global state: offline | online | connecting | syncing | closed
    globalState = null;

    timeoutId = null;

    intervalId = null;

    createdAt = Date.now();

    retryTimes = 3;

    triedTimes = 0;

    constructor() {
        // Process messages from other tabs.
        window.addEventListener(
            "storage",
            _.debounce(() => {
                if (document.hasFocus()) return;

                const state = localStorage.getItem("ws.state");
                const msg = localStorage.getItem("ws.message");

                if (state != this.globalState) {
                    this.onStateChange(state);
                }

                if (typeof this.onMessage == "function") {
                    this.onMessage(parseJSON(msg));
                }
            }, 500)
        );

        localStorage.setItem("ws.state", "syncing");

        // If there's no active connection, create one.
        this.timeoutId = setTimeout(this.connect, 1000);

        // Synchronize every minute
        setInterval(() => {
            if (!this.conn || this.conn.readyState != 1) {
                this.timeoutId = setTimeout(this.connect, 1000);
                localStorage.setItem("ws.state", "syncing");
            }
        }, 60000);
    }

    isOnline = () => {
        return this.conn && this.conn.readyState == 1;
    };

    onStateChange = (state) => {
        switch (state) {
            case "syncing":
                if (this.isOnline()) {
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
                this.globalState = "connecting";
                clearTimeout(this.timeoutId);
                break;
            case "online":
                this.globalState = "online";
                clearTimeout(this.timeoutId);
                break;
            default:
                break;
        }
    };

    connect = () => {
        this.globalState = "connecting";
        localStorage.setItem("ws.state", "connecting");

        if (this.conn) this.conn.close();
        clearInterval(this.intervalId);
        clearTimeout(this.timeoutId);

        this.conn = new WebSocket(this.url);

        this.conn.onopen = () => {
            this.conn.send(JSON.stringify({ type: "ping" }));

            // Timeout is one minute, keep connection alive with
            // a interval ping every 55 seconds
            this.intervalId = setInterval(() => {
                if (this.isOnline()) {
                    this.conn.send(JSON.stringify({ type: "ping" }));
                }
            }, 55000);

            this.globalState = "online";
            localStorage.setItem("ws.state", "online");
        };

        this.conn.onmessage = (e) => {
            const msg = e.data;

            if (typeof this.onMessage == "function") {
                this.onMessage(parseJSON(msg));
            }

            this.globalState = "online";
            localStorage.setItem("ws.state", "online");
            localStorage.setItem("ws.message", msg);
        };

        this.conn.onerror = (e) => {
            if (++this.triedTimes < this.retryTimes) {
                this.connect(onSuccess, onFail);
            } else {
                this.triedTimes = 0;
            }
        };

        this.conn.onclose = () => {
            this.globalState = "closed";
            localStorage.setItem("ws.state", "closed");
        };
    };
}
