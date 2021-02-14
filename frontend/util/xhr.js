export default function xhr(args) {
  const {
    url,
    method,
    contentType,
    headers,
    withCredentials,
    data,
    onProgress,
    success,
    fail,
    final
  } = args

  const x = new XMLHttpRequest()
  x.open((method || "get").toUpperCase(), url, true)

  if (contentType) {
    x.setRequestHeader("Content-Type", contentType)
  }

  if (headers) {
    for (let h in headers) {
      if (headers.hasOwnProperty(h)) {
        x.setRequestHeader(h, headers[h])
      }
    }
  }

  if (onProgress) {
    x.onprogress = onProgress
    x.upload.onprogress = onProgress
  }

  x.withCredentials = withCredentials || false
  x.onload = onXHRLoad
  x.onerror = onXHRError
  x.send(data || null)

  function onXHRLoad(e) {
    if (x.status >= 200 && x.status < 400) {
      try {
        success(x.response)
      } catch (e) {
        fail && fail(e)
      } finally {
        final && final(x)
      }
    } else {
      onXHRError()
    }
  }

  function onXHRError() {
    try {
      fail && fail(new Error(x.response || x.statusText))
    } finally {
      final && final(x)
    }
  }
}

export function getJSON(args) {
  xhr({
    url: args.url,
    success(response) {
      args.cb(JSON.parse(response))
    },
    fail: args.fail,
    final: args.final
  })
}

export function postJSON(args) {
  xhr({
    url: args.url,
    method: "post",
    contentType: "application/json",
    data: JSON.stringify(args.data),
    success: args.cb,
    fail: args.fail,
    final: args.final
  })
}

export function postFormData(args) {
  xhr({
    url: args.url,
    method: "post",
    data: args.data,
    onProgress: args.onProgress,
    success: args.cb,
    fail: args.fail,
    final: args.final
  })
}
