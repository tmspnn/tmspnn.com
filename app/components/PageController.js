import kxhr from "k-xhr";

export default class PageController extends Controller {
    blocked = false;

    constructor(namespace) {
        const dataTag = $('script[type="application/json"');
        const data = parseJSON(at(dataTag, "textContent")) || {};
        super(namespace);
        this.data = data;
    }

    toast = (texts) => {
        this.ui("toast::show", texts);
    };

    block = () => {
        this.blocked = true;
        this.ui("customSpinner::show");
    };

    unblock = () => {
        this.blocked = false;
        this.ui("customSpinner::hide");
    };

    getJson = (url) => {
        if (this.blocked) return;

        this.block();
        return kxhr(url)
            .then((res) => parseJSON(res))
            .finally(() => this.unblock());
    };

    postJson = (url, data, options = {}) => {
        if (this.blocked) return;

        this.block();
        return kxhr(url, "post", JSON.stringify(data), {
            contentType: "application/json",
            ...options
        })
            .then((res) => parseJSON(res))
            .finally(() => this.unblock());
    };

    putJson = (url, data, options = {}) => {
        if (this.blocked) return;

        this.block();
        return kxhr(url, "put", JSON.stringify(data), {
            contentType: "application/json",
            ...options
        })
            .then((res) => parseJSON(res))
            .finally(() => this.unblock());
    };

    del = (url) => {
        if (this.blocked) return;

        this.block();
        return kxhr(url, "delete")
            .then((res) => parseJSON(res))
            .finally(() => this.unblock());
    };
}
