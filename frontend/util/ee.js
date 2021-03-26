import EventEmitter from "events";

function isEventEmitter(o) {
    return (
        o instanceof Object &&
        typeof o.emit == "function" &&
        typeof o.on == "function"
    );
}

let ee = window._ee;

if (!isEventEmitter(ee)) {
    ee = new EventEmitter();
    ee.setMaxListeners(1e4);
    window._ee = ee;
}

export default ee;
