// External modules
import { $ } from "k-dom";
import { Klass } from "k-util";
import qs from "qs";

// Local modules
import "./settings.scss";
import uploadFile from "../../helpers/uploadFile";
import Page from "../../components/Page";
import Navbar from "../../components/Navbar/Navbar";

const Settings = Klass(
    {
        constructor() {
            this.Super();
            this.element = document.body;
            this.listen();

            new Navbar({ leftBtn: "back" });

            // WebSocket
            if (this.ws) {
                this.ws.onMessage = this.onWsMessage.bind(this);
            }
        },

        onWsMessage(msg) {
            console.log("Settings.onWsMessage: ", msg);
        },

        onBlur() {
            const maxScrollTop = Math.max(
                0,
                this.refs.root.scrollHeight - window.innerHeight
            );
            if (this.refs.root.scrollTop > maxScrollTop) {
                this.refs.root.scrollTop = maxScrollTop;
            }
        },

        clickBgImage() {
            this.refs.bgInput.click();
        },

        clickProfile() {
            this.refs.profileInput.click();
        },

        onBgImage() {
            const file = this.refs.bgInput.files[0];

            if (!file) return;

            uploadFile(file, {
                uid: this.data.uid,
                ossPolicy: this.data.oss_policy,
                ossSignature: this.data.oss_signature
            })
                .then((filepath) => {
                    this.data.user.bg_image = filepath;
                    return this.getJSON(
                        `/api/users/${this.data.uid}/auth-keys?` +
                            qs.stringify({ filepath })
                    );
                })
                .then((res) => {
                    const url = `https://oss.tmspnn.com/${this.data.user.bg_image}?auth_key=${res.auth_key}`;
                    this.refs.bgImage.style.backgroundImage = `url(${url})`;
                });
        },

        onProfile() {
            const file = this.refs.profileInput.files[0];

            if (!file) return;

            uploadFile(file, {
                uid: this.data.uid,
                ossPolicy: this.data.oss_policy,
                ossSignature: this.data.oss_signature
            })
                .then((filepath) => {
                    this.data.user.profile = filepath;
                    return this.getJSON(
                        `/api/users/${this.data.uid}/auth-keys?` +
                            qs.stringify({ filepath })
                    );
                })
                .then((res) => {
                    const url = `https://oss.tmspnn.com/${this.data.user.profile}?auth_key=${res.auth_key}`;
                    this.refs.profile.style.backgroundImage = `url(${url})`;
                });
        },

        submit() {
            const data = {
                bgImage: this.data.user.bg_image,
                profile: this.data.user.profile,
                nickname: this.refs.nickname.value.trim(),
                description: this.refs.description.value.trim(),
                location: this.refs.location.value.trim()
            };
            this.putJSON(`/api/users/${this.data.uid}`, data).then(() => {
                this.toast("更新成功!");
            });
        }
    },
    Page
);

new Settings();
