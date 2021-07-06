// External modules
import { $ } from "k-dom";
import { Klass } from "k-util";
import { debounce } from "lodash";
import CodeTool from "@editorjs/code";
import ColorPlugin from "editorjs-text-color-plugin";
import Delimiter from "@editorjs/delimiter";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import ImageTool from "@editorjs/image";
import InlineCode from "@editorjs/inline-code";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";

// Local modules
import "./commentEditor.scss";
import Page from "../../components/Page";
import Navbar from "../../components/Navbar/Navbar";
import uploadFile from "../../helpers/uploadFile";

const CommentEditor = Klass(
    {
        constructor() {
            this.Super();
            this.listen();
            this.storagePrefix = `uid(${this.data.uid}):`;

            this.editor = new EditorJS({
                holder: "editorjs",
                placeholder: "请输入评论...",
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
                                "#FFF"
                            ],
                            defaultColor: "#FF1300",
                            type: "text"
                        }
                    },
                    Marker: {
                        class: ColorPlugin,
                        config: {
                            defaultColor: "#FFBF00",
                            type: "marker"
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
                data:
                    this.data.data ||
                    parseJSON(
                        localStorage.getItem(
                            this.storagePrefix + "commentEditor.localData"
                        )
                    ) ||
                    {}
            });

            // Child components
            new Navbar($(".-navbar"), {
                leftBtn: "close",
                rightBtn: "publish"
            });
        },

        saveContent: debounce(function () {
            this.editor.save().then((d) => {
                localStorage.setItem(
                    this.storagePrefix + "commentEditor.localData",
                    JSON.stringify(d)
                );
            });
        }, 1000),

        publish() {
            this.editor
                .save()
                .then((d) => {
                    this.postJSON(
                        `/api/articles/${this.data.article_id}/comments`,
                        d
                    );
                })
                .then(() => {
                    ctrl.toast("发布成功");
                    localStorage.removeItem(
                        this.storagePrefix + "commentEditor.localData"
                    );
                    setTimeout(() => {
                        if (history.state.prev) {
                            location.replace(history.state.prev);
                        } else {
                            location.replace(
                                "/articles/" + this.data.article_id
                            );
                        }
                    }, 1800);
                });
        }
    },
    Page
);

new CommentEditor();
