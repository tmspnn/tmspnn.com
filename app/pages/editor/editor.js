// External modules
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import LinkTool from "@editorjs/link";
import ImageTool from "@editorjs/image";
import CodeTool from "@editorjs/code";
import InlineCode from "@editorjs/inline-code";
import Quote from "@editorjs/quote";

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
    placeholder: "写点什么吧...",
    tools: {
        header: {
            class: Header,
            inlineToolbar: true,
            shortcut: "CMD+SHIFT+H",
            config: {
                placeholder: "请输入标题",
                levels: [2, 3, 4],
                defaultLevel: 2
            }
        },
        list: {
            class: List,
            inlineToolbar: true
        },
        linkTool: {
            class: LinkTool,
            config: {
                endpoint: "/api/url-meta"
            }
        },
        image: {
            class: ImageTool,
            config: {
                uploader: {
                    uploadByFile(file) {
                        return MyAjax.upload(file).then(() => {
                            return {
                                success: 1,
                                file: {
                                    url: "https://codex.so/upload/redactor_images/o_80beea670e49f04931ce9e3b2122ac70.jpg"
                                }
                            };
                        });
                    },
                    uploadByUrl(url) {
                        return MyAjax.upload(file).then(() => {
                            return {
                                success: 1,
                                file: {
                                    url: "https://codex.so/upload/redactor_images/o_e48549d1855c7fc1807308dd14990126.jpg"
                                }
                            };
                        });
                    }
                }
            }
        },
        code: CodeTool,
        inlineCode: InlineCode,
        quote: Quote
    }
});

const ctrl = new PageController(namespace);

ctrl.handleException = (e) => {
    if (isJSON(e.message)) {
        const { err } = parseJSON(e.message);
        ctrl.toast(err || "服务器繁忙, 请稍后再试.");
    }
};
