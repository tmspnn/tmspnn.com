/**
 * @property {string} origin
 * @property {string} url
 * @property {WebSocket} conn
 * @property {string} state -- syncing | online | connecting | offline
 * @property {string} message
 * @property {number} timeoutId
 * @property {number} intervalId
 * @property {number} createdAt
 * @property {number} retryTimes
 * @property {number} triedTimes
 */
export default class Ws {
    origin = "https://tmspnn.com";

    url = "wss://tmspnn.com/ws/";

    conn = null;

    state = null;

    message = null;

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

                if (this.state != state) {
                    this.onStateChange(state);
                }

                if (
                    this.message != msg &&
                    typeof this.onMessage == "function"
                ) {
                    this.onMessage(parseJSON(msg));
                    this.message = msg;
                }
            }, 500)
        );

        localStorage.setItem("ws.state", "syncing");

        // If there's no active connection, create one.
        this.timeoutId = setTimeout(this.connect, 1000);

        // Synchronize every minute
        setInterval(() => {
            if (!this.isOnline()) {
                this.state = "syncing";
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
                    this.state = "online";
                    localStorage.setItem("ws.state", "online");
                } else {
                    this.state = "syncing";
                }
                break;
            case "offline":
                this.state = "offline";
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
        if (this.isOnline()) return;

        this.state = "connecting";
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

            this.state = "online";
            localStorage.setItem("ws.state", "online");
        };

        this.conn.onmessage = (e) => {
            const msg = e.data;

            if (typeof this.onMessage == "function") {
                this.onMessage(parseJSON(msg));
            }

            this.state = "online";
            localStorage.setItem("ws.state", "online");
            localStorage.setItem("ws.message", msg);
        };

        this.conn.onerror = (e) => {
            if (typeof this.onError == "function") {
                this.onError(e);
            }

            if (this.isOnline()) return;

            // Retry 3 times to get connected
            if (++this.triedTimes < this.retryTimes) {
                this.connect();
            } else {
                this.triedTimes = 0;
                localStorage.setItem("ws.state", "offline");
            }
        };

        this.conn.onclose = () => {
            this.conn = null;
        };
    };
}
