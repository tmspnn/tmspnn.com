var ws = null

export function connect() {
  if (ws !== null) return log("already connected")
  ws = new WebSocket("wss://tmspnn.com/ws/")
  ws.onopen = function () {
    log("connected")
  }
  ws.onerror = function (error) {
    log(error)
  }
  ws.onmessage = function (e) {
    log("recv: " + e.data)
  }
  ws.onclose = function () {
    log("disconnected")
    ws = null
  }
  return false
}

export function disconnect() {
  if (ws === null) return log("already disconnected")
  ws.close()
  return false
}

export function send() {
  if (ws === null) return log("please connect first")
  var text = "send: xxxxx from js"
  log(text)
  ws.send(text)
  return false
}

function log(text) {
  console.log(text)
}
