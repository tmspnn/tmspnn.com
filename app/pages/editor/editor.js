import { debounce } from "lodash";
import { $ } from "k-dom";
import { parseJSON, Klass } from "k-util";
import CodeTool from "@editorjs/code";
import ColorPlugin from "editorjs-text-color-plugin";
import Delimiter from "@editorjs/delimiter";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import ImageTool from "@editorjs/image";
import InlineCode from "@editorjs/inline-code";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";

import "./editor.scss";
import Page from "../../components/Page";
import Navbar from "../../components/Navbar/Navbar";
import uploadFile from "../../helpers/uploadFile";

const editorProto = {
    navbar: new Navbar({
        leftBtn: "close",
        rightBtn: "publish"
    }),

    constructor() {
        this.Super();
        this.listen();
        this.storagePrefix = `uid(${this.data.uid}):`;

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
                image: {
                    class: ImageTool,
                    config: {
                        buttonContent: "选择图片",
                        captionPlaceholder: "添加图片描述...",
                        uploader: {
                            uploadByFile: (file) => {
                                return Promise.resolve(
                                    uploadFile(file, {
                                        uid: this.data.uid,
                                        ossPolicy: this.data.oss_policy,
                                        ossSignature: this.data.oss_signature
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
                delimiter: Delimiter,
                Color: {
                    class: ColorPlugin,
                    config: {
                        colorCollections: [
                            "#FF1300",
                            "#EC7878",
                            "#9C27B0",
                            "#673AB7",
                            "#3F51B5",
                            "#0070FF",
                            "#03A9F4",
                            "#00BCD4",
                            "#4CAF50",
                            "#8BC34A",
                            "#CDDC39",
                            "#4d4d4d"
                        ],
                        defaultColor: "#FF1300",
                        type: "text"
                    }
                }
            },
            i18n: {
                messages: {
                    ui: {},
                    toolNames: {
                        Text: "文本",
                        Heading: "标题",
                        List: "列表",
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
            data: parseJSON(
                localStorage.getItem(this.storagePrefix + "editor.localData")
            ) || {
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
    },

    saveContent: debounce(function () {
        this.editor.save().then((d) => {
            localStorage.setItem(
                this.storagePrefix + "editor.localData",
                JSON.stringify(d)
            );
        });
    }, 1000),

    close() {
        this.stepBack();
    },

    publish() {
        this.refs.publishOptions.hidden = false;
        document.documentElement.style.overflow = "hidden";

        requestAnimationFrame(() => {
            this.refs.optionsPanel.addClass("visible");
        });

        // this.editor
        //     .save()
        //     .then((d) => this.postJSON("/api/articles", d))
        //     .then((res) => {
        //         this.toast("发布成功");
        //         localStorage.removeItem(
        //             this.storagePrefix + "editor.localData"
        //         );
        //         setTimeout(() => {
        //             location.replace("/articles/" + res.id);
        //         }, 1800);
        //     });
    },

    hideOptionsPanel(e) {
        if (e.target == this.refs.publishOptions) {
            this.refs.optionsPanel.removeClass("visible");

            setTimeout(() => {
                this.refs.publishOptions.hidden = true;
                document.documentElement.style.overflow = "hidden auto";
            }, 200);
        }
    },

    clickCover() {
        $("#cover-input").click();
    },

    checkPrivateOption(e) {
        e.currentTarget.toggleClass("checked");
    }
};

new (Klass(editorProto, Page))();
