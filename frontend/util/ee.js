import EventEmitter from "events"

const win = window

function isEventEmitter(o) {
  return o instanceof Object && typeof o.emit == "function" && typeof o.on == "function"
}

let ee = win._ee

if (!isEventEmitter(ee)) {
  win._ee = ee = new EventEmitter()
}

export default ee