const { CONNECTING, OPEN } = WebSocket;

/**
 * @property {string} origin
 * @property {string} url
 * @property {string} state -- syncing | connecting | online | offline
 * @property {string} message
 * @property {number} timeoutId
 * @property {number} intervalId
 * @property {number} createdAt
 */
export default class Ws {
    origin = "https://tmspnn.com";

    url = "wss://tmspnn.com/ws/";

    state = null;

    message = null;

    timeoutId = null;

    intervalId = null;

    createdAt = Date.now();

    constructor() {
        // Process messages from other tabs.
        window.addEventListener(
            "storage",
            _.debounce(() => {
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
            }, 100)
        );

        this.sync();

        // Synchronize every minute
        setInterval(this.sync, 60000);
    }

    sync = () => {
        /**
         * If there's no active connection, create one.
         * Could be cancelled if there is any active connection in other tabs.
         */
        if (!this.isOnline() && navigator.onLine) {
            this.timeoutId = setTimeout(this.connect, 500);
            localStorage.setItem("ws.state", "syncing");
        }
    };

    isOnline = () => {
        return (
            window._ws &&
            (window._ws.readyState == CONNECTING ||
                window._ws.readyState == OPEN)
        );
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
            case "connecting":
                this.state = "connecting";
                clearTimeout(this.timeoutId);
                break;
            case "online":
                this.state = "online";
                clearTimeout(this.timeoutId);
                break;
            case "offline":
                this.state = "offline";
                break;
            default:
                break;
        }
    };

    connect = () => {
        this.state = "connecting";
        localStorage.setItem("ws.state", "connecting");

        if (window._ws) {
            window._ws.close();
            clearInterval(this.intervalId);
        }

        window._ws = new WebSocket(this.url);

        window._ws.onopen = () => {
            window._ws.send(JSON.stringify({ type: "ping" }));

            /**
             * Timeout is one minute, keep then connection alive with
             * a interval ping every 55 seconds
             */
            this.intervalId = setInterval(() => {
                if (this.isOnline()) {
                    window._ws.send(JSON.stringify({ type: "ping" }));
                }
            }, 55000);

            this.state = "online";
            localStorage.setItem("ws.state", "online");
        };

        window._ws.onmessage = (e) => {
            const msg = e.data;

            if (typeof this.onMessage == "function") {
                this.onMessage(parseJSON(msg));
            }

            this.state = "online";
            localStorage.setItem("ws.state", "online");
            localStorage.setItem("ws.message", msg);
        };

        window._ws.onerror = (e) => {
            if (typeof this.onError == "function") {
                this.onError(e);
            }
        };

        window._ws.onclose = () => {
            this.state = "offline";
        };
    };
}
