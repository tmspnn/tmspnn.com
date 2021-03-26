// @External
import { Base64 } from "js-base64";

// @Local
import MeModel from "./MeModel";

const meModel = new MeModel();
export default class MeController extends Controller {
    blocked = false;

    constructor() {
        super("me");
    }

    clickEditBtn = _.throttle(() => {
        this.ui("dialogUserMeta::show");
    }, 2000);

    changeBgImage = (args) => {
        const { file } = args;
        this.uploadFile(file, (url) => {
            meModel.setUserProps({ bg_image: url });
            this.ui("dialogUserMeta::setBgImage", { url });
        });
    };

    changeProfile = (args) => {
        const { file } = args;
        this.uploadFile(file, (url) => {
            meModel.setUserProps({ profile: url });
            this.ui("dialogUserMeta::setProfile", { url });
        });
    };

    submitUserMeta = (args) => {
        if (this.blocked) return;

        this.blocked = true;
        this.ui("customSpinner::show");

        const { bgImage, profile, nickname, desc, district } = args;

        xhr({
            url: `/api/users/${meModel.user.id}`,
            method: "put",
            contentType: "application/json",
            data: JSON.stringify({
                bg_image: bgImage || meModel.user.bg_image,
                profile: profile || meModel.user.profile,
                nickname,
                desc,
                district
            }),
            success: () => {
                this.ui("me::setUserMeta", args);
            },
            fail: (e) => {
                this.toast(
                    isJSON(e.message) ? JSON.parse(e.message).err : e.message
                );
                this.ui("customSpinner::hide");
            },
            final: () => {
                this.blocked = false;
                this.ui("customSpinner::hide");
            }
        });
    };

    uploadFile = (file, cb) => {
        this.blocked = true;
        this.ui("customSpinner::show");

        const { policy, signature } = meModel;
        const uid = meModel.user.id;
        const dateStr = new Date()
            .toISOString()
            .slice(0, 10)
            .split("-")
            .join("/");
        const fileNameBase64 = Base64.encode(file.name);
        const key = `public/users/${uid}/${dateStr}/${fileNameBase64}`;

        uploadToOSS({
            file,
            key,
            policy,
            signature,
            onProgress: (progressEvent) => {
                const { loaded, total } = progressEvent;
                this.ui("progressBar::setProgress", {
                    completionRate: loaded / total
                });
            },
            cb: () => {
                cb("https://oss.tmspnn.com/" + key);
            },
            fail: (e) => {
                const err = isJSON(e.message)
                    ? JSON.parse(e.message).err
                    : e.message;
                this.toast(err);
            },
            final: () => {
                this.blocked = false;
                this.ui("customSpinner::hide");
            }
        });
    };

    toast = (texts) => {
        this.ui("toast::show", { texts });
    };
}
