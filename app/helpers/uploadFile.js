import { Base64 } from "js-base64";
import { parseJSON } from "k-util";
import qs from "qs";
import kxhr from "k-xhr";

/**
 * @param {File} file
 * @param {Object} options
 * @param {Number} options.uid
 * @param {String} options.accessKey
 * @param {String} options.ossEntry
 * @param {String} options.ossPolicy
 * @param {String} options.ossSignature
 * @param {Boolean} options.private
 * @returns Promise<string>
 */
export default function uploadFile(file, options) {
    const uid = options.uid;
    const dateStr = new Date().toISOString().slice(0, 10).split("-").join("/");
    const fileNameBase64 = Base64.encode(file.name);
    const accessControl = options.private ? "private" : "public";
    const key = `${accessControl}/users/${uid}/${dateStr}/${fileNameBase64}`;

    const fd = new FormData();
    fd.append("AccessKeyId", options.accessKey || "Q5VTYEW1FGZCSAQYEPAX");
    fd.append("policy", options.ossPolicy);
    fd.append("signature", options.ossSignature);
    fd.append("key", key);
    fd.append("x-obs-acl", "public-read");
    fd.append("Content-Type", file.type);
    fd.append("Cache-Control", "max-age=2592000");
    fd.append("file", file, file.name);

    return kxhr(
        options.ossEntry || "https://tmspnn.obs.cn-east-2.myhuaweicloud.com",
        "post",
        fd
    ).then(() => "https://tmspnn.obs.cn-east-2.myhuaweicloud.com/" + key);
}
