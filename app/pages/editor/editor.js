// External modules
import { $ } from "k-dom";
import { Klass } from "k-util";
import { debounce } from "lodash";
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
import Page from "../../components/Page";
import Navbar from "../../components/Navbar/Navbar";
import uploadFile from "../../helpers/uploadFile";

const Editor = Klass(
    {
        constructor() {
            this.Super();
            this.element = $("#root");
            this.setData();
            this.listen();

            this.editor = new EditorJS({
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
                                        uploadFile(file, {
                                            uid: this.data.uid,
                                            ossPolicy: this.data.oss_policy,
                                            ossSignature:
                                                this.data.oss_signature
                                        }).then((url) => {
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
                data: this.data.data ||
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

            // Child components
            new Navbar($(".-navbar"), {
                leftBtn: "close",
                rightBtn: "publish"
            });
        },

        saveContent() {
            debounce(() => {
                this.editor.save().then((d) => {
                    localStorage.setItem("editor.localData", JSON.stringify(d));
                });
            }, 1000);
        },

        publish() {
            this.editor
                .save()
                .then((d) => this.postJSON("/api/articles", d))
                .then(() => {
                    ctrl.toast("发布成功");
                    localStorage.removeItem("editor.localData");
                    setTimeout(() => {
                        location.replace("/articles/" + res.id);
                    }, 1800);
                });
        }
    },
    Page
);

new Editor();
