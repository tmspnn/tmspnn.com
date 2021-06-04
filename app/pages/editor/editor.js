// External modules
import { Base64 } from "js-base64";
import CodeTool from "@editorjs/code";
import Delimiter from "@editorjs/delimiter";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import ImageTool from "@editorjs/image";
import InlineCode from "@editorjs/inline-code";
import List from "@editorjs/list";
import LinkTool from "@editorjs/link";
import Quote from "@editorjs/quote";

// Local modules
import "./editor.scss";
import Page from "@components/Page";
import PageController from "@components/PageController";

const namespace = "editor";

/**
 * @property {HTMLBodyElement} root._element
 * @property {Object} root._data
 */
const root = new Page(namespace);
root.editor = new EditorJS({
    holder: "editorjs",
    placeholder: "写点什么吧...",
    tools: {
        header: {
            class: Header,
            config: {
                placeholder: "请输入标题...",
                levels: [1, 2, 3]
            }
        },
        list: List,
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
                    uploadByFile: (file) => {
                        return Promise.resolve(
                            ctrl.upload(file).then((url) => {
                                return {
                                    success: 1,
                                    file: { url }
                                };
                            })
                        );
                    },
                    uploadByUrl: (url) => {
                        return Promise.resolve({
                            success: 1,
                            file: { url }
                        });
                    }
                }
            }
        },
        code: CodeTool,
        inlineCode: InlineCode,
        quote: Quote,
        delimiter: Delimiter
    },
    i18n: {
        messages: {
            ui: {},
            toolNames: {
                Text: "文本",
                Heading: "标题",
                List: "列表",
                Link: "链接",
                Image: "图片/视频",
                Code: "代码",
                InlineCode: "代码",
                Quote: "引用"
            },
            tools: {
                stub: {
                    "The block can not be displayed correctly.":
                        "该格式无法显示"
                }
            },
            blockTunes: {
                linkTool: {
                    Link: "链接地址"
                },
                image: {
                    Caption: "图片名称"
                }
            }
        }
    },
    data: root._data.data ||
        parseJSON(localStorage.getItem("editor.localData")) || {
            blocks: [
                {
                    type: "header",
                    data: {
                        text: "",
                        level: 1
                    }
                }
            ]
        }
});

document.body.on(
    "input",
    _.debounce(() => {
        root.editor.save().then((d) => {
            localStorage.setItem("editor.localData", JSON.stringify(d));
        });
    }, 500)
);

$(".close-btn").on("click", () => {
    if (ctrl.data.blocked) return;
    if (history.state.from) {
        history.back();
    } else {
        location.href = "/";
    }
});

$(".publish-btn").on("click", () => {
    if (ctrl.data.blocked) return;
    root.editor.save().then((d) => {
        root.dispatch("publishArticle", d);
    });
});

/**
 * @property {Boolean} ctrl.data.blocked
 */
const ctrl = new PageController(namespace);
ctrl.data.ossEntry = "https://tmspnn.obs.cn-east-2.myhuaweicloud.com";
ctrl.data.accessKey = "Q5VTYEW1FGZCSAQYEPAX";

ctrl.upload = (file) => {
    const userId = ctrl.data.user_id;
    const dateStr = new Date().toISOString().slice(0, 10).split("-").join("/");
    const fileNameBase64 = Base64.encode(file.name);
    const key = `public/users/${userId}/${dateStr}/${fileNameBase64}`;

    const fd = new FormData();
    fd.append("policy", ctrl.data.oss_policy);
    fd.append("signature", ctrl.data.oss_signature);
    fd.append("key", key);
    fd.append("AccessKeyId", ctrl.data.accessKey);
    fd.append("x-obs-acl", "public-read");
    fd.append("Content-Type", file.type);
    fd.append("file", file, file.name);

    return kxhr(ctrl.data.ossEntry, "post", fd).then(
        () => `${ctrl.data.ossEntry}/${key}`
    );
};

ctrl.publishArticle = (d) => {
    ctrl.postJson("/api/articles", d)
        .then((res) => {
            ctrl.toast("发布成功");
            localStorage.removeItem("editor.localData");
            setTimeout(() => {
                location.href = "/articles/" + res.id;
            }, 1800);
        })
        .catch(ctrl.handleException);
};
