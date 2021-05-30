// External modules
import EditorJS from "@editorjs/editorjs";

// Local modules
import "./editor.scss";
import Page from "@components/Page";
import PageController from "@components/PageController";

const namespace = "editor";

/**
 * @property {Number} root._data.scrollTop
 */
const root = new Page(namespace);
root.editor = new EditorJS({
    holder: "editorjs",
    placeholder: "写点什么吧..."
});

const ctrl = new PageController(namespace);

ctrl.handleException = (e) => {
    if (isJSON(e.message)) {
        const { err } = parseJSON(e.message);
        ctrl.toast(err || "服务器繁忙, 请稍后再试.");
    }
};
