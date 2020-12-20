import "./xhr.scss";
import { view, controller } from "../mvc";

export default function xhr() {
  const xhrDiv = document.querySelector(".-xhr") as HTMLDivElement;
  const progressDiv = xhrDiv.querySelector(".progress") as HTMLDivElement;

  function makeRequest(options: {
    url: string;
    method?: "get" | "post" | "put" | "delete";
    blocking?: boolean;
    withProgressBar?: boolean;
    contentType?: string;
    headers?: { [k: string]: string };
    withCredentials?: boolean;
    data?: null | string | FormData;
    success: (res: string | Document | ArrayBuffer | Blob) => void;
    fail?: (err: Error) => void;
    final?: (x: XMLHttpRequest) => void;
  }) {
    const {
      url,
      method,
      blocking,
      withProgressBar,
      contentType,
      headers,
      withCredentials,
      data,
      success,
      fail,
      final
    } = options;
    const x = new XMLHttpRequest();
    x.open((method || "get").toUpperCase(), url, true);

    if (contentType) {
      x.setRequestHeader("Content-Type", contentType);
    }

    if (headers) {
      for (let h in headers) {
        if (headers.hasOwnProperty(h)) {
          x.setRequestHeader(h, headers[h]);
        }
      }
    }

    x.withCredentials = withCredentials || false;
    x.onload = onXHRLoad;
    x.onerror = onXHRError;
    x.onprogress = onXHRProgress;
    x.upload.onprogress = onXHRProgress;

    xhrDiv.hidden = withProgressBar == false;

    if (blocking) {
      controller.render("showSpinner");
    }

    x.send(data || null);

    function onXHRLoad(e: ProgressEvent) {
      if (x.status >= 200 && x.status < 400) {
        try {
          success(x.response);
        } catch (e) {
          fail && fail(e);
        } finally {
          final && final(x);
          onXHRComplete();
        }
      } else {
        onXHRError();
      }
    }

    function onXHRError() {
      try {
        fail && fail(new Error(x.response || x.statusText));
      } finally {
        final && final(x);
        onXHRComplete();
      }
    }

    function onXHRComplete() {
      xhrDiv.hidden = true;
      controller.render("hideSpinner");
    }

    function onXHRProgress(e: ProgressEvent) {
      if (e.lengthComputable) {
        updateProgressBar(e.loaded / e.total);
      }
    }
  }

  function getJSON(arg: {
    url: string;
    cb: (json: JSON) => void;
    onError?: (err: Error) => void;
    final?: (x: XMLHttpRequest) => void;
  }) {
    makeRequest({
      url: arg.url,
      success(resText) {
        arg.cb(JSON.parse(resText as string));
      },
      fail: arg.onError,
      final: arg.final
    });
  }

  function postJSON(arg: {
    url: string;
    data: JSON;
    cb: (json: JSON) => void;
    onError?: (err: Error) => void;
    final?: (x: XMLHttpRequest) => void;
  }) {
    makeRequest({
      url: arg.url,
      method: "post",
      contentType: "application/json",
      data: JSON.stringify(arg.data),
      success(resText) {
        arg.cb(JSON.parse(resText as string));
      },
      fail: arg.onError,
      final: arg.final
    });
  }

  function postFormData(arg: {
    url: string;
    data: FormData;
    cb: (res: string | Document | ArrayBuffer | Blob) => void;
    onError?: (err: Error) => void;
    final?: (x: XMLHttpRequest) => void;
  }) {
    makeRequest({
      url: arg.url,
      method: "post",
      data: arg.data,
      success: arg.cb,
      fail: arg.onError,
      final: arg.final
    });
  }

  function updateProgressBar(completionRate: number) {
    const transform = `translate3d(0, -${100 * (1 - completionRate)}%, 0)`;
    progressDiv.style.transform = transform;
    progressDiv.style.webkitTransform = transform;
  }

  view.makeXHR = makeRequest;
  view.getJSON = getJSON;
  view.postJSON = postJSON;
  view.postFormData = postFormData;
}
