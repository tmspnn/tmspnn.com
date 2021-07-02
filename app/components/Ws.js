import { Klass, parseJSON } from "k-util";

const { CONNECTING, OPEN } = WebSocket;

const Ws = Klass({
    origin: location.origin,

    url: "wss://tmspnn.com/ws/",

    stata: null, // syncing | connecting | online | offline

    message: null,

    timeoutId: null,

    intervalId: null,

    createdAt: Date.now(),

    constructor() {
        // Process messages from other tabs and documents.
        window.addEventListener("storage", () => {
            const state = localStorage.getItem("ws.state");
            const message = localStorage.getItem("ws.message");

            if (state != this.state) {
                this.onState(state);
            }

            if (
                message != this.message &&
                typeof this.onMessage == "function"
            ) {
                this.onMessage(parseJSON(message));
                this.message = message;
            }
        });

        this.sync();

        // Synchronize state every minute
        setInterval(() => this.sync(), 60000);
    },

    sync() {
        /**
         * If there's no active connection, create one.
         * Could be cancelled if there is any active connection in other tabs.
         */
        if (!this.isOnline() && navigator.onLine) {
            this.timeoutId = setTimeout(() => this.connect(), 1000);
            this.state = "syncing";
            this.broadcastState("syncing");
        }
    },

    /**
     * @param {string} msg
     */
    broadcast(msg) {
        localStorage.setItem("ws.message", msg);
        window.dispatchEvent(new Event("storage"));
    },

    /**
     * @param {string} state
     */
    broadcastState(state) {
        localStorage.setItem("ws.state", state);
        window.dispatchEvent(new Event("storage"));
    },

    isOnline() {
        return (
            window._ws &&
            (window._ws.readyState == CONNECTING ||
                window._ws.readyState == OPEN)
        );
    },

    onState(state) {
        switch (state) {
            case "syncing":
                if (this.isOnline()) {
                    this.state = "online";
                    this.broadcastState("online");
                }
                break;
            case "connecting":
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
    },

    connect() {
        if (this.isOnline()) return;

        this.broadcastState("connecting");
        clearInterval(this.intervalId);

        window._ws = new WebSocket(this.url);

        window._ws.onopen = () => {
            window._ws.send("ping");

            /**
             * Timeout is one minute, keep the connection alive with
             * a interval ping every 55 seconds
             */
            this.intervalId = setInterval(() => {
                if (this.isOnline()) {
                    window._ws.send("ping");
                }
            }, 55000);

            this.state = "online";
        };

        window._ws.onmessage = (e) => {
            const msg = e.data;

            this.state = "online";
            this.broadcastState("online");

            this.broadcast(msg);
        };

        window._ws.onerror = (e) => {
            if (typeof this.onError == "function") {
                this.onError(e);
            }
        };

        window._ws.onclose = () => {
            this.state = "offline";
            clearInterval(this.intervalId);
        };
    }
});

export default Ws;
